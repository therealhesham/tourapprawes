"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  fmtDate,
  PageHeader,
  Spinner,
  Alert,
  Modal,
  Field,
  inputCls,
  PrimaryBtn,
  docNo,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CHANNEL,
  StatusBadge,
} from "../ui";

type Ticket = {
  id: string;
  ticketNumber: number;
  subject: string;
  status: string;
  priority: string;
  channel: string;
  assignee: string | null;
  createdAt: string;
  updatedAt: string;
  customer: { id: string; name: string; phone: string };
  _count: { messages: number };
};

type CustomerOpt = { id: string; name: string; phone: string };

const emptyForm = {
  subject: "",
  description: "",
  priority: "MEDIUM",
  channel: "PHONE",
  customerId: "",
  customerName: "",
  customerPhone: "",
};

export default function TicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customers, setCustomers] = useState<CustomerOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  // Dashboard cards link here with ?status= / ?priority= presets
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setStatusFilter(params.get("status") || "");
    setPriorityFilter(params.get("priority") || "");
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      if (priorityFilter) qs.set("priority", priorityFilter);
      const [resTic, resCus] = await Promise.all([
        fetch(`/api/admin/crm/tickets?${qs}`),
        fetch("/api/admin/crm/customers"),
      ]);
      const dataTic = await resTic.json();
      if (dataTic.error) setError(dataTic.error);
      else setTickets(dataTic);
      const dataCus = await resCus.json();
      if (!dataCus.error && Array.isArray(dataCus)) setCustomers(dataCus);
    } catch {
      setError("حدث خطأ أثناء تحميل التذاكر.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, priorityFilter]);

  const filtered = tickets.filter((t) => {
    const q = query.trim();
    if (!q) return true;
    return (
      t.subject.includes(q) ||
      t.customer.name.includes(q) ||
      t.customer.phone.includes(q) ||
      docNo("TKT", t.ticketNumber).includes(q)
    );
  });

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customerId: form.customerId || null,
        }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage(`تم فتح التذكرة ${docNo("TKT", data.ticketNumber)}.`);
        setShowForm(false);
        setForm(emptyForm);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء فتح التذكرة.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="تذاكر الدعم"
        subtitle="استفسارات وشكاوى وطلبات العملاء"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="add_circle" />
            تذكرة جديدة
          </PrimaryBtn>
        }
      />
      <Alert error={error} message={message} />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            className={`${inputCls} pr-10`}
            placeholder="بحث بالموضوع أو العميل أو الرقم..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <select className={`${inputCls} sm:w-44`} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">كل الحالات</option>
          {Object.entries(TICKET_STATUS).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
        <select className={`${inputCls} sm:w-44`} value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
          <option value="">كل الأولويات</option>
          {Object.entries(TICKET_PRIORITY).map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الرقم</th>
                <th className="py-3 px-4 font-bold">الموضوع</th>
                <th className="py-3 px-4 font-bold">العميل</th>
                <th className="py-3 px-4 font-bold">القناة</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">الأولوية</th>
                <th className="py-3 px-4 font-bold">المسؤول</th>
                <th className="py-3 px-4 font-bold">الردود</th>
                <th className="py-3 px-4 font-bold">آخر تحديث</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    لا توجد تذاكر مطابقة.
                  </td>
                </tr>
              )}
              {filtered.map((t) => (
                <tr key={t.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-primary">
                    <Link href={`/admin/crm/tickets/${t.id}`} className="hover:underline">
                      {docNo("TKT", t.ticketNumber)}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    <Link href={`/admin/crm/tickets/${t.id}`} className="hover:text-secondary">
                      {t.subject}
                    </Link>
                  </td>
                  <td className="py-3 px-4">
                    {t.customer.name}
                    <span className="block text-xs text-slate-400" dir="ltr">{t.customer.phone}</span>
                  </td>
                  <td className="py-3 px-4">{TICKET_CHANNEL[t.channel] || t.channel}</td>
                  <td className="py-3 px-4"><StatusBadge value={t.status} map={TICKET_STATUS} /></td>
                  <td className="py-3 px-4"><StatusBadge value={t.priority} map={TICKET_PRIORITY} /></td>
                  <td className="py-3 px-4 text-slate-500">{t.assignee || "—"}</td>
                  <td className="py-3 px-4">{t._count.messages}</td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(t.updatedAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="تذكرة دعم جديدة" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <Field label="العميل">
              <select
                className={inputCls}
                value={form.customerId}
                onChange={(e) => setForm({ ...form, customerId: e.target.value })}
              >
                <option value="">— عميل جديد (أدخل البيانات أدناه) —</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} | {c.phone}
                  </option>
                ))}
              </select>
            </Field>
            {!form.customerId && (
              <div className="grid grid-cols-2 gap-4">
                <Field label="اسم العميل *">
                  <input className={inputCls} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} />
                </Field>
                <Field label="رقم الجوال *">
                  <input className={inputCls} dir="ltr" value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} />
                </Field>
              </div>
            )}
            <Field label="الموضوع *">
              <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
            </Field>
            <Field label="التفاصيل">
              <textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="الأولوية">
                <select className={inputCls} value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}>
                  {Object.entries(TICKET_PRIORITY).map(([k, v]) => (
                    <option key={k} value={k}>{v.label}</option>
                  ))}
                </select>
              </Field>
              <Field label="القناة">
                <select className={inputCls} value={form.channel} onChange={(e) => setForm({ ...form, channel: e.target.value })}>
                  {Object.entries(TICKET_CHANNEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "فتح التذكرة"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
