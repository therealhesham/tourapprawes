import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.companyPackage.findMany({
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
        }
      },
      orderBy: {
        pricing: "asc"
      }
    });
    return NextResponse.json(packages);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
