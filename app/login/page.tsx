"use client";

import React, { useState, useEffect, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/booking";

  const [step, setStep] = useState<"phone" | "code">("phone");
  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [devCode, setDevCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  useEffect(() => {
    if (resendIn <= 0) return;
    const t = setTimeout(() => setResendIn(resendIn - 1), 1000);
    return () => clearTimeout(t);
  }, [resendIn]);

  const requestOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "حدث خطأ، حاول مرة أخرى");
        return;
      }
      if (data.devCode) setDevCode(data.devCode);
      setStep("code");
      setResendIn(60);
    } catch {
      setError("تعذر الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await signIn("client-otp", {
        redirect: false,
        phone,
        code,
      });
      if (res?.ok) {
        router.push(callbackUrl);
        router.refresh();
      } else {
        setError("الكود غير صحيح أو انتهت صلاحيته");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4" dir="rtl">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <Link href="/">
            <Image
              src="/logo-main.png"
              alt="Rawaes Logo"
              width={697}
              height={238}
              className="h-[60px] w-auto object-contain"
            />
          </Link>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.05)] p-8">
          <div className="text-center mb-8">
            <span className="material-symbols-outlined text-primary text-5xl mb-3 block">
              {step === "phone" ? "smartphone" : "pin"}
            </span>
            <h1 className="text-2xl font-black text-primary mb-2">
              {step === "phone" ? "تسجيل الدخول" : "أدخل كود التحقق"}
            </h1>
            <p className="text-gray-500 text-sm">
              {step === "phone"
                ? "أدخل رقم جوالك وسنرسل لك كود تحقق"
                : `أرسلنا كود تحقق إلى ${phone}`}
            </p>
          </div>

          {step === "phone" ? (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                requestOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">رقم الجوال</label>
                <input
                  type="tel"
                  dir="ltr"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="05xxxxxxxx"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center font-bold focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white hover:bg-[#1e1b4b] py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">sms</span>
                    إرسال كود التحقق
                  </>
                )}
              </button>
            </form>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                verifyOtp();
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-gray-600 text-sm font-bold mb-2">كود التحقق</label>
                <input
                  type="text"
                  inputMode="numeric"
                  dir="ltr"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center font-black text-2xl tracking-[0.5em] focus:border-primary focus:ring-primary"
                  required
                />
              </div>

              {devCode && (
                <p className="text-amber-600 text-xs font-semibold text-center bg-amber-50 border border-amber-200 rounded-lg py-2">
                  وضع التطوير — الكود: <span dir="ltr" className="font-black">{devCode}</span>
                </p>
              )}

              {error && (
                <p className="text-red-600 text-sm font-semibold text-center">{error}</p>
              )}

              <button
                type="submit"
                disabled={loading || code.length < 6}
                className="w-full bg-primary text-white hover:bg-[#1e1b4b] py-3 rounded-xl font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[20px]">login</span>
                    تسجيل الدخول
                  </>
                )}
              </button>

              <div className="flex justify-between items-center text-sm pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStep("phone");
                    setCode("");
                    setError("");
                  }}
                  className="text-gray-500 hover:text-primary font-semibold"
                >
                  تغيير الرقم
                </button>
                <button
                  type="button"
                  disabled={resendIn > 0 || loading}
                  onClick={requestOtp}
                  className="text-primary font-bold disabled:text-gray-400"
                >
                  {resendIn > 0 ? `إعادة الإرسال (${resendIn})` : "إعادة إرسال الكود"}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-gray-400 text-xs mt-6">
          بتسجيل الدخول أنت توافق على شروط الاستخدام وسياسة الخصوصية
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}
