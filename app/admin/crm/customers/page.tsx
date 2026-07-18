"use client";

import { useState, useEffect, useMemo } from "react";
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
} from "../ui";

type Customer = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  city: string | null;
  notes: string | null;
  createdAt: string;
  ticketCount: number;
  openTicketCount: number;
  bookingCount: number;
};

const emptyForm = { id: "", name: "", phone: "", email: "", city: "", notes: "" };

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/crm/customers");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setCustomers(data);
    } catch {
      setError("حدث خطأ أثناء تحميل العملاء.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return customers;
    return customers.filter(
      (c) => c.name.includes(q) || c.phone.includes(q) || (c.email || "").includes(q) || (c.city || "").includes(q)
    );
  }, [customers, query]);

  const openNew = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (c: Customer) => {
    setForm({ id: c.id, name: c.name, phone: c.phone, email: c.email || "", city: c.city || "", notes: c.notes || "" });
    setShowForm(true);
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/customers", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.id ? form : { ...form, id: undefined }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage(form.id ? "تم تحديث بيانات العميل." : "تم إضافة العميل.");
        setShowForm(false);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (c: Customer) => {
    if (!confirm(`سيتم حذف العميل «${c.name}». متابعة؟`)) return;
    const res = await fetch(`/api/admin/crm/customers?id=${c.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم حذف العميل.");
      loadData();
    }
  };

  const syncFromBookings = async () => {
    setSyncing(true);
    setError("");
    try {
      const res = await fetch("/api/admin/crm/customers/sync", { method: "POST" });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage(data.created > 0 ? `تم استيراد ${data.created} عميل من الحجوزات.` : "لا يوجد عملاء جدد للاستيراد.");
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء الاستيراد.");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="العملاء"
        subtitle="سجل عملاء الشركة وبيانات التواصل"
        actions={
          <>
            <button
              onClick={syncFromBookings}
              disabled={syncing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-primary border border-primary/20 hover:bg-primary/5 transition-all disabled:opacity-50"
            >
              <Icon name="refresh" className={syncing ? "animate-spin" : ""} />
              {syncing ? "جاري الاستيراد..." : "استيراد من الحجوزات"}
            </button>
            <PrimaryBtn onClick={openNew}>
              <Icon name="add_circle" />
              عميل جديد
            </PrimaryBtn>
          </>
        }
      />
      <Alert error={error} message={message} />

      <div className="relative max-w-md">
        <Icon name="search" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          className={`${inputCls} pr-10`}
          placeholder="بحث بالاسم أو الجوال أو المدينة..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الاسم</th>
                <th className="py-3 px-4 font-bold">الجوال</th>
                <th className="py-3 px-4 font-bold">البريد</th>
                <th className="py-3 px-4 font-bold">المدينة</th>
                <th className="py-3 px-4 font-bold">الحجوزات</th>
                <th className="py-3 px-4 font-bold">التذاكر</th>
                <th className="py-3 px-4 font-bold">أضيف في</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    {customers.length === 0
                      ? "لا يوجد عملاء بعد — أضف عميلاً أو استورد من الحجوزات."
                      : "لا توجد نتائج مطابقة للبحث."}
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-primary">{c.name}</td>
                  <td className="py-3 px-4" dir="ltr">{c.phone}</td>
                  <td className="py-3 px-4 text-slate-500">{c.email || "—"}</td>
                  <td className="py-3 px-4">{c.city || "—"}</td>
                  <td className="py-3 px-4">{c.bookingCount}</td>
                  <td className="py-3 px-4">
                    {c.ticketCount}
                    {c.openTicketCount > 0 && (
                      <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        {c.openTicketCount} نشطة
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(c.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(c)} className="text-slate-400 hover:text-primary" title="تعديل">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      <button onClick={() => remove(c)} className="text-red-300 hover:text-red-600" title="حذف">
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title={form.id ? "تعديل بيانات العميل" : "عميل جديد"} onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <Field label="اسم العميل *">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="رقم الجوال *">
                <input className={inputCls} dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </Field>
              <Field label="المدينة">
                <input className={inputCls} value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
              </Field>
            </div>
            <Field label="البريد الإلكتروني">
              <input className={inputCls} dir="ltr" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </Field>
            <Field label="ملاحظات">
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة العميل"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
