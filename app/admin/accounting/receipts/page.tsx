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
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type Receipt = {
  id: string;
  receiptNumber: number;
  date: string;
  amount: string;
  method: string;
  clientName: string;
  notes: string | null;
  cancelledAt: string | null;
  invoice?: { id: string; invoiceNumber: number; total: string } | null;
  customizedPackage?: { id: string; clientName: string } | null;
};

type InvoiceOpt = {
  id: string;
  invoiceNumber: number;
  clientName: string;
  clientPhone: string | null;
  total: string;
  paidAmount: string;
  status: string;
  customizedPackageId?: string | null;
};

export default function ReceiptsPage() {
  const confirmDialog = useConfirm();
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [invoices, setInvoices] = useState<InvoiceOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const emptyForm = { date: todayInput(), amount: "", method: "CASH", clientName: "", invoiceId: "", notes: "" };
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRec, resInv] = await Promise.all([
        fetch("/api/admin/accounting/receipts"),
        fetch("/api/admin/accounting/invoices"),
      ]);
      const dataRec = await resRec.json();
      if (dataRec.error) setError(dataRec.error);
      else setReceipts(dataRec);
      const dataInv = await resInv.json();
      if (!dataInv.error && Array.isArray(dataInv)) {
        setInvoices(dataInv.filter((i: InvoiceOpt) => i.status === "ISSUED" || i.status === "PARTIALLY_PAID"));
      }
    } catch {
      setError("حدث خطأ أثناء تحميل السندات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const selectInvoice = (id: string) => {
    const inv = invoices.find((x) => x.id === id);
    setForm((f) => ({
      ...f,
      invoiceId: id,
      ...(inv
        ? {
            clientName: inv.clientName,
            amount: String(Number(inv.total) - Number(inv.paidAmount)),
          }
        : {}),
    }));
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const inv = invoices.find((x) => x.id === form.invoiceId);
      const res = await fetch("/api/admin/accounting/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          invoiceId: form.invoiceId || null,
          customizedPackageId: inv?.customizedPackageId || null,
          amount: Number(form.amount),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم تسجيل سند القبض ${docNo("REC", data.receiptNumber)}.`);
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
    if (!(await confirmDialog("سيتم إلغاء السند بقيد عكسي (لن يُحذف من السجل). متابعة؟"))) return;
    const res = await fetch(`/api/admin/accounting/receipts?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم إلغاء السند بقيد عكسي.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="سندات القبض"
        subtitle="تحصيل دفعات العملاء نقداً أو بنكياً"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="add_circle" />
            سند قبض جديد
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
                <th className="py-3 px-4 font-bold">المبلغ</th>
                <th className="py-3 px-4 font-bold">الطريقة</th>
                <th className="py-3 px-4 font-bold">الفاتورة</th>
                <th className="py-3 px-4 font-bold">ملاحظات</th>
                <th className="py-3 px-4 font-bold">حذف</th>
              </tr>
            </thead>
            <tbody>
              {receipts.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-10 text-center text-slate-500">
                    لا توجد سندات قبض بعد.
                  </td>
                </tr>
              )}
              {receipts.map((r) => (
                <tr key={r.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${r.cancelledAt ? "opacity-50" : ""}`}>
                  <td className="py-3 px-4 font-bold text-primary">
                    {docNo("REC", r.receiptNumber)}
                    {r.cancelledAt && (
                      <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-600">ملغى</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{fmtDate(r.date)}</td>
                  <td className="py-3 px-4">{r.clientName}</td>
                  <td className="py-3 px-4 font-bold text-green-700">{fmtMoney(r.amount)}</td>
                  <td className="py-3 px-4">{METHOD_LABELS[r.method] || r.method}</td>
                  <td className="py-3 px-4">{r.invoice ? docNo("INV", r.invoice.invoiceNumber) : "—"}</td>
                  <td className="py-3 px-4 text-slate-500">{r.notes || "—"}</td>
                  <td className="py-3 px-4">
                    {!r.cancelledAt && (
                      <button onClick={() => remove(r.id)} className="text-red-400 hover:text-red-600" title="إلغاء بقيد عكسي">
                        <Icon name="cancel" className="text-xl" />
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
        <Modal title="سند قبض جديد" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <Field label="ربط بفاتورة (اختياري)">
              <select className={inputCls} value={form.invoiceId} onChange={(e) => selectInvoice(e.target.value)}>
                <option value="">— بدون ربط —</option>
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {docNo("INV", inv.invoiceNumber)} | {inv.clientName} | متبقي {fmtMoney(Number(inv.total) - Number(inv.paidAmount))}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="اسم العميل *">
              <input className={inputCls} value={form.clientName} onChange={(e) => setForm({ ...form, clientName: e.target.value })} />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="المبلغ *">
                <input type="number" className={inputCls} value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </Field>
              <Field label="طريقة الدفع">
                <select className={inputCls} value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}>
                  {Object.entries(METHOD_LABELS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="التاريخ">
              <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
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
                {saving ? "جاري الحفظ..." : "تسجيل السند"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
