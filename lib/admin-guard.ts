import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// Session guard for admin API routes: returns a 401 response to send back,
// or null when the caller is an authenticated admin.
export async function requireAdmin(): Promise<NextResponse | null> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return NextResponse.json({ error: "غير مصرح — يتطلب تسجيل دخول المشرف" }, { status: 401 });
  }
  return null;
}
