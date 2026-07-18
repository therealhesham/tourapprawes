import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

// Public catalog read — used by the booking wizard
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
  const denied = await requireAdmin();
  if (denied) return denied;
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
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id" }, { status: 400 });
    }

    await prisma.internalTransport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error?.code === "P2003") {
      return NextResponse.json(
        { error: "لا يمكن حذف التنقّل لوجود بيانات مرتبطة به." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
