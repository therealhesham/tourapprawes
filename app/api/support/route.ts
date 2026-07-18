import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { findCustomerByAnyPhone, normalizePhone } from "@/lib/crm";

// Returns the authenticated client's phone, or null (admins have no phone)
async function sessionPhone(): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return ((session?.user as any)?.phone as string | null) || null;
}

// The client's own tickets, with staff-visible-only notes stripped out
export async function GET() {
  const phone = await sessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "يتطلب تسجيل الدخول" }, { status: 401 });
  }
  try {
    const customer = await findCustomerByAnyPhone(phone);
    if (!customer) return NextResponse.json({ customer: null, tickets: [] });

    const tickets = await prisma.supportTicket.findMany({
      where: { customerId: customer.id },
      include: { messages: { where: { isInternal: false }, orderBy: { createdAt: "asc" } } },
      orderBy: { updatedAt: "desc" },
    });
    return NextResponse.json({
      customer: { name: customer.name },
      tickets: tickets.map((t) => ({
        id: t.id,
        ticketNumber: t.ticketNumber,
        subject: t.subject,
        description: t.description,
        status: t.status,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        messages: t.messages.map((m) => ({
          id: m.id,
          body: m.body,
          authorName: m.authorName,
          fromCustomer: m.authorName === customer.name,
          createdAt: m.createdAt,
        })),
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Submit a new complaint / inquiry from the website
export async function POST(req: Request) {
  const phone = await sessionPhone();
  if (!phone) {
    return NextResponse.json({ error: "يتطلب تسجيل الدخول" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { name, subject, description } = body;
    if (!subject || !String(subject).trim()) {
      return NextResponse.json({ error: "موضوع الشكوى مطلوب" }, { status: 400 });
    }
    if (!name || !String(name).trim()) {
      return NextResponse.json({ error: "الاسم مطلوب" }, { status: 400 });
    }

    const ticket = await prisma.$transaction(async (tx) => {
      let customer = await findCustomerByAnyPhone(phone);
      if (!customer) {
        customer = await tx.customer.create({
          data: { name: String(name).trim(), phone: normalizePhone(phone) },
        });
      } else if (customer.name !== String(name).trim()) {
        // Let the client correct/complete their display name
        customer = await tx.customer.update({
          where: { id: customer.id },
          data: { name: String(name).trim() },
        });
      }

      return tx.supportTicket.create({
        data: {
          subject: String(subject).trim(),
          description: description ? String(description).trim() : null,
          channel: "WEBSITE",
          customerId: customer.id,
        },
      });
    });

    return NextResponse.json({ id: ticket.id, ticketNumber: ticket.ticketNumber });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
