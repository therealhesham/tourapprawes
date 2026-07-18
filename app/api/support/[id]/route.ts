import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findCustomerByAnyPhone } from "@/lib/crm";

// Client adds a reply to their own ticket
export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  const phone = ((session?.user as any)?.phone as string | null) || null;
  if (!phone) {
    return NextResponse.json({ error: "يتطلب تسجيل الدخول" }, { status: 401 });
  }
  try {
    const { id } = await params;
    const body = await req.json();
    if (!body.body || !String(body.body).trim()) {
      return NextResponse.json({ error: "نص الرد مطلوب" }, { status: 400 });
    }

    const customer = await findCustomerByAnyPhone(phone);
    const ticket = customer
      ? await prisma.supportTicket.findFirst({ where: { id, customerId: customer.id } })
      : null;
    if (!ticket) {
      return NextResponse.json({ error: "التذكرة غير موجودة" }, { status: 404 });
    }
    if (ticket.status === "CLOSED") {
      return NextResponse.json({ error: "التذكرة مغلقة — افتح شكوى جديدة إذا احتجت للمساعدة" }, { status: 400 });
    }

    const message = await prisma.ticketMessage.create({
      data: {
        ticketId: ticket.id,
        body: String(body.body).trim(),
        authorName: customer!.name,
        isInternal: false,
      },
    });
    // A customer reply puts the ticket back in the staff queue
    await prisma.supportTicket.update({
      where: { id: ticket.id },
      data: {
        updatedAt: new Date(),
        ...(ticket.status === "WAITING_CUSTOMER" || ticket.status === "RESOLVED"
          ? { status: "OPEN", resolvedAt: null }
          : {}),
      },
    });
    return NextResponse.json({ id: message.id });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
