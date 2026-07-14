import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin, getSettings } from "@/lib/accounting";
import { zatcaQrBase64 } from "@/lib/zatca";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id } = await params;
    const invoice = await prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        receipts: { where: { cancelledAt: null }, orderBy: { date: "asc" } },
        customizedPackage: { select: { id: true, clientName: true, startDate: true, endDate: true } },
      },
    });
    if (!invoice) return NextResponse.json({ error: "الفاتورة غير موجودة" }, { status: 404 });
    const settings = await getSettings();

    // ZATCA Phase 1 QR — only meaningful once the VAT number is configured
    const zatcaQr = settings.vatNumber
      ? zatcaQrBase64({
          sellerName: settings.companyName,
          vatNumber: settings.vatNumber,
          timestamp: invoice.issueDate,
          total: Number(invoice.total),
          vatAmount: Number(invoice.vatAmount),
        })
      : null;

    return NextResponse.json({ invoice, settings, zatcaQr });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
