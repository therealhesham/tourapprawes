import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export { requireAdmin } from "@/lib/admin-guard";

// ------------------------------------------------------------
// System account codes used by automatic postings
// ------------------------------------------------------------
export const ACC = {
  CASH: "1101",
  BANK: "1102",
  RECEIVABLES: "1201",
  VAT_INPUT: "1301",
  PAYABLES: "2101",
  VAT_OUTPUT: "2301",
  CAPITAL: "3101",
  RETAINED_EARNINGS: "3201",
  PACKAGE_REVENUE: "4101",
  OTHER_REVENUE: "4201",
} as const;

// Default chart of accounts (seeded once, idempotent)
const DEFAULT_ACCOUNTS: { code: string; name: string; type: "ASSET" | "LIABILITY" | "EQUITY" | "REVENUE" | "EXPENSE" }[] = [
  { code: "1101", name: "الصندوق", type: "ASSET" },
  { code: "1102", name: "البنك", type: "ASSET" },
  { code: "1201", name: "العملاء - ذمم مدينة", type: "ASSET" },
  { code: "1301", name: "ضريبة القيمة المضافة - المشتريات", type: "ASSET" },
  { code: "2101", name: "الموردون - ذمم دائنة", type: "LIABILITY" },
  { code: "2301", name: "ضريبة القيمة المضافة - المبيعات", type: "LIABILITY" },
  { code: "3101", name: "رأس المال", type: "EQUITY" },
  { code: "3201", name: "الأرباح المحتجزة", type: "EQUITY" },
  { code: "4101", name: "إيرادات الباقات السياحية", type: "REVENUE" },
  { code: "4201", name: "إيرادات أخرى", type: "REVENUE" },
  { code: "5101", name: "تكاليف الطيران", type: "EXPENSE" },
  { code: "5102", name: "تكاليف الفنادق والإقامة", type: "EXPENSE" },
  { code: "5103", name: "تكاليف النقل الداخلي", type: "EXPENSE" },
  { code: "5104", name: "تكاليف رحلات أخرى", type: "EXPENSE" },
  { code: "5201", name: "الرواتب والأجور", type: "EXPENSE" },
  { code: "5202", name: "الإيجارات", type: "EXPENSE" },
  { code: "5203", name: "التسويق والإعلان", type: "EXPENSE" },
  { code: "5204", name: "اتصالات وإنترنت", type: "EXPENSE" },
  { code: "5205", name: "رسوم بنكية", type: "EXPENSE" },
  { code: "5299", name: "مصروفات عمومية أخرى", type: "EXPENSE" },
];

export async function ensureChartOfAccounts() {
  const count = await prisma.account.count();
  if (count > 0) return;
  await prisma.account.createMany({
    data: DEFAULT_ACCOUNTS.map((a) => ({ ...a, isSystem: true })),
    skipDuplicates: true,
  });
}

export async function getSettings() {
  return prisma.accountingSettings.upsert({
    where: { id: "main" },
    update: {},
    create: { id: "main" },
  });
}

// Cash/bank account receiving or paying funds, by payment method
export function methodAccountCode(method: string): string {
  return method === "CASH" ? ACC.CASH : ACC.BANK;
}

type Tx = Prisma.TransactionClient;

export async function accountIdByCode(tx: Tx, code: string): Promise<string> {
  const acc = await tx.account.findUnique({ where: { code } });
  if (!acc) throw new Error(`الحساب النظامي ${code} غير موجود`);
  return acc.id;
}

export type EntryLine = {
  accountId: string;
  debit?: number | Prisma.Decimal;
  credit?: number | Prisma.Decimal;
  description?: string;
};

// Throws when the target date falls inside a locked accounting period
export async function assertPeriodOpen(tx: Tx, date: Date) {
  const settings = await tx.accountingSettings.findUnique({ where: { id: "main" } });
  if (settings?.lockDate && date <= settings.lockDate) {
    throw new Error(
      `الفترة المحاسبية مقفلة حتى ${settings.lockDate.toISOString().slice(0, 10)} — لا يمكن التسجيل بتاريخ داخلها`
    );
  }
}

