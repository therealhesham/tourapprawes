"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { fmtDate, PageHeader, Spinner, Alert, Modal } from "../accounting/ui";
import { useConfirm } from "@/components/ConfirmDialog";

type Report = {
  id: string;
  reportNumber: number;
  description: string;
  page: string;
  reporterName: string;
  resolvedAt: string | null;
  createdAt: string;
};

type FullReport = Report & { screenshot: string | null };

const bugNo = (n: number) => `BUG-${String(n).padStart(4, "0")}`;

export default function BugReportsPage() {
  const confirmDialog = useConfirm();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [viewing, setViewing] = useState<FullReport | null>(null);
  const [loadingView, setLoadingView] = useState(false);
  const [lightbox, setLightbox] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/bug-reports");
      const data = await res.json();
      if (data.error) setError(data.error);
      else setReports(data);
    } catch {
      setError("حدث خطأ أثناء تحميل البلاغات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const openReport = async (id: string) => {
    setLoadingView(true);
    try {
      const res = await fetch(`/api/admin/bug-reports?id=${id}`);
      const data = await res.json();
      if (data.error) setError(data.error);
      else setViewing(data);
    } catch {
      setError("حدث خطأ أثناء تحميل البلاغ.");
    } finally {
      setLoadingView(false);
    }
  };

  const toggleResolved = async (r: Report | FullReport) => {
    const res = await fetch("/api/admin/bug-reports", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: r.id, resolved: !r.resolvedAt }),
    });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage(data.resolvedAt ? "تم وضع البلاغ كمُعالج." : "أُعيد فتح البلاغ.");
      if (viewing?.id === r.id) setViewing({ ...viewing, resolvedAt: data.resolvedAt });
      loadData();
    }
  };

  const remove = async (r: Report) => {
    if (!(await confirmDialog(`سيتم حذف البلاغ ${bugNo(r.reportNumber)} نهائياً. متابعة؟`))) return;
    const res = await fetch(`/api/admin/bug-reports?id=${r.id}`, { method: "DELETE" });
    const data = await res.json();
    if (data.error) setError(data.error);
    else {
      setMessage("تم حذف البلاغ.");
      setViewing(null);
      loadData();
    }
  };

  if (loading) return <Spinner />;

  const openCount = reports.filter((r) => !r.resolvedAt).length;

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="بلاغات الأعطال"
        subtitle={`مشاكل أبلغ عنها الموظفون عبر زر 🐞 — ${openCount} بلاغ بانتظار المعالجة`}
      />
      <Alert error={error} message={message} />

      <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead>
              <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                <th className="py-3 px-4 font-bold">الرقم</th>
                <th className="py-3 px-4 font-bold">الوصف</th>
                <th className="py-3 px-4 font-bold">الصفحة</th>
                <th className="py-3 px-4 font-bold">المُبلغ</th>
                <th className="py-3 px-4 font-bold">الحالة</th>
                <th className="py-3 px-4 font-bold">التاريخ</th>
                <th className="py-3 px-4 font-bold">إجراءات</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    لا توجد بلاغات — كل شيء يعمل بسلام 🎉
                  </td>
                </tr>
              )}
              {reports.map((r) => (
                <tr key={r.id} className={`border-b border-slate-50 hover:bg-slate-50/50 ${r.resolvedAt ? "opacity-60" : ""}`}>
                  <td className="py-3 px-4 font-bold text-primary">
                    <button onClick={() => openReport(r.id)} className="hover:underline">
                      {bugNo(r.reportNumber)}
                    </button>
                  </td>
                  <td className="py-3 px-4 max-w-xs truncate" title={r.description}>{r.description}</td>
                  <td className="py-3 px-4" dir="ltr">
                    <Link href={r.page} className="text-secondary hover:underline">{r.page}</Link>
                  </td>
                  <td className="py-3 px-4">{r.reporterName}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      r.resolvedAt ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                    }`}>
                      {r.resolvedAt ? "تمت المعالجة" : "مفتوح"}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-500">{fmtDate(r.createdAt)}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      <button onClick={() => openReport(r.id)} className="text-slate-400 hover:text-primary" title="عرض التفاصيل واللقطة">
                        <Icon name="visibility" className="text-lg" />
                      </button>
                      <button
                        onClick={() => toggleResolved(r)}
                        className={r.resolvedAt ? "text-amber-400 hover:text-amber-600" : "text-green-400 hover:text-green-600"}
                        title={r.resolvedAt ? "إعادة فتح" : "وضع كمُعالج"}
                      >
                        <Icon name={r.resolvedAt ? "refresh" : "check_circle"} className="text-lg" />
                      </button>
                      <button onClick={() => remove(r)} className="text-red-300 hover:text-red-600" title="حذف">
                        <Icon name="delete" className="text-lg" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {loadingView && <Spinner />}

      {viewing && (
        <Modal title={`${bugNo(viewing.reportNumber)} — تفاصيل البلاغ`} onClose={() => setViewing(null)} wide>
          <div className="space-y-4">
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-slate-600">
              <span>المُبلغ: <b className="text-primary">{viewing.reporterName}</b></span>
              <span>التاريخ: <b className="text-primary">{fmtDate(viewing.createdAt)}</b></span>
              <span dir="ltr">
                <Link href={viewing.page} className="text-secondary hover:underline">{viewing.page}</Link>
              </span>
            </div>
            <p className="text-slate-700 whitespace-pre-wrap bg-slate-50 rounded-2xl p-4 text-sm">{viewing.description}</p>
            {viewing.screenshot ? (
              <div>
                <button
                  onClick={() => setLightbox(true)}
                  className="block w-full cursor-zoom-in"
                  title="اضغط للتكبير"
                >
                  <img
                    src={viewing.screenshot}
                    alt="لقطة الشاشة"
                    className="w-full max-h-56 object-contain object-top rounded-2xl border border-slate-200 bg-slate-50"
                  />
                </button>
                <p className="text-[11px] text-slate-400 mt-1 text-center">اضغط على الصورة لعرضها بالحجم الكامل</p>
              </div>
            ) : (
              <p className="text-sm text-slate-400">لا توجد لقطة شاشة مرفقة.</p>
            )}
            <div className="flex justify-end gap-3">
              <button
                onClick={() => toggleResolved(viewing)}
                className={`px-5 py-2.5 rounded-xl font-bold text-white ${viewing.resolvedAt ? "bg-amber-500" : "bg-green-600"}`}
              >
                {viewing.resolvedAt ? "إعادة فتح البلاغ" : "وضع كمُعالج"}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Full-size screenshot viewer */}
      {lightbox && viewing?.screenshot && (
        <div
          className="fixed inset-0 z-[80] bg-black/80 backdrop-blur-sm p-4 overflow-auto cursor-zoom-out"
          onClick={() => setLightbox(false)}
        >
          <button
            onClick={() => setLightbox(false)}
            className="fixed top-4 left-4 z-[81] text-white/80 hover:text-white p-2 bg-black/40 rounded-full"
            aria-label="إغلاق"
          >
            <Icon name="close" className="text-2xl" />
          </button>
          <img
            src={viewing.screenshot}
            alt="لقطة الشاشة بالحجم الكامل"
            className="max-w-none w-auto mx-auto my-8 rounded-xl shadow-2xl"
          />
        </div>
      )}
    </div>
  );
}
