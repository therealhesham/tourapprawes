import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const flights = await prisma.flight.findMany({
      include: {
        country: true,
        arrivalAirport: { include: { city: true } },
        departedAirport: { include: { city: true } }
      }
    });
    return NextResponse.json(flights);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { countryId, approximatePrice, airWayName, arrivalAirportId, departedAirportId } = await req.json();

    const newFlight = await prisma.flight.create({
      data: {
        countryId,
        approximatePrice: Number(approximatePrice),
        airWayName,
        arrivalAirportId,
        departedAirportId
      }
    });
    return NextResponse.json(newFlight);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.flight.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
