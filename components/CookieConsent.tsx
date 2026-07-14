"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

const CONSENT_COOKIE = "cookie_consent";
const CONSENT_MAX_AGE = 60 * 60 * 24 * 365; // one year

export function getCookieConsent(): "accepted" | "rejected" | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${CONSENT_COOKIE}=(accepted|rejected)`));
  return match ? (match[1] as "accepted" | "rejected") : null;
}

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!getCookieConsent()) {
      setVisible(true);
    }
  }, []);

  const saveChoice = (choice: "accepted" | "rejected") => {
    document.cookie = `${CONSENT_COOKIE}=${choice}; max-age=${CONSENT_MAX_AGE}; path=/; SameSite=Lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="الموافقة على ملفات تعريف الارتباط"
      className="fixed bottom-0 inset-x-0 z-[100] p-4 md:p-6 animate-fade-in-up"
      dir="rtl"
    >
      <div className="glass-panel max-w-3xl mx-auto rounded-2xl border border-outline-variant/40 shadow-2xl bg-surface-container-lowest/95 backdrop-blur-md p-5 md:p-6">
        <div className="flex items-start gap-3 mb-4">
          <Icon name="cookie" className="text-secondary text-2xl shrink-0" />
          <div>
            <h4 className="font-bold text-primary text-lg mb-1">ملفات تعريف الارتباط</h4>
            <p className="text-sm text-on-surface/80 leading-relaxed">
              نستخدم ملفات تعريف الارتباط لتحسين تجربتك في التصفح وتذكّر تفضيلاتك وتحليل استخدام الموقع.
              يمكنك قبولها أو رفضها، ولن يؤثر الرفض على الوظائف الأساسية للموقع.
            </p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
          <button
            onClick={() => saveChoice("rejected")}
            className="px-6 py-2.5 rounded-xl border border-outline-variant/40 text-on-surface font-bold text-sm hover:border-secondary/50 hover:bg-white/5 transition-all"
          >
            رفض
          </button>
          <button
            onClick={() => saveChoice("accepted")}
            className="gold-shimmer bg-primary text-background px-8 py-2.5 rounded-xl font-bold text-sm btn-glow transition-all"
          >
            قبول الكل
          </button>
        </div>
      </div>
    </div>
  );
}
