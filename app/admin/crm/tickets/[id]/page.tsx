"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";
import {
  fmtDate,
  Spinner,
  Alert,
  Field,
  inputCls,
  PrimaryBtn,
  docNo,
  TICKET_STATUS,
  TICKET_PRIORITY,
  TICKET_CHANNEL,
  StatusBadge,
} from "../../ui";

type Message = {
  id: string;
  body: string;
  authorName: string;
  isInternal: boolean;
  createdAt: string;
};

type TicketDetail = {
  id: string;
  ticketNumber: number;
  subject: string;
  description: string | null;
  status: string;
  priority: string;
  channel: string;
  assignee: string | null;
  resolvedAt: string | null;
  closedAt: string | null;
  createdAt: string;
  customer: { id: string; name: string; phone: string; email: string | null; city: string | null; notes: string | null };
  customizedPackage: { id: string; clientName: string; startDate: string; endDate: string } | null;
  messages: Message[];
};

type BookingOpt = { id: string; clientName: string; startDate: string; endDate: string };

export default function TicketDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [ticket, setTicket] = useState<TicketDetail | null>(null);
  const [bookings, setBookings] = useState<BookingOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/crm/tickets/${id}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setTicket(data.ticket);
        setBookings(data.bookings || []);
      }
    } catch {
      setError("حدث خطأ أثناء تحميل التذكرة.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const update = async (patch: Record<string, string | null>) => {
    setError("");
    const res = await fetch(`/api/admin/crm/tickets/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم تحديث التذكرة.");
      loadData();
    }
  };

  const sendReply = async () => {
    if (!reply.trim()) return;
    setSending(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/crm/tickets/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: reply, isInternal }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else {
        setReply("");
        setIsInternal(false);
        loadData();
      }
    } catch {
      setError("حدث خطأ أثناء إرسال الرد.");
    } finally {
      setSending(false);
    }
  };

  if (loading) return <Spinner />;
  if (!ticket) return <Alert error={error || "التذكرة غير موجودة"} />;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/crm/tickets" className="text-sm font-bold text-secondary hover:underline flex items-center gap-1 mb-2">
            <Icon name="arrow_forward" />
            كل التذاكر
          </Link>
          <h2 className="text-3xl font-extrabold text-primary mb-1">
            {docNo("TKT", ticket.ticketNumber)} — {ticket.subject}
          </h2>
          <p className="text-slate-600">
            فُتحت في {fmtDate(ticket.createdAt)} عبر {TICKET_CHANNEL[ticket.channel] || ticket.channel}
          </p>
        </div>
        <div className="flex gap-2">
          <StatusBadge value={ticket.status} map={TICKET_STATUS} />
          <StatusBadge value={ticket.priority} map={TICKET_PRIORITY} />
        </div>
      </div>
      <Alert error={error} message={message} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Conversation timeline */}
        <div className="lg:col-span-2 space-y-4">
          {ticket.description && (
            <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-5">
              <p className="text-xs font-bold text-slate-400 mb-2">وصف المشكلة</p>
              <p className="text-slate-700 whitespace-pre-wrap">{ticket.description}</p>
            </div>
          )}

          <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-extrabold text-primary">سجل المتابعة ({ticket.messages.length})</h3>
            {ticket.messages.length === 0 && (
              <p className="text-slate-500 text-sm">لا توجد ردود بعد.</p>
            )}
            {ticket.messages.map((m) => (
              <div
                key={m.id}
                className={`rounded-2xl p-4 border ${
                  m.isInternal ? "bg-amber-50/70 border-amber-200" : "bg-slate-50/70 border-slate-100"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-sm text-primary">
                    {m.authorName}
                    {m.isInternal && (
                      <span className="mr-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-200 text-amber-900">
                        ملاحظة داخلية
                      </span>
                    )}
                  </span>
                  <span className="text-xs text-slate-400">{fmtDate(m.createdAt)}</span>
                </div>
                <p className="text-slate-700 text-sm whitespace-pre-wrap">{m.body}</p>
              </div>
            ))}

            <div className="border-t border-slate-100 pt-4 space-y-3">
              <textarea
                className={inputCls}
                rows={3}
                placeholder="اكتب رداً أو ملاحظة متابعة..."
                value={reply}
                onChange={(e) => setReply(e.target.value)}
              />
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm font-bold text-slate-600 cursor-pointer">
                  <input
                    type="checkbox"
                    className="rounded border-slate-300 text-secondary focus:ring-secondary"
                    checked={isInternal}
                    onChange={(e) => setIsInternal(e.target.checked)}
                  />
                  ملاحظة داخلية (لا تُعرض للعميل)
                </label>
                <PrimaryBtn onClick={sendReply} disabled={sending || !reply.trim()}>
                  {sending ? "جاري الإرسال..." : "إضافة"}
                </PrimaryBtn>
              </div>
            </div>
          </div>
        </div>

        {/* Side panel: controls + customer info */}
        <div className="space-y-4">
          <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-5 space-y-4">
            <h3 className="text-lg font-extrabold text-primary">إدارة التذكرة</h3>
            <Field label="الحالة">
              <select className={inputCls} value={ticket.status} onChange={(e) => update({ status: e.target.value })}>
                {Object.entries(TICKET_STATUS).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
            <Field label="الأولوية">
              <select className={inputCls} value={ticket.priority} onChange={(e) => update({ priority: e.target.value })}>
                {Object.entries(TICKET_PRIORITY).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
            </Field>
            <div>
              <span className="block text-sm font-bold text-slate-600 mb-1">المسؤول عن المتابعة</span>
              <p className="flex items-center gap-2 text-sm font-bold text-primary bg-slate-50 rounded-xl px-4 py-2.5">
                <Icon name="person" className="text-slate-400" />
                {ticket.assignee || "تُعيَّن تلقائياً عند أول إجراء"}
              </p>
            </div>
            <Field label="ربط برحلة">
              <select
                className={inputCls}
                value={ticket.customizedPackage?.id || ""}
                onChange={(e) => update({ customizedPackageId: e.target.value || null })}
              >
                <option value="">— بدون ربط —</option>
                {bookings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.clientName} | {b.startDate} → {b.endDate}
                  </option>
                ))}
              </select>
            </Field>
            {ticket.resolvedAt && (
              <p className="text-xs text-green-700 font-bold">تم الحل في {fmtDate(ticket.resolvedAt)}</p>
            )}
            {ticket.closedAt && (
              <p className="text-xs text-slate-500 font-bold">أُغلقت في {fmtDate(ticket.closedAt)}</p>
            )}
          </div>

          <div className="glass-panel rounded-3xl border border-white/60 shadow-xl p-5 space-y-2">
            <h3 className="text-lg font-extrabold text-primary mb-3">بيانات العميل</h3>
            <p className="flex items-center gap-2 text-sm">
              <Icon name="person" className="text-slate-400" />
              <span className="font-bold">{ticket.customer.name}</span>
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Icon name="phone" className="text-slate-400" />
              <span dir="ltr">{ticket.customer.phone}</span>
            </p>
            {ticket.customer.email && (
              <p className="flex items-center gap-2 text-sm">
                <Icon name="sms" className="text-slate-400" />
                <span dir="ltr">{ticket.customer.email}</span>
              </p>
            )}
            {ticket.customer.city && (
              <p className="flex items-center gap-2 text-sm">
                <Icon name="location_on" className="text-slate-400" />
                {ticket.customer.city}
              </p>
            )}
            {ticket.customer.notes && (
              <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 mt-2">{ticket.customer.notes}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
