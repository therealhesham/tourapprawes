import { NextResponse } from "next/server";
import { requireAdmin, syncCustomersFromBookings } from "@/lib/crm";

// Backfill customers from existing booking records (deduped by phone)
export async function POST() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const result = await syncCustomersFromBookings();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
