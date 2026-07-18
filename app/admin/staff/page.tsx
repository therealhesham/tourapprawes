"use client";

import { useState, useEffect } from "react";
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
} from "../accounting/ui";
import { useConfirm } from "@/components/ConfirmDialog";

type Staff = {
  id: string;
  username: string;
  name: string;
  createdAt: string;
  isCurrent: boolean;
};

const emptyForm = { id: "", name: "", username: "", password: "" };

export default function StaffPage() {
  const confirmDialog = useConfirm();
  const [staff, setStaff] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setStaff(data);
    } catch {
      setError("حدث خطأ أثناء تحميل الموظفين.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openNew = () => {
    setForm(emptyForm);
    setShowForm(true);
  };

  const openEdit = (s: Staff) => {
    setForm({ id: s.id, name: s.name, username: s.username, password: "" });
    setShowForm(true);
  };

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/staff", {
        method: form.id ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form.id ? form : { ...form, id: undefined }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage(form.id ? "تم تحديث بيانات الموظف." : `تم إضافة الموظف «${data.name}».`);
        setShowForm(false);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء الحفظ.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (s: Staff) => {
    if (!(await confirmDialog(`سيتم حذف حساب الموظف «${s.name}» ولن يتمكن من تسجيل الدخول. متابعة؟`))) return;
    const res = await fetch(`/api/admin/staff?id=${s.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم حذف حساب الموظف.");
      loadData();
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="الموظفون"
        subtitle="حسابات دخول لوحة التحكم — اسم الموظف يظهر تلقائياً كمسؤول متابعة في تذاكر الدعم"
        actions={
          <PrimaryBtn onClick={openNew}>
            <Icon name="add_circle" />
            موظف جديد
          </PrimaryBtn>
        }
      />
      <Alert error={error} message={message} />

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الاسم</th>
                <th className="py-3 px-4 font-bold">اسم المستخدم</th>
                <th className="py-3 px-4 font-bold">أضيف في</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {staff.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-10 text-center text-slate-500">
                    لا توجد حسابات موظفين بعد — الدخول الحالي يعمل بحساب الطوارئ المؤقت.
                    <br />
                    أنشئ الحساب الأول الآن (بنفس بيانات الدخول الحالية حتى لا تفقد الوصول).
                  </td>
                </tr>
              )}
              {staff.map((s) => (
                <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50/50">
                  <td className="py-3 px-4 font-bold text-primary">
                    {s.name}
                    {s.isCurrent && (
                      <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        أنت
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4" dir="ltr">{s.username}</td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(s.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEdit(s)} className="text-slate-400 hover:text-primary" title="تعديل / إعادة تعيين كلمة المرور">
                        <Icon name="edit" className="text-lg" />
                      </button>
                      {!s.isCurrent && (
                        <button onClick={() => remove(s)} className="text-red-300 hover:text-red-600" title="حذف">
                          <Icon name="delete" className="text-lg" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showForm && (
        <Modal title={form.id ? "تعديل بيانات الموظف" : "موظف جديد"} onClose={() => setShowForm(false)}>
          <div className="space-y-4">
            <Field label="اسم الموظف (يظهر في التذاكر) *">
              <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </Field>
            <Field label="اسم المستخدم لتسجيل الدخول *">
              <input className={inputCls} dir="ltr" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} />
            </Field>
            <Field label={form.id ? "كلمة مرور جديدة (اتركها فارغة للإبقاء على الحالية)" : "كلمة المرور *"}>
              <input type="password" className={inputCls} dir="ltr" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} />
            </Field>
            <Alert error={error} />
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100">
                إلغاء
              </button>
              <PrimaryBtn onClick={submit} disabled={saving}>
                {saving ? "جاري الحفظ..." : form.id ? "حفظ التعديلات" : "إضافة الموظف"}
              </PrimaryBtn>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
