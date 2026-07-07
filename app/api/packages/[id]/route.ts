import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const pkg = await prisma.companyPackage.findUnique({
      where: { id },
      include: {
        departingFlight: {
          include: {
            departedAirport: { include: { city: true } },
            arrivalAirport: { include: { city: true } },
          },
        },
        returningFlight: {
          include: {
            departedAirport: { include: { city: true } },
            arrivalAirport: { include: { city: true } },
          },
        },
      },
    });

    if (!pkg) {
      return NextResponse.json({ error: "الباقة غير موجودة" }, { status: 404 });
    }

    // cityStays stores city ids only — resolve their names for display
    const stays = Array.isArray(pkg.cityStays) ? (pkg.cityStays as any[]) : [];
    const cityIds = stays.map((s) => s?.cityId).filter(Boolean);
    const cities = cityIds.length
      ? await prisma.city.findMany({
          where: { id: { in: cityIds } },
          include: { country: true },
        })
      : [];
    const cityById = new Map(cities.map((c) => [c.id, c]));

    return NextResponse.json({
      ...pkg,
      cityStays: stays.map((s) => ({
        ...s,
        cityName: cityById.get(s?.cityId)?.name ?? null,
        countryName: cityById.get(s?.cityId)?.country?.name ?? null,
      })),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
