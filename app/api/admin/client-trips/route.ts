import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const bookings = await prisma.customizedPackage.findMany({
      include: {
        departingFlight: {
          include: {
            departedAirport: { include: { city: true } },
            arrivalAirport: { include: { city: true } },
          }
        },
        returningFlight: {
          include: {
            departedAirport: { include: { city: true } },
            arrivalAirport: { include: { city: true } },
          }
        },
        companyPackage: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return NextResponse.json(bookings);
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

    await prisma.customizedPackage.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
