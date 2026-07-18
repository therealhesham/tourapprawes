"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import Icon from "@/components/Icon";

// Header button for admin staff: captures the current screen, then opens a
// modal to describe the problem. Reports land in /admin/bug-reports for IT.
export default function BugReportButton() {
  const pathname = usePathname();
  const [capturing, setCapturing] = useState(false);
  const [open, setOpen] = useState(false);
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [description, setDescription] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState<number | null>(null);

  const capture = async () => {
    setCapturing(true);
    setError("");
    let shot: string | null = null;
    try {
      // Loaded on demand — most sessions never open the bug reporter
      const { toJpeg } = await import("html-to-image");
      // Downscale wide screens so the stored image stays small
      const scale = Math.min(1, 1280 / document.body.clientWidth);
      shot = await toJpeg(document.body, {
        quality: 0.7,
        pixelRatio: 1,
        canvasWidth: Math.round(document.body.clientWidth * scale),
        canvasHeight: Math.round(document.body.clientHeight * scale),
        backgroundColor: "#f8fafc",
        // Skip the reporter's own UI if it's ever in the tree
        filter: (node) =>
          !(node instanceof HTMLElement && node.dataset?.bugReporter === "true"),
      });
    } catch {
      // Capture is best-effort; the report is still useful without it
    }
    setScreenshot(shot);
    setCapturing(false);
    setSent(null);
    setDescription("");
    setOpen(true);
  };

  const submit = async () => {
    if (!description.trim()) {
      setError("اكتب وصف المشكلة أولاً");
      return;
    }
    setSending(true);
    setError("");
    try {
      const res = await fetch("/api/admin/bug-reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, page: pathname, screenshot }),
      });
      const data = await res.json();
      if (data.error) setError(data.error);
      else setSent(data.reportNumber);
    } catch {
      setError("حدث خطأ أثناء إرسال البلاغ.");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <button
        onClick={capture}
        disabled={capturing}
        title="الإبلاغ عن مشكلة"
        aria-label="الإبلاغ عن مشكلة"
        className="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all disabled:opacity-50"
      >
        <Icon name="bug_report" className={`text-xl ${capturing ? "animate-pulse" : ""}`} />
      </button>

      {open && (
        <div
          data-bug-reporter="true"
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
          dir="rtl"
        >
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg my-8">
            <div className="flex items-center justify-between p-5 border-b border-slate-100">
              <h3 className="text-lg font-extrabold text-primary flex items-center gap-2">
                <Icon name="bug_report" className="text-red-500" />
                الإبلاغ عن مشكلة
              </h3>
              <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-slate-700">
                <Icon name="close" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {sent ? (
                <div className="text-center py-6 space-y-3">
                  <Icon name="check_circle" className="text-5xl text-green-500" />
                  <p className="font-bold text-primary text-lg">تم إرسال البلاغ رقم BUG-{String(sent).padStart(4, "0")}</p>
                  <p className="text-sm text-slate-500">سيطلع عليه مختص الدعم الفني وشكراً لمساعدتك في تحسين النظام.</p>
                  <button
                    onClick={() => setOpen(false)}
                    className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold"
                  >
                    إغلاق
                  </button>
                </div>
              ) : (
                <>
                  {screenshot ? (
                    <div className="flex items-center gap-3">
                      <img
                        src={screenshot}
                        alt="لقطة الشاشة"
                        className="h-20 w-28 object-cover object-top rounded-lg border border-slate-200 bg-slate-50 shrink-0"
                      />
                      <p className="text-xs text-slate-500">
                        لقطة الشاشة الحالية مرفقة تلقائياً وسيشاهدها مختص الدعم الفني.
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                      تعذر التقاط لقطة الشاشة — سيُرسل البلاغ بالوصف فقط.
                    </p>
                  )}

                  <label className="block">
                    <span className="block text-sm font-bold text-slate-600 mb-1">وصف المشكلة *</span>
                    <textarea
                      className="w-full rounded-xl border-slate-200 bg-white focus:border-secondary focus:ring-secondary text-sm"
                      rows={4}
                      placeholder="ماذا كنت تحاول أن تفعل؟ وما الذي حدث بدلاً من ذلك؟"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                    />
                  </label>

                  <p className="text-[11px] text-slate-400">
                    الصفحة الحالية ({pathname}) واسمك سيُرفقان تلقائياً مع البلاغ.
                  </p>

                  {error && (
                    <p className="p-3 rounded-xl text-sm font-bold bg-red-50 text-red-700 border border-red-200">{error}</p>
                  )}

                  <div className="flex justify-end gap-3">
                    <button
                      onClick={() => setOpen(false)}
                      className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100"
                    >
                      إلغاء
                    </button>
                    <button
                      onClick={submit}
                      disabled={sending}
                      className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg transition-all disabled:opacity-50"
                    >
                      {sending ? "جاري الإرسال..." : "إرسال البلاغ"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
