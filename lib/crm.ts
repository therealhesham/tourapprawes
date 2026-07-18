import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export { requireAdmin, requireAdminWithName } from "@/lib/admin-guard";

type Tx = Prisma.TransactionClient;

// Phone numbers arrive in mixed formats (spaces, +966 vs 05...) — store a trimmed,
// digit-only form so the unique constraint actually dedupes customers.
export function normalizePhone(phone: string): string {
  return String(phone).trim().replace(/[^\d+]/g, "");
}

// Finds a customer by phone or creates one — used when a ticket is opened
// for a caller who isn't in the CRM yet.
export async function upsertCustomerByPhone(
  tx: Tx,
  data: { name: string; phone: string; email?: string | null }
) {
  const phone = normalizePhone(data.phone);
  return tx.customer.upsert({
    where: { phone },
    update: {},
    create: {
      name: String(data.name).trim(),
      phone,
      email: data.email || null,
    },
  });
}

// Session phones are canonical (+9665...) while imported customer records may be
// local format (05...). The last 9 digits are the stable part, so match on those.
export async function findCustomerByAnyPhone(phone: string) {
  const digits = normalizePhone(phone).replace(/\D/g, "");
  const last9 = digits.slice(-9);
  if (!last9) return null;
  return prisma.customer.findFirst({ where: { phone: { endsWith: last9 } } });
}

// Backfills the customer table from existing bookings (deduped by phone).
// Idempotent — re-running only inserts phones not seen before.
export async function syncCustomersFromBookings() {
  const bookings = await prisma.customizedPackage.findMany({
    select: { clientName: true, clientPhone: true },
    orderBy: { createdAt: "asc" },
  });

  const seen = new Map<string, string>();
  for (const b of bookings) {
    const phone = normalizePhone(b.clientPhone || "");
    if (!phone || seen.has(phone)) continue;
    seen.set(phone, String(b.clientName || "").trim() || "عميل");
  }
  if (seen.size === 0) return { created: 0 };

  const result = await prisma.customer.createMany({
    data: [...seen.entries()].map(([phone, name]) => ({ name, phone })),
    skipDuplicates: true,
  });
  return { created: result.count };
}
