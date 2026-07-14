import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  requireAdmin,
  ensureChartOfAccounts,
  createJournalEntry,
  reverseJournalEntry,
  formatDocNumber,
  logAudit,
} from "@/lib/accounting";

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    await ensureChartOfAccounts();
    const { searchParams } = new URL(req.url);
    const from = searchParams.get("from");
    const to = searchParams.get("to");
    const entries = await prisma.journalEntry.findMany({
      where: {
        ...(from || to
          ? {
              date: {
                ...(from ? { gte: new Date(from) } : {}),
                ...(to ? { lte: new Date(to + "T23:59:59") } : {}),
              },
            }
          : {}),
      },
      include: { lines: { include: { account: true } } },
      orderBy: { entryNumber: "desc" },
      take: 300,
    });
    return NextResponse.json(entries);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Manual journal entry
export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { date, description, reference, lines } = body;
    if (!date || !description || !Array.isArray(lines)) {
      return NextResponse.json({ error: "التاريخ والبيان وسطور القيد مطلوبة" }, { status: 400 });
    }
    const entry = await prisma.$transaction(async (tx) => {
      const e = await createJournalEntry(tx, {
        date: new Date(date),
        description,
        reference,
        sourceType: "MANUAL",
        lines: lines.map((l: any) => ({
          accountId: l.accountId,
          debit: Number(l.debit) || 0,
          credit: Number(l.credit) || 0,
          description: l.description,
        })),
      });
      await logAudit(tx, {
        action: "CREATE",
        entity: "JOURNAL",
        entityId: e.id,
        summary: `قيد يدوي ${formatDocNumber("JV", e.entryNumber)} — ${description}`,
      });
      return e;
    });
    return NextResponse.json(entry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Manual entries are never deleted — a reversing entry is posted instead.
// Automatic entries are reversed by cancelling their source document.
export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const entry = await prisma.journalEntry.findUnique({ where: { id } });
    if (!entry) return NextResponse.json({ error: "القيد غير موجود" }, { status: 404 });
    if (entry.sourceType !== "MANUAL") {
      return NextResponse.json(
        { error: "قيد آلي — ألغِ المستند المصدر (فاتورة/سند) بدلاً من القيد" },
        { status: 400 }
      );
    }
    await prisma.$transaction(async (tx) => {
      const reversal = await reverseJournalEntry(
        tx,
        id,
        `عكس قيد يدوي ${formatDocNumber("JV", entry.entryNumber)} — ${entry.description}`
      );
      await logAudit(tx, {
        action: "REVERSE",
        entity: "JOURNAL",
        entityId: id,
        summary: `عكس القيد ${formatDocNumber("JV", entry.entryNumber)} بالقيد ${formatDocNumber("JV", reversal.entryNumber)}`,
      });
    });
    return NextResponse.json({ success: true, reversed: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