export async function logAudit(
  tx: Tx,
  data: { action: string; entity: string; entityId?: string; summary: string }
) {
  await tx.auditLog.create({
    data: {
      action: data.action,
      entity: data.entity,
      entityId: data.entityId || null,
      summary: data.summary,
    },
  });
}

// Creates a balanced journal entry; throws if debits != credits
export async function createJournalEntry(
  tx: Tx,
  data: {
    date: Date;
    description: string;
    reference?: string;
    sourceType?: "MANUAL" | "INVOICE" | "RECEIPT" | "PAYMENT" | "SUPPLIER_INVOICE" | "REVERSAL";
    lines: EntryLine[];
  }
) {
  await assertPeriodOpen(tx, data.date);
  const lines = data.lines
    .map((l) => ({
      accountId: l.accountId,
      debit: new Prisma.Decimal(l.debit ?? 0),
      credit: new Prisma.Decimal(l.credit ?? 0),
      description: l.description || null,
    }))
    .filter((l) => !l.debit.isZero() || !l.credit.isZero());

  if (lines.length < 2) throw new Error("القيد يجب أن يحتوي على طرفين على الأقل");

  const totalDebit = lines.reduce((s, l) => s.plus(l.debit), new Prisma.Decimal(0));
  const totalCredit = lines.reduce((s, l) => s.plus(l.credit), new Prisma.Decimal(0));
  if (!totalDebit.equals(totalCredit)) {
    throw new Error(`القيد غير متوازن: مدين ${totalDebit} ≠ دائن ${totalCredit}`);
  }
  if (totalDebit.isZero()) throw new Error("قيمة القيد لا يمكن أن تكون صفراً");

  return tx.journalEntry.create({
    data: {
      date: data.date,
      description: data.description,
      reference: data.reference || null,
      sourceType: data.sourceType || "MANUAL",
      lines: { create: lines },
    },
    include: { lines: true },
  });
}

// Posts a reversing entry (dated today) for an existing journal entry.
// Original entries are never deleted — this preserves the audit trail.
export async function reverseJournalEntry(tx: Tx, entryId: string, description: string) {
  const original = await tx.journalEntry.findUnique({
    where: { id: entryId },
    include: { lines: true },
  });
  if (!original) throw new Error("القيد الأصلي غير موجود");
  return createJournalEntry(tx, {
    date: new Date(),
    description,
    reference: original.reference || undefined,
    sourceType: "REVERSAL",
    lines: original.lines.map((l) => ({
      accountId: l.accountId,
      debit: l.credit,
      credit: l.debit,
      description: l.description || undefined,
    })),
  });
}

// Recomputes invoice paid amount/status from its active (non-cancelled) receipts
export async function refreshInvoiceStatus(tx: Tx, invoiceId: string) {
  const invoice = await tx.invoice.findUnique({
    where: { id: invoiceId },
    include: { receipts: { where: { cancelledAt: null } } },
  });
  if (!invoice || invoice.status === "CANCELLED") return;
  const paid = invoice.receipts.reduce(
    (s, r) => s.plus(r.amount),
    new Prisma.Decimal(0)
  );
  const status = paid.gte(invoice.total)
    ? "PAID"
    : paid.gt(0)
    ? "PARTIALLY_PAID"
    : "ISSUED";
  await tx.invoice.update({
    where: { id: invoiceId },
    data: { paidAmount: paid, status },
  });
}

// Recomputes supplier invoice paid amount/status from its active payment vouchers
export async function refreshSupplierInvoiceStatus(tx: Tx, supplierInvoiceId: string) {
  const inv = await tx.supplierInvoice.findUnique({
    where: { id: supplierInvoiceId },
    include: { payments: { where: { cancelledAt: null } } },
  });
  if (!inv || inv.status === "CANCELLED") return;
  const paid = inv.payments.reduce(
    (s, p) => s.plus(p.amount).plus(p.vatAmount),
    new Prisma.Decimal(0)
  );
  const status = paid.gte(inv.total) ? "PAID" : paid.gt(0) ? "PARTIALLY_PAID" : "UNPAID";
  await tx.supplierInvoice.update({
    where: { id: supplierInvoiceId },
    data: { paidAmount: paid, status },
  });
}

export function formatDocNumber(prefix: string, n: number): string {
  return `${prefix}-${String(n).padStart(5, "0")}`;
}
