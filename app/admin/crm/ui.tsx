"use client";

// CRM label maps + re-exported shared admin UI primitives
export {
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
} from "../accounting/ui";

export const TICKET_STATUS: Record<string, { label: string; cls: string }> = {
  OPEN: { label: "مفتوحة", cls: "bg-amber-100 text-amber-800" },
  IN_PROGRESS: { label: "قيد المعالجة", cls: "bg-blue-100 text-blue-800" },
  WAITING_CUSTOMER: { label: "بانتظار العميل", cls: "bg-purple-100 text-purple-800" },
  RESOLVED: { label: "تم الحل", cls: "bg-green-100 text-green-800" },
  CLOSED: { label: "مغلقة", cls: "bg-slate-200 text-slate-600" },
};

export const TICKET_PRIORITY: Record<string, { label: string; cls: string }> = {
  LOW: { label: "منخفضة", cls: "bg-slate-100 text-slate-600" },
  MEDIUM: { label: "متوسطة", cls: "bg-blue-100 text-blue-800" },
  HIGH: { label: "عالية", cls: "bg-orange-100 text-orange-800" },
  URGENT: { label: "عاجلة", cls: "bg-red-100 text-red-800" },
};

export const TICKET_CHANNEL: Record<string, string> = {
  PHONE: "هاتف",
  WHATSAPP: "واتساب",
  EMAIL: "بريد إلكتروني",
  WEBSITE: "الموقع",
  IN_PERSON: "حضوري",
  OTHER: "أخرى",
};

export function StatusBadge({ value, map }: { value: string; map: Record<string, { label: string; cls: string }> }) {
  const s = map[value] || { label: value, cls: "bg-slate-100 text-slate-600" };
  return (
    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${s.cls}`}>
      {s.label}
    </span>
  );
}
