import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const type = searchParams.get("type");

    if (!id || !type) {
      return NextResponse.json({ error: "Missing id or type" }, { status: 400 });
    }

    if (type === "destination") {
      await prisma.destination.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "country") {
      await prisma.country.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    if (type === "city") {
      await prisma.city.delete({ where: { id } });
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
