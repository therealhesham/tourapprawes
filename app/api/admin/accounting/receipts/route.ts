import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  ensureChartOfAccounts,
  createJournalEntry,
  reverseJournalEntry,
  accountIdByCode,
  refreshInvoiceStatus,
  methodAccountCode,
  formatDocNumber,
  logAudit,
  ACC,
} from "@/lib/accounting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const receipts = await prisma.receiptVoucher.findMany({
      include: {
        invoice: { select: { id: true, invoiceNumber: true, total: true } },
        customizedPackage: { select: { id: true, clientName: true } },
      },
      orderBy: { receiptNumber: "desc" },
    });
    return NextResponse.json(receipts);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const body = await req.json();
    const { date, amount, method, clientName, invoiceId, customizedPackageId, notes } = body;
    const value = Number(amount);
    if (!clientName || !value || value <= 0) {
      return NextResponse.json({ error: "اسم العميل ومبلغ أكبر من صفر مطلوبان" }, { status: 400 });
    }

    const receipt = await prisma.$transaction(async (tx) => {
      const rec = await tx.receiptVoucher.create({
        data: {
          date: date ? new Date(date) : new Date(),
          amount: value,
          method: method || "CASH",
          clientName: String(clientName).trim(),
          invoiceId: invoiceId || null,
          customizedPackageId: customizedPackageId || null,
          notes: notes || null,
        },
      });

      // Dr cash/bank / Cr receivables
      const entry = await createJournalEntry(tx, {
        date: rec.date,
        description: `سند قبض ${formatDocNumber("REC", rec.receiptNumber)} — ${rec.clientName}`,
        reference: formatDocNumber("REC", rec.receiptNumber),
        sourceType: "RECEIPT",
        lines: [
          { accountId: await accountIdByCode(tx, methodAccountCode(rec.method)), debit: value },
          { accountId: await accountIdByCode(tx, ACC.RECEIVABLES), credit: value },
        ],
      });

      const updated = await tx.receiptVoucher.update({
        where: { id: rec.id },
        data: { journalEntryId: entry.id },
      });
      if (rec.invoiceId) await refreshInvoiceStatus(tx, rec.invoiceId);
      await logAudit(tx, {
        action: "CREATE",
        entity: "RECEIPT",
        entityId: rec.id,
        summary: `سند قبض ${formatDocNumber("REC", rec.receiptNumber)} — ${rec.clientName} بمبلغ ${value}`,
      });
      return updated;
    });

    return NextResponse.json(receipt);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Cancel (not delete): posts a reversing entry and keeps the voucher on record
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const receipt = await prisma.receiptVoucher.findUnique({ where: { id } });
    if (!receipt) return NextResponse.json({ error: "السند غير موجود" }, { status: 404 });
    if (receipt.cancelledAt) {
      return NextResponse.json({ error: "السند ملغى بالفعل" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (receipt.journalEntryId) {
        await reverseJournalEntry(
          tx,
          receipt.journalEntryId,
          `عكس سند قبض ${formatDocNumber("REC", receipt.receiptNumber)} — ${receipt.clientName}`
        );
      }
      await tx.receiptVoucher.update({ where: { id }, data: { cancelledAt: new Date() } });
      if (receipt.invoiceId) await refreshInvoiceStatus(tx, receipt.invoiceId);
      await logAudit(tx, {
        action: "CANCEL",
        entity: "RECEIPT",
        entityId: id,
        summary: `إلغاء سند قبض ${formatDocNumber("REC", receipt.receiptNumber)} — ${receipt.clientName} (قيد عكسي)`,
      });
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
