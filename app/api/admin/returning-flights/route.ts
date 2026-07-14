import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Public catalog read — used by the booking wizard
export async function GET() {
  try {
    const returningFlights = await prisma.returningFlight.findMany({
      include: {
        country: true,
        arrivalAirport: { include: { city: true } },
        departedAirport: { include: { city: true } }
      }
    });
    return NextResponse.json(returningFlights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
