import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, normalizePhone } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const sessionPhone = (session.user as any)?.phone as string | null;

    const {
      clientName,
      clientPhone,
      startDate,
      endDate,
      departingFlightId,
      returningFlightId,
      pricing,
      cityStays,
      companyPackageId,
    } = await req.json();

    if (!clientName || !clientPhone || !startDate || !endDate || pricing === undefined || !cityStays) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newBooking = await prisma.customizedPackage.create({
      data: {
        clientName,
        // Bookings belong to the authenticated phone; the form value is a
        // fallback for admin-created bookings only
        clientPhone: sessionPhone ?? normalizePhone(clientPhone) ?? clientPhone,
        startDate,
        endDate,
        departingFlightId: departingFlightId || null,
        returningFlightId: returningFlightId || null,
        pricing: Number(pricing),
        cityStays: cityStays, // Stored as a JSON object/array
        companyPackageId: companyPackageId || null,
      },
    });

    return NextResponse.json({ success: true, booking: newBooking });
  } catch (error: any) {
    console.error("Booking API error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const phone = (session.user as any)?.phone as string | null;

    // Admins see all bookings; clients only see their own
    const where = role === "admin" ? {} : { clientPhone: phone ?? "" };

    const bookings = await prisma.customizedPackage.findMany({
      where,
      include: {
        companyPackage: true,
      },
      orderBy: {
        createdAt: "desc"
      }
    });
    return NextResponse.json(bookings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
