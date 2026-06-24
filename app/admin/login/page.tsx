"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("اسم المستخدم أو كلمة المرور غير صحيحة");
      } else {
        router.push("/admin");
        router.refresh();
      }
    } catch (err) {
      setError("حدث خطأ أثناء تسجيل الدخول");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
      {/* Background Orbs */}
      <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.15] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary), transparent 75%)" }}
      />
      <div className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] rounded-full blur-[80px] opacity-[0.12] pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-secondary-bright), transparent 75%)" }}
      />

      <div className="w-full max-w-md p-6 md:p-10 relative z-10">
        <div className="glass-panel rounded-3xl p-8 shadow-2xl border border-white/60 relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-bright via-secondary to-secondary-bright/50" />

          <div className="flex justify-center mb-6">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={240}
              height={82}
              className="h-16 w-auto object-contain"
            />
          </div>

          <h2 className="text-2xl font-bold text-center text-primary mb-6">تسجيل دخول المسؤول</h2>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm text-center mb-4 font-bold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5 text-right" dir="rtl">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                اسم المستخدم
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                placeholder="أدخل اسم المستخدم"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                كلمة المرور
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                placeholder="أدخل كلمة المرور"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="gold-shimmer w-full bg-primary text-background py-3.5 rounded-xl font-bold text-base btn-glow cursor-pointer disabled:opacity-50 transition-all flex items-center justify-center gap-2 mt-4"
            >
              {loading ? "جاري تسجيل الدخول..." : "دخول لوحة التحكم"}
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}
