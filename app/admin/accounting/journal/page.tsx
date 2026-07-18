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
  docNo,
} from "../ui";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type Line = {
  id: string;
  debit: string;
  credit: string;
  description: string | null;
  account: { id: string; code: string; name: string };
};

type Entry = {
  id: string;
  entryNumber: number;
  date: string;
  description: string;
  reference: string | null;
  sourceType: string;
  lines: Line[];
};

type Account = { id: string; code: string; name: string; isActive: boolean };

type FormLine = { accountId: string; debit: string; credit: string };

const SOURCE_LABELS: Record<string, string> = {
  MANUAL: "يدوي",
  INVOICE: "فاتورة",
  RECEIPT: "سند قبض",
  PAYMENT: "سند صرف",
  SUPPLIER_INVOICE: "فاتورة مورد",
  REVERSAL: "قيد عكسي",
};

export default function JournalPage() {
  const confirmDialog = useConfirm();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const [form, setForm] = useState({ date: todayInput(), description: "", reference: "" });
  const [lines, setLines] = useState<FormLine[]>([
    { accountId: "", debit: "", credit: "" },
    { accountId: "", debit: "", credit: "" },
  ]);

  const loadData = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (from) qs.set("from", from);
      if (to) qs.set("to", to);
      const [resE, resA] = await Promise.all([
        fetch(`/api/admin/accounting/journal?${qs}`),
        fetch("/api/admin/accounting/accounts"),
      ]);
      const dataE = await resE.json();
      if (dataE.error) setError(dataE.error);
      else setEntries(dataE);
      const dataA = await resA.json();
      if (!dataA.error && Array.isArray(dataA)) setAccounts(dataA.filter((a: Account) => a.isActive));
    } catch {
      setError("حدث خطأ أثناء تحميل القيود.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalDebit = lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = totalDebit === totalCredit && totalDebit > 0;

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/accounting/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          lines: lines
            .filter((l) => l.accountId)
            .map((l) => ({ accountId: l.accountId, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
        }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم تسجيل القيد ${docNo("JV", data.entryNumber)}.`);
        setShowForm(false);
        setForm({ date: todayInput(), description: "", reference: "" });
        setLines([
          { accountId: "", debit: "", credit: "" },
          { accountId: "", debit: "", credit: "" },
        ]);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء حفظ القيد.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!(await confirmDialog("سيتم تسجيل قيد عكسي لهذا القيد اليدوي (لن يُحذف من السجل). متابعة؟"))) return;
    const res = await fetch(`/api/admin/accounting/journal?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم عكس القيد.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="القيود اليومية"
        subtitle="جميع الحركات المحاسبية — آلية ويدوية"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="edit_note" />
            قيد يدوي جديد
          </PrimaryBtn>
        }
      />
      <Alert error={error} message={message} />

      <div className="glass-panel rounded-2xl border border-white/60 shadow-md p-4 flex flex-wrap items-end gap-4">
        <Field label="من تاريخ">
          <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
        </Field>
        <Field label="إلى تاريخ">
          <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
        </Field>
        <PrimaryBtn onClick={loadData}>تصفية</PrimaryBtn>
      </div>

      <div className="space-y-3">
        {entries.length === 0 && (
          <p className="text-center text-slate-500 py-10">لا توجد قيود في هذه الفترة.</p>
        )}
        {entries.map((e) => {
          const total = e.lines.reduce((s, l) => s + Number(l.debit), 0);
          const open = expanded === e.id;
          return (
            <div key={e.id} className="glass-panel rounded-2xl border border-white/60 shadow-md overflow-hidden">
              <button
                onClick={() => setExpanded(open ? null : e.id)}
                className="w-full flex flex-wrap items-center justify-between gap-3 p-4 text-right hover:bg-slate-50/50"
              >
                <div className="flex items-center gap-4">
                  <span className="font-black text-primary">{docNo("JV", e.entryNumber)}</span>
                  <span className="text-sm text-slate-500">{fmtDate(e.date)}</span>
                  <span className="text-sm font-bold">{e.description}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-600">
                    {SOURCE_LABELS[e.sourceType] || e.sourceType}
                  </span>
                  <span className="font-bold text-primary">{fmtMoney(total)}</span>
                  <Icon name="expand_more" className={`text-slate-400 transition-transform ${open ? "rotate-180" : ""}`} />
                </div>
              </button>
              {open && (
                <div className="border-t border-slate-100 p-4">
                  <table className="w-full text-sm text-right">
                    <thead>
                      <tr className="text-slate-400 border-b border-slate-100">
                        <th className="py-2 px-3 font-bold">الحساب</th>
                        <th className="py-2 px-3 font-bold w-32">مدين</th>
                        <th className="py-2 px-3 font-bold w-32">دائن</th>
                      </tr>
                    </thead>
                    <tbody>
                      {e.lines.map((l) => (
                        <tr key={l.id} className="border-b border-slate-50">
                          <td className="py-2 px-3">{l.account.code} — {l.account.name}</td>
                          <td className="py-2 px-3 font-bold">{Number(l.debit) > 0 ? fmtMoney(l.debit) : ""}</td>
                          <td className="py-2 px-3 font-bold">{Number(l.credit) > 0 ? fmtMoney(l.credit) : ""}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {e.sourceType === "MANUAL" && (
                    <div className="flex justify-end mt-3">
                      <button onClick={() => remove(e.id)} className="text-red-500 font-bold text-sm flex items-center gap-1 hover:text-red-700">
                        <Icon name="history" className="text-lg" />
                        عكس القيد
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {showForm && (
        <Modal title="قيد يومية يدوي" onClose={() => setShowForm(false)} wide>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <Field label="التاريخ *">
                <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </Field>
              <Field label="البيان *" className="sm:col-span-2">
                <input className={inputCls} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </Field>
            </div>
            <Field label="المرجع (اختياري)">
              <input className={inputCls} value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} />
            </Field>

            <div>
              <p className="text-sm font-bold text-slate-600 mb-2">سطور القيد</p>
              <div className="space-y-2">
                {lines.map((l, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select
                      className={inputCls}
                      value={l.accountId}
                      onChange={(e) => setLines(lines.map((x, i) => (i === idx ? { ...x, accountId: e.target.value } : x)))}
                    >
                      <option value="">— اختر الحساب —</option>
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
                      ))}
                    </select>
                    <input
                      type="number"
                      className={`${inputCls} !w-32`}
                      placeholder="مدين"
                      value={l.debit}
                      onChange={(e) => setLines(lines.map((x, i) => (i === idx ? { ...x, debit: e.target.value, credit: "" } : x)))}
                    />
                    <input
                      type="number"
                      className={`${inputCls} !w-32`}
                      placeholder="دائن"
                      value={l.credit}
                      onChange={(e) => setLines(lines.map((x, i) => (i === idx ? { ...x, credit: e.target.value, debit: "" } : x)))}
                    />
                    <button
                      onClick={() => setLines(lines.filter((_, i) => i !== idx))}
                      disabled={lines.length <= 2}
                      className="text-red-400 hover:text-red-600 disabled:opacity-30"
                    >
                      <Icon name="delete" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={() => setLines([...lines, { accountId: "", debit: "", credit: "" }])}
                className="mt-2 text-secondary font-bold text-sm flex items-center gap-1"
              >
                <Icon name="add" className="text-lg" />
                إضافة سطر
              </button>
            </div>

            <div className={`rounded-xl p-4 text-sm font-bold flex justify-between ${balanced ? "bg-green-50 text-green-700" : "bg-amber-50 text-amber-700"}`}>
              <span>إجمالي المدين: {fmtMoney(totalDebit)}</span>
              <span>إجمالي الدائن: {fmtMoney(totalCredit)}</span>
              <span>{balanced ? "القيد متوازن ✓" : "القيد غير متوازن"}</span>
            </div>

            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving || !balanced}>
                {saving ? "جاري الحفظ..." : "تسجيل القيد"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
