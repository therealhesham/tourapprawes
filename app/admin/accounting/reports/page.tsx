"use client";

import { useState, useEffect, useCallback } from "react";
import { fmtMoney, fmtDate, PageHeader, Spinner, Alert, Field, inputCls, PrimaryBtn, docNo } from "../ui";
import Icon from "@/components/Icon";

type Account = { id: string; code: string; name: string };

const TABS = [
  { key: "trial-balance", label: "ميزان المراجعة", icon: "balance" },
  { key: "income", label: "قائمة الدخل", icon: "trending_up" },
  { key: "balance-sheet", label: "المركز المالي", icon: "account_balance" },
  { key: "ledger", label: "دفتر الأستاذ", icon: "menu_book" },
  { key: "vat", label: "تقرير الضريبة", icon: "receipt_long" },
  { key: "trips", label: "ربحية الرحلات", icon: "travel_explore" },
];

export default function ReportsPage() {
  const [tab, setTab] = useState("trial-balance");
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [accountId, setAccountId] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/admin/accounting/accounts")
      .then((r) => r.json())
      .then((d) => {
        if (!d.error && Array.isArray(d)) setAccounts(d);
      })
      .catch(console.error);
  }, []);

  const load = useCallback(async (t: string, acc: string, f: string, tto: string) => {
    if (t === "ledger" && !acc) {
      setData(null);
      return;
    }
    setLoading(true);
    setError("");
    try {
      const qs = new URLSearchParams({ type: t });
      if (f) qs.set("from", f);
      if (tto) qs.set("to", tto);
      if (t === "ledger") qs.set("accountId", acc);
      const res = await fetch(`/api/admin/accounting/reports?${qs}`);
      const d = await res.json();
      if (d.error) setError(d.error);
      else setData(d);
    } catch {
      setError("حدث خطأ أثناء تحميل التقرير.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(tab, accountId, from, to);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        title="التقارير المالية"
        subtitle="ميزان المراجعة، قائمة الدخل، دفتر الأستاذ، الضريبة، وربحية الرحلات"
        actions={
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 text-primary rounded-xl font-bold hover:shadow print:hidden"
          >
            <Icon name="print" />
            طباعة التقرير
          </button>
        }
      />

      <div className="flex flex-wrap gap-2 print:hidden">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all ${
              tab === t.key ? "bg-primary text-white shadow-lg" : "bg-white text-slate-500 hover:bg-slate-50 border border-slate-200"
            }`}
          >
            <Icon name={t.icon} className="text-lg" />
            {t.label}
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-white/60 shadow-md p-4 flex flex-wrap items-end gap-4 print:hidden">
        {tab === "ledger" && (
          <Field label="الحساب">
            <select className={inputCls} value={accountId} onChange={(e) => setAccountId(e.target.value)}>
              <option value="">— اختر الحساب —</option>
              {accounts.map((a) => (
                <option key={a.id} value={a.id}>{a.code} — {a.name}</option>
              ))}
            </select>
          </Field>
        )}
        {tab !== "trips" && tab !== "balance-sheet" && (
          <>
            <Field label="من تاريخ">
              <input type="date" className={inputCls} value={from} onChange={(e) => setFrom(e.target.value)} />
            </Field>
            <Field label="إلى تاريخ">
              <input type="date" className={inputCls} value={to} onChange={(e) => setTo(e.target.value)} />
            </Field>
          </>
        )}
        <PrimaryBtn onClick={() => load(tab, accountId, from, to)}>عرض التقرير</PrimaryBtn>
      </div>

      <Alert error={error} />
      {loading && <Spinner />}

      {!loading && data && (
        <div className="glass-panel rounded-3xl border border-white/60 shadow-xl overflow-hidden print:shadow-none">
          {tab === "trial-balance" && (
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold">الرمز</th>
                  <th className="py-3 px-4 font-bold">الحساب</th>
                  <th className="py-3 px-4 font-bold">مدين</th>
                  <th className="py-3 px-4 font-bold">دائن</th>
                </tr>
              </thead>
              <tbody>
                {data.rows?.map((r: any) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-2.5 px-4 text-slate-500">{r.code}</td>
                    <td className="py-2.5 px-4 font-bold">{r.name}</td>
                    <td className="py-2.5 px-4">{r.debit ? fmtMoney(r.debit) : ""}</td>
                    <td className="py-2.5 px-4">{r.credit ? fmtMoney(r.credit) : ""}</td>
                  </tr>
                ))}
                <tr className="bg-primary/5 font-black text-primary">
                  <td className="py-3 px-4" colSpan={2}>الإجمالي</td>
                  <td className="py-3 px-4">{fmtMoney(data.totalDebit)}</td>
                  <td className="py-3 px-4">{fmtMoney(data.totalCredit)}</td>
                </tr>
              </tbody>
            </table>
          )}

          {tab === "income" && (
            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-black text-primary mb-3">الإيرادات</h4>
                {data.revenue?.map((r: any) => (
                  <div key={r.id} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                    <span>{r.code} — {r.name}</span>
                    <span className="font-bold">{fmtMoney(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-black text-green-700">
                  <span>إجمالي الإيرادات</span>
                  <span>{fmtMoney(data.totalRevenue)}</span>
                </div>
              </div>
              <div>
                <h4 className="font-black text-primary mb-3">المصروفات</h4>
                {data.expenses?.map((r: any) => (
                  <div key={r.id} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                    <span>{r.code} — {r.name}</span>
                    <span className="font-bold">{fmtMoney(r.amount)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 font-black text-red-700">
                  <span>إجمالي المصروفات</span>
                  <span>{fmtMoney(data.totalExpenses)}</span>
                </div>
              </div>
              <div className={`flex justify-between p-4 rounded-xl font-black text-lg ${data.netProfit >= 0 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                <span>{data.netProfit >= 0 ? "صافي الربح" : "صافي الخسارة"}</span>
                <span>{fmtMoney(Math.abs(data.netProfit))}</span>
              </div>
            </div>
          )}

          {tab === "balance-sheet" && (
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h4 className="font-black text-primary mb-3">الأصول</h4>
                {data.assets?.map((r: any) => (
                  <div key={r.id} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                    <span>{r.code} — {r.name}</span>
                    <span className="font-bold">{fmtMoney(r.balance)}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 font-black text-primary border-t-2 border-primary mt-2">
                  <span>إجمالي الأصول</span>
                  <span>{fmtMoney(data.totalAssets)}</span>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h4 className="font-black text-primary mb-3">الالتزامات</h4>
                  {data.liabilities?.length === 0 && <p className="text-sm text-slate-400">لا توجد التزامات.</p>}
                  {data.liabilities?.map((r: any) => (
                    <div key={r.id} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span>{r.code} — {r.name}</span>
                      <span className="font-bold">{fmtMoney(r.balance)}</span>
                    </div>
                  ))}
                </div>
                <div>
                  <h4 className="font-black text-primary mb-3">حقوق الملكية</h4>
                  {data.equity?.map((r: any) => (
                    <div key={r.id} className="flex justify-between py-2 border-b border-slate-50 text-sm">
                      <span>{r.code} — {r.name}</span>
                      <span className="font-bold">{fmtMoney(r.balance)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b border-slate-50 text-sm">
                    <span>أرباح (خسائر) الفترة</span>
                    <span className={`font-bold ${data.netProfit >= 0 ? "text-green-700" : "text-red-700"}`}>{fmtMoney(data.netProfit)}</span>
                  </div>
                </div>
                <div className="flex justify-between py-3 font-black text-primary border-t-2 border-primary">
                  <span>إجمالي الالتزامات وحقوق الملكية</span>
                  <span>{fmtMoney(data.totalLiabilities + data.totalEquity)}</span>
                </div>
                <p className={`text-sm font-bold rounded-xl p-3 ${data.balanced ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"}`}>
                  {data.balanced ? "المركز المالي متوازن ✓" : "غير متوازن — راجع القيود"}
                </p>
              </div>
            </div>
          )}

          {tab === "ledger" && data.account && (
            <div>
              <h4 className="font-black text-primary p-4 border-b border-slate-100 bg-slate-50/50">
                {data.account.code} — {data.account.name}
              </h4>
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="text-slate-500 border-b border-slate-100">
                    <th className="py-3 px-4 font-bold">القيد</th>
                    <th className="py-3 px-4 font-bold">التاريخ</th>
                    <th className="py-3 px-4 font-bold">البيان</th>
                    <th className="py-3 px-4 font-bold">مدين</th>
                    <th className="py-3 px-4 font-bold">دائن</th>
                    <th className="py-3 px-4 font-bold">الرصيد</th>
                  </tr>
                </thead>
                <tbody>
                  {data.rows?.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="py-2.5 px-4 text-slate-500">{docNo("JV", r.entryNumber)}</td>
                      <td className="py-2.5 px-4">{fmtDate(r.date)}</td>
                      <td className="py-2.5 px-4">{r.description}</td>
                      <td className="py-2.5 px-4">{r.debit ? fmtMoney(r.debit) : ""}</td>
                      <td className="py-2.5 px-4">{r.credit ? fmtMoney(r.credit) : ""}</td>
                      <td className="py-2.5 px-4 font-bold">{fmtMoney(r.balance)}</td>
                    </tr>
                  ))}
                  <tr className="bg-primary/5 font-black text-primary">
                    <td className="py-3 px-4" colSpan={5}>الرصيد النهائي</td>
                    <td className="py-3 px-4">{fmtMoney(data.balance)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
          {tab === "ledger" && !data.account && (
            <p className="p-8 text-center text-slate-500">اختر حساباً لعرض حركاته.</p>
          )}

          {tab === "vat" && (
            <div className="p-6 space-y-4 max-w-lg">
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 font-bold">
                <span>ضريبة المخرجات (على المبيعات)</span>
                <span>{fmtMoney(data.outputVat)}</span>
              </div>
              <div className="flex justify-between p-4 rounded-xl bg-slate-50 font-bold">
                <span>ضريبة المدخلات (على المشتريات) — قابلة للخصم</span>
                <span>{fmtMoney(data.inputVat)}</span>
              </div>
              <div className={`flex justify-between p-4 rounded-xl font-black text-lg ${data.netVatDue >= 0 ? "bg-rose-50 text-rose-700" : "bg-green-50 text-green-700"}`}>
                <span>{data.netVatDue >= 0 ? "صافي الضريبة المستحقة للهيئة" : "رصيد ضريبي دائن لصالحك"}</span>
                <span>{fmtMoney(Math.abs(data.netVatDue))}</span>
              </div>
            </div>
          )}

          {tab === "trips" && (
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="text-slate-500 border-b border-slate-100 bg-slate-50/50">
                  <th className="py-3 px-4 font-bold">العميل</th>
                  <th className="py-3 px-4 font-bold">الباقة</th>
                  <th className="py-3 px-4 font-bold">الفترة</th>
                  <th className="py-3 px-4 font-bold">الإيراد (فواتير)</th>
                  <th className="py-3 px-4 font-bold">التكلفة</th>
                  <th className="py-3 px-4 font-bold">المحصّل</th>
                  <th className="py-3 px-4 font-bold">الربح</th>
                </tr>
              </thead>
              <tbody>
                {Array.isArray(data) && data.length === 0 && (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500">لا توجد حجوزات.</td>
                  </tr>
                )}
                {Array.isArray(data) &&
                  data.map((r: any) => (
                    <tr key={r.id} className="border-b border-slate-50">
                      <td className="py-2.5 px-4 font-bold">{r.clientName}</td>
                      <td className="py-2.5 px-4 text-slate-500">{r.packageName}</td>
                      <td className="py-2.5 px-4 text-slate-500">{r.startDate} → {r.endDate}</td>
                      <td className="py-2.5 px-4">{fmtMoney(r.revenue)}</td>
                      <td className="py-2.5 px-4 text-red-700">{fmtMoney(r.cost)}</td>
                      <td className="py-2.5 px-4">{fmtMoney(r.collected)}</td>
                      <td className={`py-2.5 px-4 font-black ${r.profit >= 0 ? "text-green-700" : "text-red-700"}`}>
                        {fmtMoney(r.profit)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      <style jsx global>{`
        @media print {
          aside, nav, header {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}
