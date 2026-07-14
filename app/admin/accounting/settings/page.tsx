"use client";

import { useState, useEffect } from "react";
import { PageHeader, Spinner, Alert, Field, inputCls, PrimaryBtn } from "../ui";
import Icon from "@/components/Icon";

type AuditEntry = { id: string; action: string; entity: string; summary: string; createdAt: string };

const ACTION_LABELS: Record<string, string> = {
  CREATE: "إنشاء",
  CANCEL: "إلغاء",
  REVERSE: "عكس",
  UPDATE: "تحديث",
};

export default function AccountingSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [audit, setAudit] = useState<AuditEntry[]>([]);
  const [form, setForm] = useState({
    companyName: "",
    vatNumber: "",
    crNumber: "",
    address: "",
    phone: "",
    vatRate: "15",
    lockDate: "",
  });

  const loadData = () => {
    Promise.all([
      fetch("/api/admin/accounting/settings").then((r) => r.json()),
      fetch("/api/admin/accounting/audit").then((r) => r.json()),
    ])
      .then(([d, logs]) => {
        if (d.error) setError(d.error);
        else
          setForm({
            companyName: d.companyName || "",
            vatNumber: d.vatNumber || "",
            crNumber: d.crNumber || "",
            address: d.address || "",
            phone: d.phone || "",
            vatRate: String(Number(d.vatRate ?? 15)),
            lockDate: d.lockDate ? String(d.lockDate).slice(0, 10) : "",
          });
        if (Array.isArray(logs)) setAudit(logs);
      })
      .catch(() => setError("حدث خطأ أثناء تحميل الإعدادات."))
      .finally(() => setLoading(false));
  };

  useEffect(loadData, []);

  const submit = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/admin/accounting/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, vatRate: Number(form.vatRate), lockDate: form.lockDate || null }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage("تم حفظ الإعدادات بنجاح.");
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الإعدادات.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader title="إعدادات المحاسبة" subtitle="بيانات المنشأة التي تظهر على الفواتير الضريبية" />
      <Alert error={error} message={message} />

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-6 max-w-2xl space-y-4">
        <Field label="اسم المنشأة">
          <input className={inputCls} value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} />
        </Field>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="الرقم الضريبي (15 خانة)">
            <input className={inputCls} dir="ltr" value={form.vatNumber} onChange={(e) => setForm({ ...form, vatNumber: e.target.value })} />
          </Field>
          <Field label="السجل التجاري">
            <input className={inputCls} dir="ltr" value={form.crNumber} onChange={(e) => setForm({ ...form, crNumber: e.target.value })} />
          </Field>
          <Field label="الهاتف">
            <input className={inputCls} dir="ltr" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </Field>
          <Field label="نسبة الضريبة الافتراضية %">
            <input type="number" className={inputCls} value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })} />
          </Field>
        </div>
        <Field label="العنوان">
          <input className={inputCls} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
        </Field>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
          <Field label="إقفال الفترة المحاسبية حتى تاريخ (اختياري)">
            <input type="date" className={inputCls} value={form.lockDate} onChange={(e) => setForm({ ...form, lockDate: e.target.value })} />
          </Field>
          <p className="text-xs text-amber-700 font-bold mt-2">
            بعد الإقفال لا يمكن تسجيل أو عكس أي قيد بتاريخ يقع داخل الفترة المقفلة — استخدمه بعد تقديم الإقرار الضريبي لكل ربع سنة.
          </p>
        </div>
        <div className="flex justify-end">
          <PrimaryBtn onClick={submit} disabled={saving}>
            {saving ? "جاري الحفظ..." : "حفظ الإعدادات"}
          </PrimaryBtn>
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-6">
        <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
          <Icon name="history" className="text-secondary" />
          سجل التدقيق — آخر العمليات
        </h3>
        {audit.length === 0 ? (
          <p className="text-slate-500">لا توجد عمليات مسجلة بعد.</p>
        ) : (
          <div className="overflow-x-auto max-h-96 overflow-y-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100">
                  <th className="py-2 px-3 font-bold">الوقت</th>
                  <th className="py-2 px-3 font-bold">العملية</th>
                  <th className="py-2 px-3 font-bold">التفاصيل</th>
                </tr>
              </thead>
              <tbody>
                {audit.map((a) => (
                  <tr key={a.id} className="border-b border-slate-50">
                    <td className="py-2 px-3 text-slate-500 whitespace-nowrap">
                      {new Date(a.createdAt).toLocaleString("en-GB")}
                    </td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        a.action === "CANCEL" || a.action === "REVERSE" ? "bg-red-50 text-red-700" : "bg-blue-50 text-blue-700"
                      }`}>
                        {ACTION_LABELS[a.action] || a.action}
                      </span>
                    </td>
                    <td className="py-2 px-3">{a.summary}</td>
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
