import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, requireAdminWithName } from "@/lib/admin-guard";

// List (without screenshots — they're heavy), or a single full report via ?id=
export async function GET(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      const report = await prisma.bugReport.findUnique({ where: { id } });
      if (!report) return NextResponse.json({ error: "البلاغ غير موجود" }, { status: 404 });
      return NextResponse.json(report);
    }

    const reports = await prisma.bugReport.findMany({
      select: {
        id: true,
        reportNumber: true,
        description: true,
        page: true,
        reporterName: true,
        resolvedAt: true,
        createdAt: true,
      },
      orderBy: { reportNumber: "desc" },
    });
    return NextResponse.json(reports);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const { denied, adminName } = await requireAdminWithName();
  if (denied) return denied;
  try {
    const { description, page, screenshot } = await req.json();
    if (!description || !String(description).trim()) {
      return NextResponse.json({ error: "وصف المشكلة مطلوب" }, { status: 400 });
    }
    // A data-URL JPEG or nothing — reject anything else to keep the column sane
    const shot =
      typeof screenshot === "string" && screenshot.startsWith("data:image/") && screenshot.length < 8_000_000
        ? screenshot
        : null;

    const report = await prisma.bugReport.create({
      data: {
        description: String(description).trim(),
        page: String(page || "").slice(0, 190) || "غير معروفة",
        screenshot: shot,
        reporterName: adminName,
      },
      select: { id: true, reportNumber: true },
    });
    return NextResponse.json(report);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

// Toggle resolved state
export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, resolved } = await req.json();
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    const report = await prisma.bugReport.update({
      where: { id },
      data: { resolvedAt: resolved ? new Date() : null },
    });
    return NextResponse.json({ id: report.id, resolvedAt: report.resolvedAt });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function DELETE(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
    await prisma.bugReport.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
