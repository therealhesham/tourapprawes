import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminWithName } from "@/lib/crm";

const TICKET_STATUSES = ["OPEN", "IN_PROGRESS", "WAITING_CUSTOMER", "RESOLVED", "CLOSED"];
const TICKET_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        customer: true,
        customizedPackage: { select: { id: true, clientName: true, startDate: true, endDate: true } },
        messages: { orderBy: { createdAt: "asc" } },
      },
    });
    if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });

    // Customer's bookings, offered when linking the ticket to a trip
    const bookings = await prisma.customizedPackage.findMany({
      where: { clientPhone: { contains: ticket.customer.phone.slice(-9) } },
      select: { id: true, clientName: true, startDate: true, endDate: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ ticket, bookings });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update status / priority / linked booking.
// Assignment is automatic: the first admin who acts on the ticket owns it.
export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied, adminName } = await requireAdminWithName();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    const data: any = {};

    if (body.status !== undefined) {
      if (!TICKET_STATUSES.includes(body.status)) {
        return NextResponse.json({ error: "حالة غير صالحة" }, { status: 400 });
      }
      data.status = body.status;
      data.resolvedAt = body.status === "RESOLVED" ? new Date() : null;
      data.closedAt = body.status === "CLOSED" ? new Date() : null;
    }
    if (body.priority !== undefined) {
      if (!TICKET_PRIORITIES.includes(body.priority)) {
        return NextResponse.json({ error: "أولوية غير صالحة" }, { status: 400 });
      }
      data.priority = body.priority;
    }
    if (body.customizedPackageId !== undefined) data.customizedPackageId = body.customizedPackageId || null;

    const existing = await prisma.supportTicket.findUnique({ where: { id }, select: { assignee: true } });
    if (!existing) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    if (!existing.assignee) data.assignee = adminName;

    const ticket = await prisma.supportTicket.update({ where: { id }, data });
    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Add a reply or internal note to the ticket timeline.
// The author is always the logged-in admin, and replying claims an unassigned ticket.
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { denied, adminName } = await requireAdminWithName();
  if (denied) return denied;
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.body || !String(body.body).trim()) {
      return NextResponse.json({ error: "نص الرد مطلوب" }, { status: 400 });
    }
    const ticket = await prisma.supportTicket.findUnique({ where: { id }, select: { assignee: true } });
    if (!ticket) return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: id,
        body: String(body.body).trim(),
        authorName: adminName,
        isInternal: Boolean(body.isInternal),
      },
    });
    // Bump updatedAt so the list sorts fresh activity up
    await prisma.supportTicket.update({
      where: { id },
      data: { updatedAt: new Date(), ...(ticket.assignee ? {} : { assignee: adminName }) },
    });
    return NextResponse.json(message);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
