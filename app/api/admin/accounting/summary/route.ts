import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ensureChartOfAccounts, ACC } from "@/lib/accounting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();

    const accounts = await prisma.account.findMany({
      include: { journalLines: { select: { debit: true, credit: true } } },
    });
    const balance = (code: string) => {
      const a = accounts.find((x) => x.code === code);
      if (!a) return 0;
      const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
      const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
      const debitNature = a.type === "ASSET" || a.type === "EXPENSE";
      return debitNature ? debit - credit : credit - debit;
    };
    const sumByType = (type: string) =>
      accounts
        .filter((a) => a.type === type)
        .reduce((s, a) => {
          const debit = a.journalLines.reduce((x, l) => x + Number(l.debit), 0);
          const credit = a.journalLines.reduce((x, l) => x + Number(l.credit), 0);
          return s + (type === "REVENUE" ? credit - debit : debit - credit);
        }, 0);

    const totalRevenue = sumByType("REVENUE");
    const totalExpenses = sumByType("EXPENSE");

    const [invoiceCount, unpaidInvoices, recentEntries] = await Promise.all([
      prisma.invoice.count({ where: { status: { not: "CANCELLED" } } }),
      prisma.invoice.count({ where: { status: { in: ["ISSUED", "PARTIALLY_PAID"] } } }),
      prisma.journalEntry.findMany({
        include: { lines: { include: { account: true } } },
        orderBy: { entryNumber: "desc" },
        take: 8,
      }),
    ]);

    return NextResponse.json({
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      cash: balance(ACC.CASH),
      bank: balance(ACC.BANK),
      receivables: balance(ACC.RECEIVABLES),
      vatDue: balance(ACC.VAT_OUTPUT) - balance(ACC.VAT_INPUT),
      invoiceCount,
      unpaidInvoices,
      recentEntries,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
