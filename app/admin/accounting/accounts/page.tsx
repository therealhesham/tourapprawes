"use client";

import { useState, useEffect } from "react";
import {
  fmtMoney,
  PageHeader,
  Spinner,
  Alert,
  Modal,
  Field,
  inputCls,
  PrimaryBtn,
  ACCOUNT_TYPE_LABELS,
} from "../ui";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type Account = {
  id: string;
  code: string;
  name: string;
  type: string;
  isSystem: boolean;
  isActive: boolean;
  balance: number;
};

const TYPE_ORDER = ["ASSET", "LIABILITY", "EQUITY", "REVENUE", "EXPENSE"];

export default function AccountsPage() {
  const confirmDialog = useConfirm();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "EXPENSE" });

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/accounting/accounts");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setAccounts(data);
    } catch {
      setError("حدث خطأ أثناء تحميل الحسابات.");
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
      const res = await fetch("/api/admin/accounting/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(`تم إنشاء الحساب ${data.code} — ${data.name}.`);
        setShowForm(false);
        setForm({ code: "", name: "", type: "EXPENSE" });
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء إنشاء الحساب.");
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (a: Account) => {
    const res = await fetch("/api/admin/accounting/accounts", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: a.id, isActive: !a.isActive }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else loadData();
  };

  const remove = async (id: string) => {
    if (!(await confirmDialog("هل أنت متأكد من حذف هذا الحساب؟"))) return;
    const res = await fetch(`/api/admin/accounting/accounts?id=${id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم حذف الحساب.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="شجرة الحسابات"
        subtitle="الحسابات المحاسبية وأرصدتها الحالية"
        actions={
          <PrimaryBtn onClick={() => setShowForm(true)}>
            <Icon name="add_circle" />
            حساب جديد
          </PrimaryBtn>
        }
      />
      <Alert error={error} message={message} />

      {TYPE_ORDER.map((type) => {
        const group = accounts.filter((a) => a.type === type);
        if (group.length === 0) return null;
        return (
          <div key={type} className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
            <h3 className="text-lg font-black text-primary p-4 border-b border-slate-100 bg-slate-50/50">
              {ACCOUNT_TYPE_LABELS[type]}
            </h3>
            <table className="w-full text-sm text-right">
              <tbody>
                {group.map((a) => (
                  <tr key={a.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${!a.isActive ? "opacity-40" : ""}`}>
                    <td className="py-3 px-4 font-bold text-slate-500 w-24">{a.code}</td>
                    <td className="py-3 px-4 font-bold">
                      {a.name}
                      {a.isSystem && (
                        <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">نظامي</span>
                      )}
                      {!a.isActive && (
                        <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-500">معطل</span>
                      )}
                    </td>
                    <td className={`py-3 px-4 font-bold w-44 ${a.balance < 0 ? "text-red-600" : "text-primary"}`}>
                      {fmtMoney(a.balance)}
                    </td>
                    <td className="py-3 px-4 w-28">
                      <div className="flex gap-2 justify-end">
                        {!a.isSystem && (
                          <>
                            <button onClick={() => toggleActive(a)} className="text-slate-400 hover:text-primary" title={a.isActive ? "تعطيل" : "تفعيل"}>
                              <Icon name={a.isActive ? "toggle_on" : "toggle_off"} className="text-xl" />
                            </button>
                            <button onClick={() => remove(a.id)} className="text-red-400 hover:text-red-600" title="حذف">
                              <Icon name="delete" className="text-xl" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      })}

      {showForm && (
        <Modal title="حساب جديد" onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Field label="رمز الحساب *">
                <input className={inputCls} dir="ltr" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="مثال: 5206" />
              </Field>
              <Field label="النوع *">
                <select className={inputCls} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                  {TYPE_ORDER.map((t) => (
                    <option key={t} value={t}>{ACCOUNT_TYPE_LABELS[t]}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="اسم الحساب *">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : "إنشاء الحساب"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
