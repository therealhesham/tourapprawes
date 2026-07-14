"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { fmtMoney, fmtDate, PageHeader, Spinner, docNo } from "./ui";

type Summary = {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  cash: number;
  bank: number;
  receivables: number;
  vatDue: number;
  invoiceCount: number;
  unpaidInvoices: number;
  recentEntries: {
    id: string;
    entryNumber: number;
    date: string;
    description: string;
    reference: string | null;
    lines: { id: string; debit: string; credit: string; account: { name: string } }[];
  }[];
};

export default function AccountingDashboard() {
  const [data, setData] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/accounting/summary")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error) setData(d);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (!data) return <p className="text-red-600 font-bold">تعذر تحميل البيانات المحاسبية.</p>;

  const cards = [
    { label: "صافي الربح", value: fmtMoney(data.netProfit), icon: "trending_up", color: data.netProfit >= 0 ? "from-green-500/20 to-green-600/10" : "from-red-500/20 to-red-600/10", link: "/admin/accounting/reports" },
    { label: "إجمالي الإيرادات", value: fmtMoney(data.totalRevenue), icon: "payments", color: "from-blue-500/20 to-blue-600/10", link: "/admin/accounting/invoices" },
    { label: "إجمالي المصروفات", value: fmtMoney(data.totalExpenses), icon: "shopping_cart", color: "from-amber-500/20 to-amber-600/10", link: "/admin/accounting/payments" },
    { label: "ذمم العملاء (مستحق التحصيل)", value: fmtMoney(data.receivables), icon: "account_balance_wallet", color: "from-purple-500/20 to-purple-600/10", link: "/admin/accounting/receipts" },
    { label: "رصيد الصندوق", value: fmtMoney(data.cash), icon: "point_of_sale", color: "from-teal-500/20 to-teal-600/10", link: "/admin/accounting/reports" },
    { label: "رصيد البنك", value: fmtMoney(data.bank), icon: "account_balance", color: "from-sky-500/20 to-sky-600/10", link: "/admin/accounting/reports" },
    { label: "ضريبة مستحقة للهيئة", value: fmtMoney(data.vatDue), icon: "receipt_long", color: "from-rose-500/20 to-rose-600/10", link: "/admin/accounting/reports" },
    { label: "فواتير غير مسددة", value: String(data.unpaidInvoices), icon: "pending_actions", color: "from-indigo-500/20 to-indigo-600/10", link: "/admin/accounting/invoices" },
  ];

  const quickLinks = [
    { label: "فاتورة جديدة", href: "/admin/accounting/invoices", icon: "receipt_long" },
    { label: "سند قبض", href: "/admin/accounting/receipts", icon: "download" },
    { label: "سند صرف", href: "/admin/accounting/payments", icon: "upload" },
    { label: "قيد يدوي", href: "/admin/accounting/journal", icon: "edit_note" },
  ];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <PageHeader title="المحاسبة" subtitle="نظرة عامة على الوضع المالي — قيد مزدوج" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((card, idx) => (
          <Link
            key={idx}
            href={card.link}
            className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-36"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <span className="material-symbols-outlined text-secondary text-2xl">{card.icon}</span>
              </div>
            </div>
            <div>
              <p className="text-xl font-black text-primary tracking-tight">{card.value}</p>
              <p className="text-sm font-bold text-slate-500 mt-1">{card.label}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
          <span className="material-symbols-outlined text-secondary">flash_on</span>
          عمليات سريعة
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {quickLinks.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="flex items-center justify-center gap-3 p-4 bg-primary text-background rounded-xl font-bold hover:shadow-lg transition-all btn-glow"
            >
              <span className="material-symbols-outlined">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
          <span className="material-symbols-outlined text-secondary">history</span>
          آخر القيود
        </h3>
        {data.recentEntries.length === 0 ? (
          <p className="text-slate-500">لا توجد قيود بعد — ابدأ بإصدار فاتورة أو تسجيل سند.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2 px-3 font-bold">رقم القيد</th>
                  <th className="py-2 px-3 font-bold">التاريخ</th>
                  <th className="py-2 px-3 font-bold">البيان</th>
                  <th className="py-2 px-3 font-bold">المرجع</th>
                  <th className="py-2 px-3 font-bold">القيمة</th>
                </tr>
              </thead>
              <tbody>
                {data.recentEntries.map((e) => (
                  <tr key={e.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-2 px-3 font-bold text-primary">{docNo("JV", e.entryNumber)}</td>
                    <td className="py-2 px-3">{fmtDate(e.date)}</td>
                    <td className="py-2 px-3">{e.description}</td>
                    <td className="py-2 px-3 text-slate-500">{e.reference || "—"}</td>
                    <td className="py-2 px-3 font-bold">
                      {fmtMoney(e.lines.reduce((s, l) => s + Number(l.debit), 0))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
