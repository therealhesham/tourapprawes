import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const transports = await prisma.internalTransport.findMany({
      include: {
        departureCity: true,
        arrivalCity: true
      }
    });
    return NextResponse.json(transports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { transportationName, approximatePrice, cityId, arrivalCityId } = await req.json();

    const newTransport = await prisma.internalTransport.create({
      data: {
        transportationName,
        approximatePrice: Number(approximatePrice),
        cityId,
        arrivalCityId
      }
    });
    return NextResponse.json(newTransport);
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

    await prisma.internalTransport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
