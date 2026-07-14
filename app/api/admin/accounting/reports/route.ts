import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ensureChartOfAccounts, ACC } from "@/lib/accounting";

function dateFilter(from: string | null, to: string | null) {
  if (!from && !to) return {};
  return {
    entry: {
      date: {
        ...(from ? { gte: new Date(from) } : {}),
        ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
      },
    },
  };
}

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "trial-balance";
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    if (type === "trial-balance" || type === "income") {
      const accounts = await prisma.account.findMany({
        orderBy: { code: "asc" },
        include: {
          journalLines: {
            where: dateFilter(from, to),
            select: { debit: true, credit: true },
          },
        },
      });
      const rows = accounts
        .map((a) => {
          const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
          const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
          return { id: a.id, code: a.code, name: a.name, type: a.type, debit, credit };
        })
        .filter((r) => r.debit !== 0 || r.credit !== 0);

      if (type === "trial-balance") {
        return NextResponse.json({
          rows,
          totalDebit: rows.reduce((s, r) => s + r.debit, 0),
          totalCredit: rows.reduce((s, r) => s + r.credit, 0),
        });
      }

      // Income statement
      const revenue = rows
        .filter((r) => r.type === "REVENUE")
        .map((r) => ({ ...r, amount: r.credit - r.debit }));
      const expenses = rows
        .filter((r) => r.type === "EXPENSE")
        .map((r) => ({ ...r, amount: r.debit - r.credit }));
      const totalRevenue = revenue.reduce((s, r) => s + r.amount, 0);
      const totalExpenses = expenses.reduce((s, r) => s + r.amount, 0);
      return NextResponse.json({
        revenue,
        expenses,
        totalRevenue,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
      });
    }

    if (type === "ledger") {
      const accountId = searchParams.get("accountId");
      if (!accountId) return NextResponse.json({ error: "Missing accountId" }, { status: 400 });
      const account = await prisma.account.findUnique({ where: { id: accountId } });
      if (!account) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
      const lines = await prisma.journalLine.findMany({
        where: { accountId, ...dateFilter(from, to) },
        include: { entry: true },
        orderBy: [{ entry: { date: "asc" } }, { entry: { entryNumber: "asc" } }],
      });
      const debitNature = account.type === "ASSET" || account.type === "EXPENSE";
      let balance = 0;
      const rows = lines.map((l) => {
        const debit = Number(l.debit);
        const credit = Number(l.credit);
        balance += debitNature ? debit - credit : credit - debit;
        return {
          id: l.id,
          date: l.entry.date,
          entryNumber: l.entry.entryNumber,
          description: l.description || l.entry.description,
          reference: l.entry.reference,
          debit,
          credit,
          balance,
        };
      });
      return NextResponse.json({ account, rows, balance });
    }

    if (type === "vat") {
      const [outputAcc, inputAcc] = await Promise.all([
        prisma.account.findUnique({
          where: { code: ACC.VAT_OUTPUT },
          include: { journalLines: { where: dateFilter(from, to), select: { debit: true, credit: true } } },
        }),
        prisma.account.findUnique({
          where: { code: ACC.VAT_INPUT },
          include: { journalLines: { where: dateFilter(from, to), select: { debit: true, credit: true } } },
        }),
      ]);
      const outputVat = (outputAcc?.journalLines || []).reduce(
        (s, l) => s + Number(l.credit) - Number(l.debit), 0);
      const inputVat = (inputAcc?.journalLines || []).reduce(
        (s, l) => s + Number(l.debit) - Number(l.credit), 0);
      return NextResponse.json({ outputVat, inputVat, netVatDue: outputVat - inputVat });
    }

    if (type === "balance-sheet") {
      const accounts = await prisma.account.findMany({
        orderBy: { code: "asc" },
        include: { journalLines: { select: { debit: true, credit: true } } },
      });
      const withBalance = accounts.map((a) => {
        const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
        const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
        const debitNature = a.type === "ASSET" || a.type === "EXPENSE";
        return { id: a.id, code: a.code, name: a.name, type: a.type, balance: debitNature ? debit - credit : credit - debit };
      });
      const pick = (t: string) => withBalance.filter((a) => a.type === t && a.balance !== 0);
      const assets = pick("ASSET");
      const liabilities = pick("LIABILITY");
      const equity = pick("EQUITY");
      const netProfit =
        withBalance.filter((a) => a.type === "REVENUE").reduce((s, a) => s + a.balance, 0) -
        withBalance.filter((a) => a.type === "EXPENSE").reduce((s, a) => s + a.balance, 0);
      const totalAssets = assets.reduce((s, a) => s + a.balance, 0);
      const totalLiabilities = liabilities.reduce((s, a) => s + a.balance, 0);
      const totalEquity = equity.reduce((s, a) => s + a.balance, 0) + netProfit;
      return NextResponse.json({
        assets,
        liabilities,
        equity,
        netProfit,
        totalAssets,
        totalLiabilities,
        totalEquity,
        balanced: Math.abs(totalAssets - (totalLiabilities + totalEquity)) < 0.01,
      });
    }

    if (type === "trips") {
      // Profitability per booking: issued invoices (net of VAT) vs linked costs.
      // Costs = direct expense vouchers + supplier invoices; settlement vouchers
      // (paying a supplier invoice) are excluded to avoid double counting.
      const bookings = await prisma.customizedPackage.findMany({
        include: {
          invoices: { where: { status: { not: "CANCELLED" } }, select: { subtotal: true } },
          paymentVouchers: {
            where: { cancelledAt: null, supplierInvoiceId: null },
            select: { amount: true },
          },
          supplierInvoices: {
            where: { status: { not: "CANCELLED" } },
            select: { amount: true },
          },
          receiptVouchers: { where: { cancelledAt: null }, select: { amount: true } },
          companyPackage: { select: { name: true } },
        },
        orderBy: { createdAt: "desc" },
      });
      const rows = bookings.map((b) => {
        const revenue = b.invoices.reduce((s, i) => s + Number(i.subtotal), 0);
        const cost =
          b.paymentVouchers.reduce((s, v) => s + Number(v.amount), 0) +
          b.supplierInvoices.reduce((s, v) => s + Number(v.amount), 0);
        const collected = b.receiptVouchers.reduce((s, r) => s + Number(r.amount), 0);
        return {
          id: b.id,
          clientName: b.clientName,
          clientPhone: b.clientPhone,
          startDate: b.startDate,
          endDate: b.endDate,
          packageName: b.companyPackage?.name || "باقة مخصصة",
          bookingPrice: b.pricing,
          revenue,
          cost,
          collected,
          profit: revenue - cost,
        };
      });
      return NextResponse.json(rows);
    }

    return NextResponse.json({ error: "نوع تقرير غير معروف" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
