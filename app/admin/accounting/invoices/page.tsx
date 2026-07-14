"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
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
  INVOICE_STATUS,
  docNo,
} from "../ui";
import Icon from "@/components/Icon";

type Invoice = {
  id: string;
  invoiceNumber: number;
  status: string;
  issueDate: string;
  clientName: string;
  clientPhone: string | null;
  subtotal: string;
  vatAmount: string;
  total: string;
  paidAmount: string;
  customizedPackage?: { id: string; clientName: string } | null;
};

type Booking = { id: string; clientName: string; clientPhone: string; startDate: string; endDate: string; pricing: number };

type ItemRow = { description: string; quantity: string; unitPrice: string };

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = {
    clientName: "",
    clientPhone: "",
    clientVatNumber: "",
    clientAddress: "",
    customizedPackageId: "",
    issueDate: todayInput(),
    vatRate: "15",
    notes: "",
  };
  const [form, setForm] = useState(emptyForm);
  const [items, setItems] = useState<ItemRow[]>([{ description: "", quantity: "1", unitPrice: "" }]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resInv, resBookings] = await Promise.all([
        fetch("/api/admin/accounting/invoices"),
        fetch("/api/admin/client-trips"),
      ]);
      const dataInv = await resInv.json();
      if (dataInv.error) setError(dataInv.error);
      else setInvoices(dataInv);
      const dataBookings = await resBookings.json();
      if (!dataBookings.error && Array.isArray(dataBookings)) setBookings(dataBookings);
    } catch {
      setError("حدث خطأ أثناء تحميل الفواتير.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const subtotal = items.reduce((s, it) => s + (Number(it.quantity) || 0) * (Number(it.unitPrice) || 0), 0);
  const vat = subtotal * ((Number(form.vatRate) || 0) / 100);

  const selectBooking = (id: string) => {
    const b = bookings.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      customizedPackageId: id,
      ...(b ? { clientName: b.clientName, clientPhone: b.clientPhone } : {}),
    }));
    if (b && items.length === 1 && !items[0].description) {
      setItems([
        {
          description: `باقة سياحية ${b.startDate} إلى ${b.endDate}`,
          quantity: "1",
          unitPrice: String(b.pricing),
        },
      ]);
    }
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounting/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          customizedPackageId: form.customizedPackageId || null,
          vatRate: Number(form.vatRate),
          items: items.map((it) => ({
            description: it.description,
            quantity: Number(it.quantity) || 1,
            unitPrice: Number(it.unitPrice) || 0,
          })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم إصدار الفاتورة ${docNo("INV", data.invoiceNumber)} بنجاح.`);
        setShowForm(false);
        setForm(emptyForm);
        setItems([{ description: "", quantity: "1", unitPrice: "" }]);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء حفظ الفاتورة.");
    } finally {
      setSaving(false);
    }
  };

  const cancelInvoice = async (id: string) => {
    if (!confirm("سيتم إلغاء الفاتورة وعكس قيدها المحاسبي. متابعة؟")) return;
    const res = await fetch(`/api/admin/accounting/invoices?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم إلغاء الفاتورة.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="الفواتير الضريبية"
        subtitle="إصدار ومتابعة فواتير ضريبة القيمة المضافة"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="add_circle" />
            فاتورة جديدة
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
                <th className="py-3 px-4 font-bold">العميل</th>
                <th className="py-3 px-4 font-bold">قبل الضريبة</th>
                <th className="py-3 px-4 font-bold">الضريبة</th>
                <th className="py-3 px-4 font-bold">الإجمالي</th>
                <th className="py-3 px-4 font-bold">المسدد</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {invoices.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-10 text-center text-slate-500">
                    لا توجد فواتير بعد.
                  </td>
                </tr>
              )}
              {invoices.map((inv) => {
                const st = INVOICE_STATUS[inv.status] || INVOICE_STATUS.ISSUED;
                return (
                  <tr key={inv.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                    <td className="py-3 px-4 font-bold text-primary">{docNo("INV", inv.invoiceNumber)}</td>
                    <td className="py-3 px-4">{fmtDate(inv.issueDate)}</td>
                    <td className="py-3 px-4">
                      {inv.clientName}
                      {inv.clientPhone && <span className="block text-xs text-slate-400" dir="ltr">{inv.clientPhone}</span>}
                    </td>
                    <td className="py-3 px-4">{fmtMoney(inv.subtotal)}</td>
                    <td className="py-3 px-4">{fmtMoney(inv.vatAmount)}</td>
                    <td className="py-3 px-4 font-bold">{fmtMoney(inv.total)}</td>
                    <td className="py-3 px-4">{fmtMoney(inv.paidAmount)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <Link
                          href={`/admin/accounting/invoices/${inv.id}`}
                          className="text-secondary hover:text-primary"
                          title="عرض وطباعة"
                        >
                          <Icon name="print" className="text-xl" />
                        </Link>
                        {inv.status !== "CANCELLED" && (
                          <button onClick={() => cancelInvoice(inv.id)} className="text-red-400 hover:text-red-600" title="إلغاء">
                            <Icon name="cancel" className="text-xl" />
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
        <Modal title="إصدار فاتورة ضريبية" onClose={() => setShowForm(false)} wide>
          <div className="space-y-4">
            <Field label="ربط بحجز (اختياري)">
              <select className={inputCls} value={form.customizedPackageId} onChange={(e) => selectBooking(e.target.value)}>
                <option value="">— بدون ربط —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.clientName} | {b.startDate} → {b.endDate} | {b.pricing} ر.س
                  </option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="اسم العميل *">
                <input className={inputCls} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
              </Field>
              <Field label="جوال العميل">
                <input className={inputCls} dir="ltr" value={form.clientPhone} onChange={(e) => setForm({ ...form, clientPhone: e.target.value })} />
              </Field>
              <Field label="الرقم الضريبي للعميل (للمنشآت)">
                <input className={inputCls} dir="ltr" value={form.clientVatNumber} onChange={(e) => setForm({ ...form, clientVatNumber: e.target.value })} />
              </Field>
              <Field label="عنوان العميل">
                <input className={inputCls} value={form.clientAddress} onChange={(e) => setForm({ ...form, clientAddress: e.target.value })} />
              </Field>
              <Field label="تاريخ الإصدار">
                <input type="date" className={inputCls} value={form.issueDate} onChange={(e) => setForm({ ...form, issueDate: e.target.value })} />
              </Field>
              <Field label="نسبة الضريبة %">
                <input type="number" className={inputCls} value={form.vatRate} onChange={(e) => setForm({ ...form, vatRate: e.target.value })} />
              </Field>
            </div>

            <div>
              <p className="text-sm font-bold text-slate-600 mb-2">بنود الفاتورة</p>
              <div className="space-y-2">
                {items.map((it, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <input
                      className={inputCls}
                      placeholder="الوصف"
                      value={it.description}
                      onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, description: e.target.value } : x)))}
                    />
                    <input
                      type="number"
                      className={`${inputCls} !w-24`}
                      placeholder="الكمية"
                      value={it.quantity}
                      onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, quantity: e.target.value } : x)))}
                    />
                    <input
                      type="number"
                      className={`${inputCls} !w-32`}
                      placeholder="سعر الوحدة"
                      value={it.unitPrice}
                      onChange={(e) => setItems(items.map((x, i) => (i === idx ? { ...x, unitPrice: e.target.value } : x)))}
                    />
                    <button
                      onClick={() => setItems(items.filter((_, i) => i !== idx))}
                      disabled={items.length === 1}
                      className="text-red-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setItems([...items, { description: "", quantity: "1", unitPrice: "" }])}
                className="mt-2 text-secondary font-bold text-sm flex items-center gap-1"
              >
                <Icon name="add" className="text-lg" />
                إضافة بند
              </button>
            </div>

            <Field label="ملاحظات">
              <textarea className={inputCls} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
            </Field>

            <div className="bg-slate-50 rounded-xl p-4 text-sm font-bold space-y-1">
              <div className="flex justify-between"><span>الإجمالي قبل الضريبة:</span><span>{fmtMoney(subtotal)}</span></div>
              <div className="flex justify-between"><span>ضريبة القيمة المضافة ({form.vatRate}%):</span><span>{fmtMoney(vat)}</span></div>
              <div className="flex justify-between text-primary text-base"><span>الإجمالي شامل الضريبة:</span><span>{fmtMoney(subtotal + vat)}</span></div>
            </div>

            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "إصدار الفاتورة"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
