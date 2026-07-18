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
      // Flights reference the airport — deleting would orphan them (FK violation)
      const [departing, returning] = await Promise.all([
        prisma.flight.count({ where: { departedAirportId: id } }),
        prisma.returningFlight.count({ where: { arrivalAirportId: id } }),
      ]);
      if (departing + returning > 0) {
        return NextResponse.json(
          {
            error: `لا يمكن حذف المطار — مرتبط بـ ${departing} رحلة ذهاب و${returning} رحلة عودة. احذف هذه الرحلات أولاً من صفحة الرحلات الدولية.`,
          },
          { status: 400 }
        );
      }
      await prisma.saudiAirport.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "destination") {
      const [arriving, returning] = await Promise.all([
        prisma.flight.count({ where: { arrivalAirportId: id } }),
        prisma.returningFlight.count({ where: { departedAirportId: id } }),
      ]);
      if (arriving + returning > 0) {
        return NextResponse.json(
          {
            error: `لا يمكن حذف المطار — مرتبط بـ ${arriving} رحلة ذهاب و${returning} رحلة عودة. احذف هذه الرحلات أولاً من صفحة الرحلات الدولية.`,
          },
          { status: 400 }
        );
      }
      await prisma.destinationAirport.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    // Fallback for any other FK constraint (e.g. references added later)
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن حذف المطار لوجود بيانات مرتبطة به." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
