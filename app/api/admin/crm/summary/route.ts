import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/crm";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const [customerCount, byStatus, byPriority, recentTickets] = await Promise.all([
      prisma.customer.count(),
      prisma.supportTicket.groupBy({ by: ["status"], _count: { _all: true } }),
      prisma.supportTicket.groupBy({
        by: ["priority"],
        where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
        _count: { _all: true },
      }),
      prisma.supportTicket.findMany({
        include: { customer: { select: { id: true, name: true, phone: true } } },
        orderBy: { updatedAt: "desc" },
        take: 8,
      }),
    ]);

    const statusCounts: Record<string, number> = {};
    for (const s of byStatus) statusCounts[s.status] = s._count._all;
    const priorityCounts: Record<string, number> = {};
    for (const p of byPriority) priorityCounts[p.priority] = p._count._all;

    const openCount =
      (statusCounts.OPEN || 0) + (statusCounts.IN_PROGRESS || 0) + (statusCounts.WAITING_CUSTOMER || 0);

    return NextResponse.json({
      customerCount,
      openCount,
      statusCounts,
      priorityCounts,
      recentTickets,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
