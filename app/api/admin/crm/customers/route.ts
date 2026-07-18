import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, normalizePhone } from "@/lib/crm";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const customers = await prisma.customer.findMany({
      include: {
        _count: { select: { tickets: true } },
        tickets: {
          where: { status: { notIn: ["RESOLVED", "CLOSED"] } },
          select: { id: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Booking count per customer, matched by normalized phone
    const bookings = await prisma.customizedPackage.findMany({
      select: { clientPhone: true },
    });
    const bookingCounts = new Map<string, number>();
    for (const b of bookings) {
      const p = normalizePhone(b.clientPhone || "");
      if (!p) continue;
      bookingCounts.set(p, (bookingCounts.get(p) || 0) + 1);
    }

    return NextResponse.json(
      customers.map((c) => ({
        id: c.id,
        name: c.name,
        phone: c.phone,
        email: c.email,
        city: c.city,
        notes: c.notes,
        createdAt: c.createdAt,
        ticketCount: c._count.tickets,
        openTicketCount: c.tickets.length,
        bookingCount: bookingCounts.get(normalizePhone(c.phone)) || 0,
      }))
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { name, phone, email, city, notes } = body;
    if (!name || !phone) {
      return NextResponse.json({ error: "اسم العميل ورقم الجوال مطلوبان" }, { status: 400 });
    }
    const normalized = normalizePhone(phone);
    const existing = await prisma.customer.findUnique({ where: { phone: normalized } });
    if (existing) {
      return NextResponse.json({ error: "يوجد عميل مسجل بنفس رقم الجوال" }, { status: 400 });
    }
    const customer = await prisma.customer.create({
      data: {
        name: String(name).trim(),
        phone: normalized,
        email: email || null,
        city: city || null,
        notes: notes || null,
      },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { id, name, phone, email, city, notes } = body;
    if (!id || !name || !phone) {
      return NextResponse.json({ error: "المعرف والاسم ورقم الجوال مطلوبة" }, { status: 400 });
    }
    const normalized = normalizePhone(phone);
    const clash = await prisma.customer.findUnique({ where: { phone: normalized } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "رقم الجوال مستخدم لعميل آخر" }, { status: 400 });
    }
    const customer = await prisma.customer.update({
      where: { id },
      data: {
        name: String(name).trim(),
        phone: normalized,
        email: email || null,
        city: city || null,
        notes: notes || null,
      },
    });
    return NextResponse.json(customer);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });

    const ticketCount = await prisma.supportTicket.count({ where: { customerId: id } });
    if (ticketCount > 0) {
      return NextResponse.json(
        { error: "لا يمكن حذف عميل لديه تذاكر دعم — أغلق التذاكر أولاً أو احتفظ بالعميل للسجل" },
        { status: 400 }
      );
    }
    await prisma.customer.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
