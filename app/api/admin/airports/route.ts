import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// Public catalog read — used by the booking wizard
export async function GET() {
  try {
    const saudiAirports = await prisma.saudiAirport.findMany({
      include: { city: true }
    });
    const destinationAirports = await prisma.destinationAirport.findMany({
      include: { city: true }
    });
    return NextResponse.json({ saudiAirports, destinationAirports });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { type, airportName, cityId } = await req.json();

    if (type === "saudi") {
      const newAirport = await prisma.saudiAirport.create({
        data: { airportName, cityId }
      });
      return NextResponse.json(newAirport);
    }

    if (type === "destination") {
      const newAirport = await prisma.destinationAirport.create({
        data: { airportName, cityId }
      });
      return NextResponse.json(newAirport);
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    if (type === "saudi") {
      await prisma.saudiAirport.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "destination") {
      await prisma.destinationAirport.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
