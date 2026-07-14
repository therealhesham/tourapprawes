import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, ensureChartOfAccounts } from "@/lib/accounting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const accounts = await prisma.account.findMany({
      orderBy: { code: "asc" },
      include: {
        journalLines: { select: { debit: true, credit: true } },
      },
    });
    // Return balance per account (debit-positive for assets/expenses)
    const result = accounts.map((a) => {
      const debit = a.journalLines.reduce((s, l) => s + Number(l.debit), 0);
      const credit = a.journalLines.reduce((s, l) => s + Number(l.credit), 0);
      const { journalLines, ...rest } = a;
      const debitNature = a.type === "ASSET" || a.type === "EXPENSE";
      return {
        ...rest,
        totalDebit: debit,
        totalCredit: credit,
        balance: debitNature ? debit - credit : credit - debit,
      };
    });
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { code, name, type } = body;
    if (!code || !name || !type) {
      return NextResponse.json({ error: "الرمز والاسم والنوع مطلوبة" }, { status: 400 });
    }
    const account = await prisma.account.create({
      data: { code: String(code).trim(), name: String(name).trim(), type },
    });
    return NextResponse.json(account);
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json({ error: "رمز الحساب مستخدم من قبل" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { id, name, isActive } = body;
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const account = await prisma.account.update({
      where: { id },
      data: {
        ...(name !== undefined ? { name: String(name).trim() } : {}),
        ...(isActive !== undefined ? { isActive: Boolean(isActive) } : {}),
      },
    });
    return NextResponse.json(account);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const account = await prisma.account.findUnique({
      where: { id },
      include: { _count: { select: { journalLines: true } } },
    });
    if (!account) return NextResponse.json({ error: "الحساب غير موجود" }, { status: 404 });
    if (account.isSystem) {
      return NextResponse.json({ error: "لا يمكن حذف حساب نظامي" }, { status: 400 });
    }
    if (account._count.journalLines > 0) {
      return NextResponse.json({ error: "لا يمكن حذف حساب عليه حركات — يمكنك تعطيله بدلاً من ذلك" }, { status: 400 });
    }
    await prisma.account.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
