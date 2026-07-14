import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  ensureChartOfAccounts,
  createJournalEntry,
  reverseJournalEntry,
  accountIdByCode,
  refreshSupplierInvoiceStatus,
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
    const vouchers = await prisma.paymentVoucher.findMany({
      include: {
        expenseAccount: { select: { id: true, code: true, name: true } },
        customizedPackage: { select: { id: true, clientName: true, startDate: true } },
        supplierInvoice: { select: { id: true, invoiceNumber: true, supplierName: true } },
      },
      orderBy: { voucherNumber: "desc" },
    });
    return NextResponse.json(vouchers);
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
    const {
      date,
      amount,
      vatAmount,
      method,
      payee,
      description,
      expenseAccountId,
      customizedPackageId,
      supplierInvoiceId,
    } = body;

    const net = Number(amount);
    const vat = Number(vatAmount) || 0;
    if (!payee || !description || !net || net <= 0 || vat < 0) {
      return NextResponse.json(
        { error: "المستفيد والبيان ومبلغ أكبر من صفر مطلوبة" },
        { status: 400 }
      );
    }
    const gross = Math.round((net + vat) * 100) / 100;

    // Two modes:
    //  - direct expense: Dr expense (+ Dr input VAT) / Cr cash-bank
    //  - supplier invoice settlement: Dr payables / Cr cash-bank
    //    (the expense and VAT were already recognized on the supplier invoice)
    let supplierInvoice = null;
    if (supplierInvoiceId) {
      supplierInvoice = await prisma.supplierInvoice.findUnique({ where: { id: supplierInvoiceId } });
      if (!supplierInvoice || supplierInvoice.status === "CANCELLED") {
        return NextResponse.json({ error: "فاتورة المورد غير موجودة أو ملغاة" }, { status: 400 });
      }
      if (vat > 0) {
        return NextResponse.json(
          { error: "سداد فاتورة مورد لا يحمل ضريبة — الضريبة سُجلت على الفاتورة نفسها" },
          { status: 400 }
        );
      }
      const remaining = Number(supplierInvoice.total) - Number(supplierInvoice.paidAmount);
      if (net > remaining + 0.001) {
        return NextResponse.json(
          { error: `المبلغ أكبر من المتبقي على الفاتورة (${remaining.toFixed(2)})` },
          { status: 400 }
        );
      }
    } else if (!expenseAccountId) {
      return NextResponse.json({ error: "حساب المصروف مطلوب" }, { status: 400 });
    } else {
      const expenseAccount = await prisma.account.findUnique({ where: { id: expenseAccountId } });
      if (!expenseAccount || expenseAccount.type !== "EXPENSE") {
        return NextResponse.json({ error: "حساب المصروف غير صالح" }, { status: 400 });
      }
    }

    const voucher = await prisma.$transaction(async (tx) => {
      const v = await tx.paymentVoucher.create({
        data: {
          date: date ? new Date(date) : new Date(),
          amount: net,
          vatAmount: vat,
          method: method || "CASH",
          payee: String(payee).trim(),
          description: String(description).trim(),
          expenseAccountId: supplierInvoiceId ? null : expenseAccountId,
          customizedPackageId: customizedPackageId || null,
          supplierInvoiceId: supplierInvoiceId || null,
        },
      });

      const cashLine = {
        accountId: await accountIdByCode(tx, methodAccountCode(v.method)),
        credit: gross,
      };
      const entry = await createJournalEntry(tx, {
        date: v.date,
        description: `سند صرف ${formatDocNumber("PAY", v.voucherNumber)} — ${v.description}`,
        reference: formatDocNumber("PAY", v.voucherNumber),
        sourceType: "PAYMENT",
        lines: supplierInvoiceId
          ? [{ accountId: await accountIdByCode(tx, ACC.PAYABLES), debit: gross }, cashLine]
          : [
              { accountId: expenseAccountId, debit: net },
              ...(vat > 0 ? [{ accountId: await accountIdByCode(tx, ACC.VAT_INPUT), debit: vat }] : []),
              cashLine,
            ],
      });

      const updated = await tx.paymentVoucher.update({
        where: { id: v.id },
        data: { journalEntryId: entry.id },
      });
      if (supplierInvoiceId) await refreshSupplierInvoiceStatus(tx, supplierInvoiceId);
      await logAudit(tx, {
        action: "CREATE",
        entity: "PAYMENT",
        entityId: v.id,
        summary: `سند صرف ${formatDocNumber("PAY", v.voucherNumber)} — ${v.payee} بمبلغ ${gross}`,
      });
      return updated;
    });

    return NextResponse.json(voucher);
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

    const voucher = await prisma.paymentVoucher.findUnique({ where: { id } });
    if (!voucher) return NextResponse.json({ error: "السند غير موجود" }, { status: 404 });
    if (voucher.cancelledAt) {
      return NextResponse.json({ error: "السند ملغى بالفعل" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      if (voucher.journalEntryId) {
        await reverseJournalEntry(
          tx,
          voucher.journalEntryId,
          `عكس سند صرف ${formatDocNumber("PAY", voucher.voucherNumber)} — ${voucher.payee}`
        );
      }
      await tx.paymentVoucher.update({ where: { id }, data: { cancelledAt: new Date() } });
      if (voucher.supplierInvoiceId) await refreshSupplierInvoiceStatus(tx, voucher.supplierInvoiceId);
      await logAudit(tx, {
        action: "CANCEL",
        entity: "PAYMENT",
        entityId: id,
        summary: `إلغاء سند صرف ${formatDocNumber("PAY", voucher.voucherNumber)} — ${voucher.payee} (قيد عكسي)`,
      });
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
