import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// Public catalog read — used by the home search widgets and booking wizard
export async function GET() {
  try {
    const destinations = await prisma.destination.findMany({
      include: {
        countries: {
          include: {
            cities: true
          }
        }
      }
    });
    return NextResponse.json(destinations);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { type, name, countryId, destinationId, destination } = await req.json();

    if (type === "destination") {
      const newDest = await prisma.destination.create({
        data: { destination }
      });
      return NextResponse.json(newDest);
    }

    if (type === "country") {
      const newCountry = await prisma.country.create({
        data: { name, destinationId }
      });
      return NextResponse.json(newCountry);
    }

    if (type === "city") {
      const newCity = await prisma.city.create({
        data: { name, countryId }
      });
      return NextResponse.json(newCity);
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

    if (type === "destination") {
      const countries = await prisma.country.count({ where: { destinationId: id } });
      if (countries > 0) {
        return NextResponse.json(
          { error: `لا يمكن حذف الوجهة — تحتوي على ${countries} دولة. احذف الدول التابعة لها أولاً.` },
          { status: 400 }
        );
      }
      await prisma.destination.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "country") {
      const [cities, flights, returningFlights] = await Promise.all([
        prisma.city.count({ where: { countryId: id } }),
        prisma.flight.count({ where: { countryId: id } }),
        prisma.returningFlight.count({ where: { countryId: id } }),
      ]);
      if (cities + flights + returningFlights > 0) {
        return NextResponse.json(
          {
            error: `لا يمكن حذف الدولة — مرتبطة بـ ${cities} مدينة و${flights} رحلة ذهاب و${returningFlights} رحلة عودة. احذف هذه البيانات أولاً.`,
          },
          { status: 400 }
        );
      }
      await prisma.country.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "city") {
      const [saudiAirports, destAirports, transports] = await Promise.all([
        prisma.saudiAirport.count({ where: { cityId: id } }),
        prisma.destinationAirport.count({ where: { cityId: id } }),
        prisma.internalTransport.count({ where: { OR: [{ cityId: id }, { arrivalCityId: id }] } }),
      ]);
      if (saudiAirports + destAirports + transports > 0) {
        return NextResponse.json(
          {
            error: `لا يمكن حذف المدينة — مرتبطة بـ ${saudiAirports + destAirports} مطار و${transports} تنقّل داخلي. احذف هذه البيانات أولاً من صفحتي المطارات والتنقلات.`,
          },
          { status: 400 }
        );
      }
      await prisma.city.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن الحذف لوجود بيانات مرتبطة بهذا العنصر." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
