import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { prisma } from "@/lib/prisma";
import { authOptions, hashPassword } from "@/lib/auth";
import { requireAdmin } from "@/lib/admin-guard";

export async function GET() {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const session = await getServerSession(authOptions);
    const currentId = ((session?.user as any)?.id as string | null) || null;
    const admins = await prisma.admin.findMany({
      select: { id: true, username: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    });
    return NextResponse.json(admins.map((a) => ({ ...a, isCurrent: a.id === currentId })));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { username, name, password } = await req.json();
    if (!username || !String(username).trim() || !name || !String(name).trim()) {
      return NextResponse.json({ error: "اسم المستخدم واسم الموظف مطلوبان" }, { status: 400 });
    }
    if (!password || String(password).length < 6) {
      return NextResponse.json({ error: "كلمة المرور مطلوبة (6 أحرف على الأقل)" }, { status: 400 });
    }
    const uname = String(username).trim().toLowerCase();
    const existing = await prisma.admin.findUnique({ where: { username: uname } });
    if (existing) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم بالفعل" }, { status: 400 });
    }
    const admin = await prisma.admin.create({
      data: {
        username: uname,
        name: String(name).trim(),
        passwordHash: hashPassword(String(password)),
      },
      select: { id: true, username: true, name: true, createdAt: true },
    });
    return NextResponse.json(admin);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  const denied = await requireAdmin();
  if (denied) return denied;
  try {
    const { id, username, name, password } = await req.json();
    if (!id || !username || !String(username).trim() || !name || !String(name).trim()) {
      return NextResponse.json({ error: "المعرف واسم المستخدم واسم الموظف مطلوبة" }, { status: 400 });
    }
    if (password && String(password).length < 6) {
      return NextResponse.json({ error: "كلمة المرور الجديدة يجب أن تكون 6 أحرف على الأقل" }, { status: 400 });
    }
    const uname = String(username).trim().toLowerCase();
    const clash = await prisma.admin.findUnique({ where: { username: uname } });
    if (clash && clash.id !== id) {
      return NextResponse.json({ error: "اسم المستخدم مستخدم لموظف آخر" }, { status: 400 });
    }
    const admin = await prisma.admin.update({
      where: { id },
      data: {
        username: uname,
        name: String(name).trim(),
        // Leaving the password field empty keeps the current password
        ...(password ? { passwordHash: hashPassword(String(password)) } : {}),
      },
      select: { id: true, username: true, name: true, createdAt: true },
    });
    return NextResponse.json(admin);
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

    const session = await getServerSession(authOptions);
    const currentId = ((session?.user as any)?.id as string | null) || null;
    if (id === currentId) {
      return NextResponse.json({ error: "لا يمكنك حذف حسابك الذي سجّلت الدخول به" }, { status: 400 });
    }
    const count = await prisma.admin.count();
    if (count <= 1) {
      return NextResponse.json({ error: "لا يمكن حذف آخر حساب موظف في النظام" }, { status: 400 });
    }
    await prisma.admin.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
