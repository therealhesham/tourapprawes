"use client";

import { ReactNode } from "react";

export const fmtMoney = (n: number | string | null | undefined) =>
  `${Number(n || 0).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ر.س`;

export const fmtDate = (d: string | Date | null | undefined) =>
  d ? new Date(d).toLocaleDateString("en-GB") : "—";

export const todayInput = () => new Date().toISOString().slice(0, 10);

export const ACCOUNT_TYPE_LABELS: Record<string, string> = {
  ASSET: "أصول",
  LIABILITY: "التزامات",
  EQUITY: "حقوق ملكية",
  REVENUE: "إيرادات",
  EXPENSE: "مصروفات",
};

export const METHOD_LABELS: Record<string, string> = {
  CASH: "نقداً",
  BANK_TRANSFER: "تحويل بنكي",
  CARD: "بطاقة",
  OTHER: "أخرى",
};

export const INVOICE_STATUS: Record<string, { label: string; cls: string }> = {
  ISSUED: { label: "غير مسددة", cls: "bg-amber-100 text-amber-800" },
  PARTIALLY_PAID: { label: "مسددة جزئياً", cls: "bg-blue-100 text-blue-800" },
  PAID: { label: "مسددة", cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "ملغاة", cls: "bg-slate-200 text-slate-600" },
};

export const docNo = (prefix: string, n: number) => `${prefix}-${String(n).padStart(5, "0")}`;

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h2 className="text-3xl font-extrabold text-primary mb-1">{title}</h2>
        {subtitle && <p className="text-slate-600">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-3">{actions}</div>}
    </div>
  );
}

export function Spinner() {
  return (
    <div className="flex justify-center items-center h-64">
      <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export function Alert({ error, message }: { error?: string; message?: string }) {
  if (!error && !message) return null;
  return (
    <div
      className={`p-4 rounded-xl font-bold text-sm ${
        error ? "bg-red-50 text-red-700 border border-red-200" : "bg-green-50 text-green-700 border border-green-200"
      }`}
    >
      {error || message}
    </div>
  );
}

export function Modal({ title, onClose, children, wide }: { title: string; onClose: () => void; children: ReactNode; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto" dir="rtl">
      <div className={`bg-white rounded-2xl shadow-2xl w-full ${wide ? "max-w-3xl" : "max-w-lg"} my-8`}>
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-primary">{title}</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <label className={`block ${className || ""}`}>
      <span className="block text-sm font-bold text-slate-600 mb-1">{label}</span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full rounded-xl border-slate-200 bg-white focus:border-secondary focus:ring-secondary text-sm";

export function PrimaryBtn({ children, onClick, disabled, type }: { children: ReactNode; onClick?: () => void; disabled?: boolean; type?: "button" | "submit" }) {
  return (
    <button
      type={type || "button"}
      onClick={onClick}
      disabled={disabled}
      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
    >
      {children}
    </button>
  );
}
