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

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      name,
      title,
      description,
      pricing,
      originalPricing,
      days,
      image,
      popular,
      rating,
      reviews,
      features,
      includesText,
      countryCode,
      destinationCode,
      departingFlightId,
      returningFlightId,
      cityStays
    } = body;

    if (!name || !title || !description || pricing === undefined || !days || !includesText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newPackage = await prisma.companyPackage.create({
      data: {
        name,
        title,
        description,
        pricing: Number(pricing),
        originalPricing: originalPricing ? Number(originalPricing) : null,
        days,
        image: image || "/images/bali.png",
        popular: Boolean(popular),
        rating: Number(rating) || 5,
        reviews: Number(reviews) || 0,
        features: Array.isArray(features) ? features : [],
        includesText,
        countryCode: countryCode || null,
        destinationCode: destinationCode || null,
        departingFlightId: departingFlightId || null,
        returningFlightId: returningFlightId || null,
        cityStays: cityStays || []
      }
    });

    return NextResponse.json(newPackage);
  } catch (error: any) {
    console.error("Admin packages POST error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      name,
      title,
      description,
      pricing,
      originalPricing,
      days,
      image,
      popular,
      rating,
      reviews,
      features,
      includesText,
      countryCode,
      destinationCode,
      departingFlightId,
      returningFlightId,
      cityStays
    } = body;

    if (!id || !name || !title || !description || pricing === undefined || !days || !includesText) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const updatedPackage = await prisma.companyPackage.update({
      where: { id },
      data: {
        name,
        title,
        description,
        pricing: Number(pricing),
        originalPricing: originalPricing ? Number(originalPricing) : null,
        days,
        image: image || "/images/bali.png",
        popular: Boolean(popular),
        rating: Number(rating) || 5,
        reviews: Number(reviews) || 0,
        features: Array.isArray(features) ? features : [],
        includesText,
        countryCode: countryCode || null,
        destinationCode: destinationCode || null,
        departingFlightId: departingFlightId || null,
        returningFlightId: returningFlightId || null,
        cityStays: cityStays || []
      }
    });

    return NextResponse.json(updatedPackage);
  } catch (error: any) {
    console.error("Admin packages PUT error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Missing id parameter" }, { status: 400 });
    }

    await prisma.companyPackage.delete({
      where: { id }
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Admin packages DELETE error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
