"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

type Message = {
  id: string;
  body: string;
  authorName: string;
  fromCustomer: boolean;
  createdAt: string;
};

type Ticket = {
  id: string;
  ticketNumber: number;
  subject: string;
  description: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  messages: Message[];
};

const STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "قيد المراجعة", cls: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "قيد المعالجة", cls: "bg-blue-100 text-blue-800" },
  WAITING_CUSTOMER: { label: "بانتظار ردك", cls: "bg-purple-100 text-purple-800" },
  RESOLVED: { label: "تم الحل", cls: "bg-green-100 text-green-800" },
  CLOSED: { label: "مغلقة", cls: "bg-slate-200 text-slate-600" },
};

const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-GB");
const ticketNo = (n: number) => `TKT-${String(n).padStart(5, "0")}`;

const inputCls =
  "w-full rounded-xl border-slate-200 bg-white focus:border-secondary focus:ring-secondary text-sm";

export default function SupportPage() {
  const { data: session, status: sessionStatus } = useSession();
  // Only phone-verified client sessions can use support (admin sessions have no phone)
  const authStatus =
    sessionStatus === "authenticated" && !(session?.user as any)?.phone
      ? "unauthenticated"
      : sessionStatus;
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [customerName, setCustomerName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: "", subject: "", description: "" });
  const [openTicket, setOpenTicket] = useState<string | null>(null);
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch("/api/support");
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setTickets(data.tickets);
        if (data.customer?.name) {
          setCustomerName(data.customer.name);
          setForm((f) => ({ ...f, name: f.name || data.customer.name }));
        }
      }
    } catch {
      setError("حدث خطأ أثناء تحميل الشكاوى.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated") loadData();
    if (authStatus === "unauthenticated") setLoading(false);
  }, [authStatus, loadData]);

  const submit = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setMessage(`تم استلام شكواك برقم ${ticketNo(data.ticketNumber)} وسيتواصل معك فريقنا قريباً.`);
        setShowForm(false);
        setForm((f) => ({ ...f, subject: "", description: "" }));
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء إرسال الشكوى.");
    } finally {
      setSaving(false);
    }
  };

  const sendReply = async (ticketId: string) => {
    if (!reply.trim()) return;
    setSendingReply(true);
    setError("");
    try {
      const res = await fetch(`/api/support/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setReply("");
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء إرسال الرد.");
    } finally {
      setSendingReply(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col" dir="rtl">
      <Navbar theme="light" />

      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-primary mb-3">الدعم والشكاوى</h1>
          <p className="text-slate-600">
            نسعد بخدمتك — قدّم شكوى أو استفساراً وتابع حالته حتى الحل.
          </p>
        </div>

        {authStatus === "loading" || loading ? (
          <div className="flex justify-center items-center h-40">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : authStatus === "unauthenticated" ? (
          <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center space-y-4">
            <Icon name="contact_phone" className="text-5xl text-secondary" />
            <p className="text-slate-700 font-bold text-lg">سجّل دخولك برقم جوالك لتقديم شكوى أو متابعة شكاواك السابقة</p>
            <a
              href="/login?callbackUrl=/support"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
            >
              <Icon name="login" />
              تسجيل الدخول
            </a>
          </div>
        ) : (
          <div className="space-y-6">
            {message && (
              <div className="p-4 rounded-xl font-bold text-sm bg-green-50 text-green-700 border border-green-200">
                {message}
              </div>
            )}
            {error && (
              <div className="p-4 rounded-xl font-bold text-sm bg-red-50 text-red-700 border border-red-200">
                {error}
              </div>
            )}

            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-primary">
                شكاواي {customerName && <span className="text-slate-400 font-bold text-base">— {customerName}</span>}
              </h2>
              <button
                onClick={() => setShowForm(!showForm)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all"
              >
                <Icon name={showForm ? "close" : "add_circle"} />
                {showForm ? "إلغاء" : "شكوى جديدة"}
              </button>
            </div>

            {showForm && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-6 space-y-4">
                <label className="block">
                  <span className="block text-sm font-bold text-slate-600 mb-1">الاسم *</span>
                  <input className={inputCls} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-slate-600 mb-1">موضوع الشكوى *</span>
                  <input className={inputCls} value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} />
                </label>
                <label className="block">
                  <span className="block text-sm font-bold text-slate-600 mb-1">التفاصيل</span>
                  <textarea className={inputCls} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
                </label>
                <div className="flex justify-end">
                  <button
                    onClick={submit}
                    disabled={saving}
                    className="flex items-center gap-2 px-6 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                  >
                    {saving ? "جاري الإرسال..." : "إرسال الشكوى"}
                  </button>
                </div>
              </div>
            )}

            {tickets.length === 0 && !showForm && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-xl p-10 text-center text-slate-500">
                لا توجد شكاوى سابقة. إذا واجهت أي مشكلة في رحلتك فنحن هنا للمساعدة.
              </div>
            )}

            {tickets.map((t) => {
              const s = STATUS[t.status] || { label: t.status, cls: "bg-slate-100 text-slate-600" };
              const expanded = openTicket === t.id;
              return (
                <div key={t.id} className="bg-white rounded-3xl border border-slate-100 shadow-xl overflow-hidden">
                  <button
                    onClick={() => setOpenTicket(expanded ? null : t.id)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-right hover:bg-slate-50/50 transition-colors"
                  >
                    <div>
                      <p className="font-extrabold text-primary">
                        {ticketNo(t.ticketNumber)} — {t.subject}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">آخر تحديث {fmtDate(t.updatedAt)}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${s.cls}`}>{s.label}</span>
                      <Icon name="expand_more" className={`text-slate-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
                    </div>
                  </button>

                  {expanded && (
                    <div className="border-t border-slate-100 p-5 space-y-4">
                      {t.description && (
                        <p className="text-slate-700 text-sm whitespace-pre-wrap bg-slate-50 rounded-2xl p-4">{t.description}</p>
                      )}
                      {t.messages.map((m) => (
                        <div
                          key={m.id}
                          className={`rounded-2xl p-4 text-sm max-w-[85%] ${
                            m.fromCustomer
                              ? "bg-primary/5 border border-primary/10 mr-auto"
                              : "bg-secondary/10 border border-secondary/20 ml-auto"
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1 gap-6">
                            <span className="font-bold text-primary text-xs">
                              {m.fromCustomer ? "أنت" : "فريق روائس"}
                            </span>
                            <span className="text-[11px] text-slate-400">{fmtDate(m.createdAt)}</span>
                          </div>
                          <p className="text-slate-700 whitespace-pre-wrap">{m.body}</p>
                        </div>
                      ))}

                      {t.status !== "CLOSED" ? (
                        <div className="flex gap-2 pt-2">
                          <input
                            className={inputCls}
                            placeholder="اكتب رداً..."
                            value={expanded ? reply : ""}
                            onChange={(e) => setReply(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && sendReply(t.id)}
                          />
                          <button
                            onClick={() => sendReply(t.id)}
                            disabled={sendingReply || !reply.trim()}
                            className="px-5 py-2 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50 shrink-0"
                          >
                            إرسال
                          </button>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-400">هذه التذكرة مغلقة — افتح شكوى جديدة إذا احتجت للمساعدة.</p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
