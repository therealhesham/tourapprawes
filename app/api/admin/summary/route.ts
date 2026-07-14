import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const destinationsCount = await prisma.destination.count();
    const countriesCount = await prisma.country.count();
    const citiesCount = await prisma.city.count();
    const saudiAirportsCount = await prisma.saudiAirport.count();
    const destinationAirportsCount = await prisma.destinationAirport.count();
    const flightsCount = await prisma.flight.count();
    const transportsCount = await prisma.internalTransport.count();

    return NextResponse.json({
      destinations: destinationsCount,
      countries: countriesCount,
      cities: citiesCount,
      saudiAirports: saudiAirportsCount,
      destinationAirports: destinationAirportsCount,
      flights: flightsCount,
      transports: transportsCount
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
