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

type SupplierInvoice = {
  id: string;
  invoiceNumber: number;
  supplierName: string;
  description: string;
  date: string;
  dueDate: string | null;
  amount: string;
  vatAmount: string;
  total: string;
  paidAmount: string;
  status: string;
  expenseAccount: { id: string; code: string; name: string };
  customizedPackage?: { id: string; clientName: string; startDate: string } | null;
};

type Account = { id: string; code: string; name: string; type: string; isActive: boolean };
type Booking = { id: string; clientName: string; startDate: string; endDate: string };

const STATUS: Record<string, { label: string; cls: string }> = {
  UNPAID: { label: "غير مسددة", cls: "bg-amber-100 text-amber-800" },
  PARTIALLY_PAID: { label: "مسددة جزئياً", cls: "bg-blue-100 text-blue-800" },
  PAID: { label: "مسددة", cls: "bg-green-100 text-green-800" },
  CANCELLED: { label: "ملغاة", cls: "bg-slate-200 text-slate-600" },
};

export default function PurchasesPage() {
  const [invoices, setInvoices] = useState<SupplierInvoice[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [payInvoice, setPayInvoice] = useState<SupplierInvoice | null>(null);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    supplierName: "",
    description: "",
    date: todayInput(),
    dueDate: "",
    amount: "",
    vatAmount: "",
    expenseAccountId: "",
    customizedPackageId: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [payForm, setPayForm] = useState({ amount: "", method: "BANK_TRANSFER", date: todayInput() });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resI, resA, resB] = await Promise.all([
        fetch("/api/admin/accounting/supplier-invoices"),
        fetch("/api/admin/accounting/accounts"),
        fetch("/api/admin/client-trips"),
      ]);
      const dataI = await resI.json();
      if (dataI.error) setError(dataI.error);
      else setInvoices(dataI);
      const dataA = await resA.json();
      if (!dataA.error && Array.isArray(dataA)) {
        setAccounts(dataA.filter((a: Account) => a.type === "EXPENSE" && a.isActive));
      }
      const dataB = await resB.json();
      if (!dataB.error && Array.isArray(dataB)) setBookings(dataB);
    } catch {
      setError("حدث خطأ أثناء تحميل فواتير الموردين.");
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
      const res = await fetch("/api/admin/accounting/supplier-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          amount: Number(form.amount),
          vatAmount: Number(form.vatAmount) || 0,
          dueDate: form.dueDate || null,
          customizedPackageId: form.customizedPackageId || null,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم تسجيل فاتورة المورد ${docNo("SUP", data.invoiceNumber)}.`);
        setShowForm(false);
        setForm(emptyForm);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الفاتورة.");
    } finally {
      setSaving(false);
    }
  };

  const submitPayment = async () => {
    if (!payInvoice) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounting/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payee: payInvoice.supplierName,
          description: `سداد فاتورة مورد ${docNo("SUP", payInvoice.invoiceNumber)}`,
          amount: Number(payForm.amount),
          vatAmount: 0,
          method: payForm.method,
          date: payForm.date,
          supplierInvoiceId: payInvoice.id,
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم السداد بسند صرف ${docNo("PAY", data.voucherNumber)}.`);
        setPayInvoice(null);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء السداد.");
    } finally {
      setSaving(false);
    }
  };

  const cancel = async (id: string) => {
    if (!confirm("سيتم إلغاء الفاتورة بقيد عكسي (لن تُحذف من السجل). متابعة؟")) return;
    const res = await fetch(`/api/admin/accounting/supplier-invoices?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم إلغاء الفاتورة بقيد عكسي.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  const totalPayables = invoices
    .filter((i) => i.status === "UNPAID" || i.status === "PARTIALLY_PAID")
    .reduce((s, i) => s + Number(i.total) - Number(i.paidAmount), 0);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="فواتير الموردين (المشتريات)"
        subtitle={`مشتريات آجلة وسدادها — إجمالي المستحق للموردين: ${fmtMoney(totalPayables)}`}
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <span className="material-symbols-outlined">add_circle</span>
            فاتورة مورد جديدة
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
                <th className="py-3 px-4 font-bold">المورد</th>
                <th className="py-3 px-4 font-bold">البيان</th>
                <th className="py-3 px-4 font-bold">الإجمالي</th>
                <th className="py-3 px-4 font-bold">المسدد</th>
                <th className="py-3 px-4 font-bold">الاستحقاق</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    لا توجد فواتير موردين بعد.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => {
                const st = STATUS[inv.status] || STATUS.UNPAID;
                const open = inv.status === "UNPAID" || inv.status === "PARTIALLY_PAID";
                return (
                  <tr key={inv.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${inv.status === "CANCELLED" ? "opacity-50" : ""}`}>
                    <td className="py-3 px-4 font-bold text-primary">{docNo("SUP", inv.invoiceNumber)}</td>
                    <td className="py-3 px-4">{fmtDate(inv.date)}</td>
                    <td className="py-3 px-4 font-bold">{inv.supplierName}</td>
                    <td className="py-3 px-4">
                      {inv.description}
                      <span className="block text-xs text-slate-400">{inv.expenseAccount.name}</span>
                    </td>
                    <td className="py-3 px-4 font-bold">{fmtMoney(inv.total)}</td>
                    <td className="py-3 px-4">{fmtMoney(inv.paidAmount)}</td>
                    <td className="py-3 px-4">{fmtDate(inv.dueDate)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        {open && (
                          <button
                            onClick={() => {
                              setPayInvoice(inv);
                              setPayForm({
                                amount: String(Number(inv.total) - Number(inv.paidAmount)),
                                method: "BANK_TRANSFER",
                                date: todayInput(),
                              });
                            }}
                            className="text-green-600 hover:text-green-800"
                            title="سداد"
                          >
                            <span className="material-symbols-outlined text-xl">payments</span>
                          </button>
                        )}
                        {inv.status !== "CANCELLED" && (
                          <button onClick={() => cancel(inv.id)} className="text-red-400 hover:text-red-600" title="إلغاء">
                            <span className="material-symbols-outlined text-xl">cancel</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title="فاتورة مورد جديدة (مشتريات آجلة)" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="اسم المورد *">
                <input className={inputCls} value={form.supplierName} onChange={(e) => setForm({ ...form, supplierName: e.target.value })} placeholder="مثال: شركة الطيران" />
              </Field>
              <Field label="تاريخ الفاتورة">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
            </div>
            <Field label="البيان *">
              <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="مثال: تذاكر طيران — رحلة العميل فلان" />
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
                <option value="">— بدون ربط —</option>
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
              <Field label="تاريخ الاستحقاق">
                <input type="date" className={inputCls} value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
              </Field>
            </div>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "تسجيل الفاتورة"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}

      {payInvoice && (
        <Modal title={`سداد ${docNo("SUP", payInvoice.invoiceNumber)} — ${payInvoice.supplierName}`} onClose={() => setPayInvoice(null)}>
          <div className="space-y-4">
            <p className="text-sm font-bold text-slate-600 bg-slate-50 rounded-xl p-3">
              المتبقي على الفاتورة: {fmtMoney(Number(payInvoice.total) - Number(payInvoice.paidAmount))}
            </p>
            <div className="grid grid-cols-3 gap-4">
              <Field label="المبلغ *">
                <input type="number" className={inputCls} value={payForm.amount} onChange={(e) => setPayForm({ ...payForm, amount: e.target.value })} />
              </Field>
              <Field label="طريقة الدفع">
                <select className={inputCls} value={payForm.method} onChange={(e) => setPayForm({ ...payForm, method: e.target.value })}>
                  {Object.entries(METHOD_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
              <Field label="التاريخ">
                <input type="date" className={inputCls} value={payForm.date} onChange={(e) => setPayForm({ ...payForm, date: e.target.value })} />
              </Field>
            </div>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setPayInvoice(null)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submitPayment} disabled={saving}>
                {saving ? "جاري السداد..." : "تسجيل السداد"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
