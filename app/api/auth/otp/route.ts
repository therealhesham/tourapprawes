import { NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { normalizePhone, hashOtp } from "@/lib/auth";
import { sendOtpSms } from "@/lib/sms";

const OTP_TTL_MS = 5 * 60 * 1000;         // 5 minutes
const RESEND_COOLDOWN_MS = 60 * 1000;      // 1 minute between requests

export async function POST(req: Request) {
  try {
    const { phone: rawPhone } = await req.json();

    const phone = normalizePhone(String(rawPhone || ""));
    if (!phone) {
      return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
    }

    // Rate-limit: check for a recent OTP record via the unique phone index (fast)
    const existing = await prisma.otpCode.findUnique({ where: { phone } });

    if (existing) {
      const msSinceSent = Date.now() - existing.createdAt.getTime();
      const cooldownRemaining = RESEND_COOLDOWN_MS - msSinceSent;

      if (cooldownRemaining > 0) {
        return NextResponse.json(
          {
            error: "تم إرسال كود بالفعل، انتظر دقيقة قبل إعادة المحاولة",
            cooldownRemainingSeconds: Math.ceil(cooldownRemaining / 1000),
          },
          { status: 429 }
        );
      }
    }

    const code = crypto.randomInt(100000, 1000000).toString();
    const now = new Date();

    // Upsert: one DB round-trip replaces the old deleteMany + create pair
    await prisma.otpCode.upsert({
      where: { phone },
      create: {
        phone,
        codeHash: hashOtp(phone, code),
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        attempts: 0,
        createdAt: now,
      },
      update: {
        codeHash: hashOtp(phone, code),
        expiresAt: new Date(now.getTime() + OTP_TTL_MS),
        attempts: 0,
        createdAt: now,
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
