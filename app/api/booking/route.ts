import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
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
        clientPhone,
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
