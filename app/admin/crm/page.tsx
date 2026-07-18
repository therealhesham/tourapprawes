"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  fmtDate,
  PageHeader,
  Spinner,
  Alert,
  docNo,
  TICKET_STATUS,
  TICKET_PRIORITY,
  StatusBadge,
} from "./ui";

type Summary = {
  customerCount: number;
  openCount: number;
  statusCounts: Record<string, number>;
  priorityCounts: Record<string, number>;
  recentTickets: {
    id: string;
    ticketNumber: number;
    subject: string;
    status: string;
    priority: string;
    updatedAt: string;
    customer: { id: string; name: string; phone: string };
  }[];
};

export default function CrmDashboardPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/crm/summary")
      .then((r) => r.json())
      .then((data) => (data.error ? setError(data.error) : setSummary(data)))
      .catch(() => setError("حدث خطأ أثناء تحميل ملخص خدمة العملاء."));
  }, []);

  if (error) return <Alert error={error} />;
  if (!summary) return <Spinner />;

  const cards = [
    { label: "العملاء", value: summary.customerCount, icon: "person", cls: "text-primary", href: "/admin/crm/customers" },
    { label: "تذاكر نشطة", value: summary.openCount, icon: "sms", cls: "text-amber-600", href: "/admin/crm/tickets" },
    { label: "تم حلها", value: summary.statusCounts.RESOLVED || 0, icon: "check_circle", cls: "text-green-600", href: "/admin/crm/tickets?status=RESOLVED" },
    { label: "عاجلة", value: summary.priorityCounts.URGENT || 0, icon: "flash_on", cls: "text-red-600", href: "/admin/crm/tickets?priority=URGENT" },
  ];

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader title="خدمة العملاء (CRM)" subtitle="متابعة العملاء وتذاكر الدعم والاستفسارات" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="glass-panel rounded-3xl border border-white/60 shadow-xl p-5 hover:shadow-2xl transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-slate-500 text-sm font-bold">{c.label}</span>
              <Icon name={c.icon} className={`text-2xl ${c.cls}`} />
            </div>
            <p className={`text-3xl font-extrabold ${c.cls}`}>{c.value}</p>
          </Link>
        ))}
      </div>

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-slate-100">
          <h3 className="text-lg font-extrabold text-primary">أحدث النشاط</h3>
          <Link href="/admin/crm/tickets" className="text-sm font-bold text-secondary hover:underline">
            كل التذاكر
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الرقم</th>
                <th className="py-3 px-4 font-bold">الموضوع</th>
                <th className="py-3 px-4 font-bold">العميل</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">الأولوية</th>
                <th className="py-3 px-4 font-bold">آخر تحديث</th>
              </tr>
            </thead>
            <tbody>
              {summary.recentTickets.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500">
                    لا توجد تذاكر دعم بعد.
                  </td>
                </tr>
              )}
              {summary.recentTickets.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-primary">
                    <Link href={`/admin/crm/tickets/${t.id}`} className="hover:underline">
                      {docNo("TKT", t.ticketNumber)}
                    </Link>
                  </td>
                  <td className="py-3 px-4">{t.subject}</td>
                  <td className="py-3 px-4">{t.customer.name}</td>
                  <td className="py-3 px-4"><StatusBadge value={t.status} map={TICKET_STATUS} /></td>
                  <td className="py-3 px-4"><StatusBadge value={t.priority} map={TICKET_PRIORITY} /></td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
