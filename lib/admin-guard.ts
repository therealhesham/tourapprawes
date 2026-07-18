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

// Same guard, but also identifies which admin is acting — used where actions
// are attributed to a person (e.g. CRM ticket assignment and replies).
export async function requireAdminWithName(): Promise<
  { denied: NextResponse; adminName?: never } | { denied: null; adminName: string }
> {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any)?.role !== "admin") {
    return {
      denied: NextResponse.json({ error: "غير مصرح — يتطلب تسجيل دخول المشرف" }, { status: 401 }),
    };
  }
  return { denied: null, adminName: session.user?.name || "المسؤول" };
}
