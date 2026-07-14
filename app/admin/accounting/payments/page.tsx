"use client";

import { useState, useEffect } from "react";
import {
  fmtMoney,
  fmtDate,
  todayInput,
  PageHeader,
  Spinner,
  Alert,
  Modal,
  Field,
  inputCls,
  PrimaryBtn,
  METHOD_LABELS,
  docNo,
} from "../ui";

type Voucher = {
  id: string;
  voucherNumber: number;
  date: string;
  amount: string;
  vatAmount: string;
  method: string;
  payee: string;
  description: string;
  cancelledAt: string | null;
  expenseAccount: { id: string; code: string; name: string } | null;
  customizedPackage?: { id: string; clientName: string; startDate: string } | null;
  supplierInvoice?: { id: string; invoiceNumber: number; supplierName: string } | null;
};

type Account = { id: string; code: string; name: string; type: string; isActive: boolean };
type Booking = { id: string; clientName: string; startDate: string; endDate: string };

export default function PaymentsPage() {
  const [vouchers, setVouchers] = useState<Voucher[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    date: todayInput(),
    amount: "",
    vatAmount: "",
    method: "CASH",
    payee: "",
    description: "",
    expenseAccountId: "",
    customizedPackageId: "",
  };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resV, resA, resB] = await Promise.all([
        fetch("/api/admin/accounting/payments"),
        fetch("/api/admin/accounting/accounts"),
        fetch("/api/admin/client-trips"),
      ]);
      const dataV = await resV.json();
      if (dataV.error) setError(dataV.error);
      else setVouchers(dataV);
      const dataA = await resA.json();
      if (!dataA.error && Array.isArray(dataA)) {
        setAccounts(dataA.filter((a: Account) => a.type === "EXPENSE" && a.isActive));
      }
      const dataB = await resB.json();
      if (!dataB.error && Array.isArray(dataB)) setBookings(dataB);
    } catch {
      setError("حدث خطأ أثناء تحميل السندات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounting/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          vatAmount: Number(form.vatAmount) || 0,
          customizedPackageId: form.customizedPackageId || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم تسجيل سند الصرف ${docNo("PAY", data.voucherNumber)}.`);
        setShowForm(false);
        setForm(emptyForm);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء حفظ السند.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("سيتم إلغاء السند بقيد عكسي (لن يُحذف من السجل). متابعة؟")) return;
    const res = await fetch(`/api/admin/accounting/payments?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم إلغاء السند بقيد عكسي.");
      loadData();
    }
  };

  const gross = (Number(form.amount) || 0) + (Number(form.vatAmount) || 0);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="سندات الصرف والمصروفات"
        subtitle="مصروفات عامة وتكاليف الرحلات — مع ضريبة المدخلات القابلة للخصم"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <span className="material-symbols-outlined">add_circle</span>
            سند صرف جديد
          </PrimaryBtn>
        }
      />
      <Alert error={error} message={message} />

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الرقم</th>
                <th className="py-3 px-4 font-bold">التاريخ</th>
                <th className="py-3 px-4 font-bold">المستفيد</th>
                <th className="py-3 px-4 font-bold">البيان</th>
                <th className="py-3 px-4 font-bold">التصنيف</th>
                <th className="py-3 px-4 font-bold">المبلغ</th>
                <th className="py-3 px-4 font-bold">الضريبة</th>
                <th className="py-3 px-4 font-bold">رحلة مرتبطة</th>
                <th className="py-3 px-4 font-bold">حذف</th>
              </tr>
            </thead>
            <tbody>
              {vouchers.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    لا توجد سندات صرف بعد.
                  </td>
                </tr>
              )}
              {vouchers.map((v) => (
                <tr key={v.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${v.cancelledAt ? "opacity-50" : ""}`}>
                  <td className="py-3 px-4 font-bold text-primary">
                    {docNo("PAY", v.voucherNumber)}
                    {v.cancelledAt && (
                      <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">ملغى</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{fmtDate(v.date)}</td>
                  <td className="py-3 px-4">{v.payee}</td>
                  <td className="py-3 px-4">{v.description}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {v.supplierInvoice
                      ? `سداد ${docNo("SUP", v.supplierInvoice.invoiceNumber)}`
                      : v.expenseAccount?.name || "—"}
                  </td>
                  <td className="py-3 px-4 font-bold text-red-700">{fmtMoney(v.amount)}</td>
                  <td className="py-3 px-4">{Number(v.vatAmount) > 0 ? fmtMoney(v.vatAmount) : "—"}</td>
                  <td className="py-3 px-4 text-slate-500">
                    {v.customizedPackage ? `${v.customizedPackage.clientName} (${v.customizedPackage.startDate})` : "—"}
                  </td>
                  <td className="py-3 px-4">
                    {!v.cancelledAt && (
                      <button onClick={() => remove(v.id)} className="text-red-400 hover:text-red-600" title="إلغاء بقيد عكسي">
                        <span className="material-symbols-outlined text-xl">cancel</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="سند صرف جديد" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="المستفيد *">
                <input className={inputCls} value={form.payee} onChange={(e) => setForm({ ...form, payee: e.target.value })} placeholder="مثال: شركة الطيران" />
              </Field>
              <Field label="التاريخ">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="البيان *">
              <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="مثال: تذاكر طيران لرحلة العميل فلان" />
            </Field>
            <Field label="تصنيف المصروف *">
              <select className={inputCls} value={form.expenseAccountId} onChange={(e) => setForm({ ...form, expenseAccountId: e.target.value })}>
                <option value="">— اختر التصنيف —</option>
                {accounts.map((a) => (
                  <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                ))}
              </select>
            </Field>
            <Field label="ربط برحلة/حجز (لاحتساب ربحية الرحلة)">
              <select className={inputCls} value={form.customizedPackageId} onChange={(e) => setForm({ ...form, customizedPackageId: e.target.value })}>
                <option value="">— مصروف عام (بدون ربط) —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>{b.clientName} | {b.startDate} → {b.endDate}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-3 gap-4">
              <Field label="المبلغ قبل الضريبة *">
                <input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </Field>
              <Field label="ضريبة المدخلات">
                <input type="number" className={inputCls} value={form.vatAmount} onChange={(e) => setForm({ ...form, vatAmount: e.target.value })} placeholder="0" />
              </Field>
              <Field label="طريقة الدفع">
                <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {Object.entries(METHOD_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            {gross > 0 && (
              <p className="text-sm font-bold text-slate-600 bg-slate-50 rounded-xl p-3">
                إجمالي المنصرف: {fmtMoney(gross)}
              </p>
            )}
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "تسجيل السند"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
