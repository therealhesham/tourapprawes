import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSettings } from "@/lib/accounting";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    return NextResponse.json(await getSettings());
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const body = await req.json();
    const { companyName, vatNumber, crNumber, address, phone, vatRate, lockDate } = body;
    const settings = await prisma.accountingSettings.upsert({
      where: { id: "main" },
      update: {
        ...(companyName !== undefined ? { companyName } : {}),
        ...(vatNumber !== undefined ? { vatNumber } : {}),
        ...(crNumber !== undefined ? { crNumber } : {}),
        ...(address !== undefined ? { address } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(vatRate !== undefined ? { vatRate: Number(vatRate) } : {}),
        ...(lockDate !== undefined ? { lockDate: lockDate ? new Date(lockDate) : null } : {}),
      },
      create: {
        id: "main",
        companyName: companyName || "معاون للسياحة",
        vatNumber: vatNumber || "",
        crNumber: crNumber || "",
        address: address || "",
        phone: phone || "",
        vatRate: vatRate !== undefined ? Number(vatRate) : 15,
        lockDate: lockDate ? new Date(lockDate) : null,
      },
    });
    await prisma.auditLog.create({
      data: {
        action: "UPDATE",
        entity: "SETTINGS",
        summary: `تحديث إعدادات المحاسبة${lockDate !== undefined ? ` (تاريخ الإقفال: ${lockDate || "بدون"})` : ""}`,
      },
    });
    return NextResponse.json(settings);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
