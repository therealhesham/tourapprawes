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
    const invoices = await prisma.invoice.findMany({
      include: {
        items: true,
        customizedPackage: { select: { id: true, clientName: true, startDate: true, endDate: true } },
      },
      orderBy: { invoiceNumber: "desc" },
    });
    return NextResponse.json(invoices);
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
      clientName,
      clientPhone,
      clientVatNumber,
      clientAddress,
      customizedPackageId,
      issueDate,
      dueDate,
      vatRate,
      notes,
      items,
    } = body;

    if (!clientName || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "اسم العميل وبنود الفاتورة مطلوبة" }, { status: 400 });
    }

    const parsedItems = items.map((it: any) => {
      const quantity = Number(it.quantity) || 1;
      const unitPrice = Number(it.unitPrice) || 0;
      return {
        description: String(it.description || "").trim(),
        quantity,
        unitPrice,
        lineTotal: Math.round(quantity * unitPrice * 100) / 100,
      };
    });
    if (parsedItems.some((it) => !it.description || it.unitPrice <= 0)) {
      return NextResponse.json({ error: "كل بند يجب أن يحتوي وصفاً وسعراً أكبر من صفر" }, { status: 400 });
    }

    const rate = vatRate === undefined || vatRate === null ? 15 : Number(vatRate);
    const subtotal = Math.round(parsedItems.reduce((s, it) => s + it.lineTotal, 0) * 100) / 100;
    const vatAmount = Math.round(subtotal * (rate / 100) * 100) / 100;
    const total = Math.round((subtotal + vatAmount) * 100) / 100;

    const invoice = await prisma.$transaction(async (tx) => {
      const inv = await tx.invoice.create({
        data: {
          clientName: String(clientName).trim(),
          clientPhone: clientPhone || null,
          clientVatNumber: clientVatNumber || null,
          clientAddress: clientAddress || null,
          customizedPackageId: customizedPackageId || null,
          issueDate: issueDate ? new Date(issueDate) : new Date(),
          dueDate: dueDate ? new Date(dueDate) : null,
          subtotal,
          vatRate: rate,
          vatAmount,
          total,
          notes: notes || null,
          items: { create: parsedItems },
        },
      });

      // Dr receivables (total) / Cr revenue (subtotal) + Cr output VAT
      const entry = await createJournalEntry(tx, {
        date: inv.issueDate,
        description: `فاتورة ضريبية ${formatDocNumber("INV", inv.invoiceNumber)} — ${inv.clientName}`,
        reference: formatDocNumber("INV", inv.invoiceNumber),
        sourceType: "INVOICE",
        lines: [
          { accountId: await accountIdByCode(tx, ACC.RECEIVABLES), debit: total },
          { accountId: await accountIdByCode(tx, ACC.PACKAGE_REVENUE), credit: subtotal },
          ...(vatAmount > 0
            ? [{ accountId: await accountIdByCode(tx, ACC.VAT_OUTPUT), credit: vatAmount }]
            : []),
        ],
      });

      await logAudit(tx, {
        action: "CREATE",
        entity: "INVOICE",
        entityId: inv.id,
        summary: `إصدار فاتورة ${formatDocNumber("INV", inv.invoiceNumber)} — ${inv.clientName} بمبلغ ${total}`,
      });

      return tx.invoice.update({
        where: { id: inv.id },
        data: { journalEntryId: entry.id },
        include: { items: true },
      });
    });

    return NextResponse.json(invoice);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Cancel an invoice (credit-note style): posts a reversing entry dated today.
// Nothing is deleted — the original entry and the reversal both stay on the books.
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: { receipts: { where: { cancelledAt: null } } },
    });
    if (!invoice) return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    if (invoice.status === "CANCELLED") {
      return NextResponse.json({ error: "الفاتورة ملغاة بالفعل" }, { status: 400 });
    }
    if (invoice.receipts.length > 0) {
      return NextResponse.json(
        { error: "لا يمكن إلغاء فاتورة عليها سندات قبض سارية — ألغِ السندات أولاً" },
        { status: 400 }
      );
    }

    await prisma.$transaction(async (tx) => {
      if (invoice.journalEntryId) {
        await reverseJournalEntry(
          tx,
          invoice.journalEntryId,
          `إشعار دائن — إلغاء فاتورة ${formatDocNumber("INV", invoice.invoiceNumber)} (${invoice.clientName})`
        );
      }
      await tx.invoice.update({ where: { id }, data: { status: "CANCELLED" } });
      await logAudit(tx, {
        action: "CANCEL",
        entity: "INVOICE",
        entityId: id,
        summary: `إلغاء فاتورة ${formatDocNumber("INV", invoice.invoiceNumber)} — ${invoice.clientName} (قيد عكسي)`,
      });
    });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
