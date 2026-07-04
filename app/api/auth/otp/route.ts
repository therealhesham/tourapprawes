import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhone, hashOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/sms";

const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000; // 1 minute between requests

export async function POST(req: Request) {
  try {
    const { phone: rawPhone } = await req.json();

    const phone = normalizePhone(String(rawPhone || ""));
    if (!phone) {
      return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
    }

    // Rate limit: one code per phone per cooldown window
    const recent = await prisma.otpCode.findFirst({
      where: { phone, createdAt: { gt: new Date(Date.now() - RESEND_COOLDOWN_MS) } },
    });
    if (recent) {
      return NextResponse.json(
        { error: "تم إرسال كود بالفعل، انتظر دقيقة قبل إعادة المحاولة" },
        { status: 429 }
      );
    }

    const code = crypto.randomInt(100000, 1000000).toString();

    await prisma.otpCode.deleteMany({ where: { phone } });
    await prisma.otpCode.create({
      data: {
        phone,
        codeHash: hashOtp(phone, code),
        expiresAt: new Date(Date.now() + OTP_TTL_MS),
      },
    });

    await sendOtpSms(phone, code);

    return NextResponse.json({
      success: true,
      phone,
      // Expose the code in development only (no SMS provider wired up yet)
      ...(process.env.NODE_ENV !== "production" ? { devCode: code } : {}),
    });
  } catch (error: any) {
    console.error("OTP request error:", error);
    return NextResponse.json({ error: "حدث خطأ، حاول مرة أخرى" }, { status: 500 });
  }
}
