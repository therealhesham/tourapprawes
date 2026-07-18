import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminWithName, upsertCustomerByPhone } from "@/lib/crm";

export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");

    const tickets = await prisma.supportTicket.findMany({
      where: {
        ...(status ? { status: status as any } : {}),
        ...(priority ? { priority: priority as any } : {}),
      },
      include: {
        customer: { select: { id: true, name: true, phone: true } },
        _count: { select: { messages: true } },
      },
      orderBy: { ticketNumber: "desc" },
    });
    return NextResponse.json(tickets);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { denied, adminName } = await requireAdminWithName();
  if (denied) return denied;
  try {
    const body = await req.json();
    const {
      subject,
      description,
      priority,
      channel,
      customerId,
      customerName,
      customerPhone,
      customizedPackageId,
    } = body;

    if (!subject) {
      return NextResponse.json({ error: "موضوع التذكرة مطلوب" }, { status: 400 });
    }
    if (!customerId && (!customerName || !customerPhone)) {
      return NextResponse.json(
        { error: "اختر عميلاً موجوداً أو أدخل اسم ورقم جوال العميل الجديد" },
        { status: 400 }
      );
    }

    const ticket = await prisma.$transaction(async (tx) => {
      const customer = customerId
        ? await tx.customer.findUniqueOrThrow({ where: { id: customerId } })
        : await upsertCustomerByPhone(tx, { name: customerName, phone: customerPhone });

      return tx.supportTicket.create({
        data: {
          subject: String(subject).trim(),
          description: description || null,
          priority: priority || "MEDIUM",
          channel: channel || "PHONE",
          customerId: customer.id,
          customizedPackageId: customizedPackageId || null,
          // The admin who registers the ticket owns its follow-up
          assignee: adminName,
        },
        include: { customer: { select: { id: true, name: true, phone: true } } },
      });
    });

    return NextResponse.json(ticket);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
