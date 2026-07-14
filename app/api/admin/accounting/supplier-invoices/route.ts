import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  ensureChartOfAccounts,
  createJournalEntry,
  reverseJournalEntry,
  accountIdByCode,
  formatDocNumber,
  logAudit,
  ACC,
} from "@/lib/accounting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const invoices = await prisma.supplierInvoice.findMany({
      include: {
        expenseAccount: { select: { id: true, code: true, name: true } },
        customizedPackage: { select: { id: true, clientName: true, startDate: true } },
        payments: { where: { cancelledAt: null }, select: { id: true, voucherNumber: true, amount: true, date: true } },
      },
      orderBy: { invoiceNumber: "desc" },
    });
    return NextResponse.json(invoices);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Records a credit purchase: Dr expense (+ Dr input VAT) / Cr payables.
// Settlement happens later via a payment voucher linked to this invoice.
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const body = await req.json();
    const { supplierName, description, date, dueDate, amount, vatAmount, expenseAccountId, customizedPackageId } = body;

    const net = Number(amount);
    const vat = Number(vatAmount) || 0;
    if (!supplierName || !description || !expenseAccountId || !net || net <= 0 || vat < 0) {
      return NextResponse.json(
        { error: "اسم المورد والبيان وحساب المصروف ومبلغ أكبر من صفر مطلوبة" },
        { status: 400 }
      );
    }
    const total = Math.round((net + vat) * 100) / 100;

    const expenseAccount = await prisma.account.findUnique({ where: { id: expenseAccountId } });
    if (!expenseAccount || expenseAccount.type !== "EXPENSE") {
      return NextResponse.json({ error: "حساب المصروف غير صالح" }, { status: 400 });
    }

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.supplierInvoice.create({
        data: {
          supplierName: String(supplierName).trim(),
          description: String(description).trim(),
          date: date ? new Date(date) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          amount: net,
          vatAmount: vat,
          total,
          expenseAccountId,
          customizedPackageId: customizedPackageId || null,
        },
      });

      const entry = await createJournalEntry(tx, {
        date: inv.date,
        description: `فاتورة مورد ${formatDocNumber("SUP", inv.invoiceNumber)} — ${inv.supplierName}`,
        reference: formatDocNumber("SUP", inv.invoiceNumber),
        sourceType: "SUPPLIER_INVOICE",
        lines: [
          { accountId: expenseAccountId, debit: net },
          ...(vat > 0 ? [{ accountId: await accountIdByCode(tx, ACC.VAT_INPUT), debit: vat }] : []),
          { accountId: await accountIdByCode(tx, ACC.PAYABLES), credit: total },
        ],
      });

      await logAudit(tx, {
        action: "CREATE",
        entity: "SUPPLIER_INVOICE",
        entityId: inv.id,
        summary: `فاتورة مورد ${formatDocNumber("SUP", inv.invoiceNumber)} — ${inv.supplierName} بمبلغ ${total}`,
      });

      return tx.supplierInvoice.update({
        where: { id: inv.id },
        data: { journalEntryId: entry.id },
      });
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Cancel: reversing entry, document kept on record
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const invoice = await prisma.supplierInvoice.findUnique({
      where: { id },
      include: { payments: { where: { cancelledAt: null } } },
    });
    if (!invoice) return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    if (invoice.status === "CANCELLED") {
      return NextResponse.json({ error: "الفاتورة ملغاة بالفعل" }, { status: 400 });
    }
    if (invoice.payments.length > 0) {
      return NextResponse.json(
        { error: "لا يمكن إلغاء فاتورة عليها سندات صرف سارية — ألغِ السندات أولاً" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (invoice.journalEntryId) {
        await reverseJournalEntry(
          tx,
          invoice.journalEntryId,
          `عكس فاتورة مورد ${formatDocNumber("SUP", invoice.invoiceNumber)} — ${invoice.supplierName}`
        );
      }
      await tx.supplierInvoice.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });
      await logAudit(tx, {
        action: "CANCEL",
        entity: "SUPPLIER_INVOICE",
        entityId: id,
        summary: `إلغاء فاتورة مورد ${formatDocNumber("SUP", invoice.invoiceNumber)} — ${invoice.supplierName} (قيد عكسي)`,
      });
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
