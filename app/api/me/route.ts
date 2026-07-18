import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findCustomerByAnyPhone } from "@/lib/crm";

// Identity of the logged-in client: phone from the session, display name
// resolved from the CRM customer record or a previous booking (null if unknown).
export async function GET() {
  const session = await getServerSession(authOptions);
  const phone = ((session?.user as any)?.phone as string | null) || null;
  if (!phone) {
    return NextResponse.json({ error: "يتطلب تسجيل الدخول" }, { status: 401 });
  }
  try {
    const customer = await findCustomerByAnyPhone(phone);
    let name = customer?.name || null;

    if (!name) {
      const lastBooking = await prisma.customizedPackage.findFirst({
        where: { clientPhone: { contains: phone.replace(/\D/g, "").slice(-9) } },
        orderBy: { createdAt: "desc" },
        select: { clientName: true },
      });
      name = lastBooking?.clientName || null;
    }

    return NextResponse.json({ phone, name });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
