"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { fmtMoney, fmtDate, Spinner, docNo, METHOD_LABELS, INVOICE_STATUS } from "../../ui";

type InvoiceData = {
  invoice: {
    id: string;
    invoiceNumber: number;
    status: string;
    issueDate: string;
    dueDate: string | null;
    clientName: string;
    clientPhone: string | null;
    clientVatNumber: string | null;
    clientAddress: string | null;
    subtotal: string;
    vatRate: string;
    vatAmount: string;
    total: string;
    paidAmount: string;
    notes: string | null;
    items: { id: string; description: string; quantity: string; unitPrice: string; lineTotal: string }[];
    receipts: { id: string; receiptNumber: number; date: string; amount: string; method: string }[];
  };
  settings: {
    companyName: string;
    vatNumber: string;
    crNumber: string;
    address: string;
    phone: string;
  };
  zatcaQr: string | null;
};

export default function InvoiceViewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [data, setData] = useState<InvoiceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [qrDataUrl, setQrDataUrl] = useState("");

  useEffect(() => {
    fetch(`/api/admin/accounting/invoices/${id}`)
      .then((r) => r.json())
      .then((d) => {
        if (d.error) setError(d.error);
        else setData(d);
      })
      .catch(() => setError("حدث خطأ أثناء تحميل الفاتورة."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (data?.zatcaQr) {
      QRCode.toDataURL(data.zatcaQr, { margin: 1, width: 180 })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [data?.zatcaQr]);

  if (loading) return <Spinner />;
  if (error || !data) return <p className="text-red-600 font-bold p-8">{error || "الفاتورة غير موجودة"}</p>;

  const { invoice, settings } = data;
  const st = INVOICE_STATUS[invoice.status] || INVOICE_STATUS.ISSUED;
  const remaining = Number(invoice.total) - Number(invoice.paidAmount);

  return (
    <div className="text-right" dir="rtl">
      {/* Toolbar — hidden on print */}
      <div className="flex justify-between items-center mb-6 print:hidden">
        <Link href="/admin/accounting/invoices" className="flex items-center gap-2 text-slate-500 font-bold hover:text-primary">
          <span className="material-symbols-outlined rotate-180">arrow_back</span>
          عودة للفواتير
        </Link>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-white rounded-xl font-bold hover:shadow-lg"
        >
          <span className="material-symbols-outlined">print</span>
          طباعة
        </button>
      </div>

      {/* Printable invoice */}
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-3xl mx-auto print:shadow-none print:rounded-none print:max-w-none" id="invoice-print">
        <div className="flex justify-between items-start border-b-2 border-primary pb-6 mb-6">
          <div>
            <h1 className="text-2xl font-black text-primary">{settings.companyName}</h1>
            {settings.address && <p className="text-sm text-slate-500 mt-1">{settings.address}</p>}
            {settings.phone && <p className="text-sm text-slate-500" dir="ltr">{settings.phone}</p>}
            <div className="mt-2 text-sm font-bold text-slate-600 space-y-0.5">
              {settings.vatNumber && <p>الرقم الضريبي: <span dir="ltr">{settings.vatNumber}</span></p>}
              {settings.crNumber && <p>السجل التجاري: <span dir="ltr">{settings.crNumber}</span></p>}
            </div>
          </div>
          <div className="text-left">
            <h2 className="text-xl font-black text-primary mb-2">
              {invoice.clientVatNumber ? "فاتورة ضريبية" : "فاتورة ضريبية مبسطة"}
            </h2>
            <p className="text-sm font-bold">{docNo("INV", invoice.invoiceNumber)}</p>
            <p className="text-sm text-slate-500">تاريخ الإصدار: {fmtDate(invoice.issueDate)}</p>
            {invoice.dueDate && <p className="text-sm text-slate-500">تاريخ الاستحقاق: {fmtDate(invoice.dueDate)}</p>}
            <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${st.cls}`}>{st.label}</span>
          </div>
        </div>

        <div className="mb-6 bg-slate-50 rounded-xl p-4 print:bg-white print:border print:border-slate-200">
          <p className="text-xs font-bold text-slate-400 mb-1">فاتورة إلى</p>
          <p className="font-black text-primary">{invoice.clientName}</p>
          <div className="text-sm text-slate-600 mt-1 space-y-0.5">
            {invoice.clientPhone && <p dir="ltr" className="text-right">{invoice.clientPhone}</p>}
            {invoice.clientVatNumber && <p>الرقم الضريبي: <span dir="ltr">{invoice.clientVatNumber}</span></p>}
            {invoice.clientAddress && <p>{invoice.clientAddress}</p>}
          </div>
        </div>

        <table className="w-full text-sm mb-6">
          <thead>
            <tr className="bg-primary text-white">
              <th className="py-2.5 px-3 font-bold text-right rounded-r-lg">الوصف</th>
              <th className="py-2.5 px-3 font-bold w-20">الكمية</th>
              <th className="py-2.5 px-3 font-bold w-32">سعر الوحدة</th>
              <th className="py-2.5 px-3 font-bold w-32 rounded-l-lg">الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((it) => (
              <tr key={it.id} className="border-b border-slate-100">
                <td className="py-2.5 px-3">{it.description}</td>
                <td className="py-2.5 px-3 text-center">{Number(it.quantity)}</td>
                <td className="py-2.5 px-3 text-center">{fmtMoney(it.unitPrice)}</td>
                <td className="py-2.5 px-3 text-center font-bold">{fmtMoney(it.lineTotal)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="flex justify-end mb-6">
          <div className="w-72 text-sm font-bold space-y-2">
            <div className="flex justify-between text-slate-600">
              <span>الإجمالي قبل الضريبة</span>
              <span>{fmtMoney(invoice.subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>ضريبة القيمة المضافة ({Number(invoice.vatRate)}%)</span>
              <span>{fmtMoney(invoice.vatAmount)}</span>
            </div>
            <div className="flex justify-between text-primary text-base border-t-2 border-primary pt-2">
              <span>الإجمالي المستحق</span>
              <span>{fmtMoney(invoice.total)}</span>
            </div>
            {Number(invoice.paidAmount) > 0 && (
              <>
                <div className="flex justify-between text-green-700">
                  <span>المسدد</span>
                  <span>{fmtMoney(invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>المتبقي</span>
                  <span>{fmtMoney(remaining)}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {invoice.receipts.length > 0 && (
          <div className="mb-6 print:hidden">
            <p className="text-sm font-bold text-slate-600 mb-2">سندات القبض المرتبطة</p>
            <table className="w-full text-xs text-right">
              <thead>
                <tr className="text-slate-400 border-b border-slate-100">
                  <th className="py-1.5 px-2 font-bold">الرقم</th>
                  <th className="py-1.5 px-2 font-bold">التاريخ</th>
                  <th className="py-1.5 px-2 font-bold">الطريقة</th>
                  <th className="py-1.5 px-2 font-bold">المبلغ</th>
                </tr>
              </thead>
              <tbody>
                {invoice.receipts.map((r) => (
                  <tr key={r.id} className="border-b border-slate-50">
                    <td className="py-1.5 px-2">{docNo("REC", r.receiptNumber)}</td>
                    <td className="py-1.5 px-2">{fmtDate(r.date)}</td>
                    <td className="py-1.5 px-2">{METHOD_LABELS[r.method] || r.method}</td>
                    <td className="py-1.5 px-2 font-bold">{fmtMoney(r.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {invoice.notes && (
          <div className="text-sm text-slate-600 border-t border-slate-100 pt-4">
            <p className="font-bold mb-1">ملاحظات:</p>
            <p>{invoice.notes}</p>
          </div>
        )}

        <div className="flex items-end justify-between mt-8">
          {qrDataUrl ? (
            <div className="text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={qrDataUrl} alt="ZATCA QR" className="w-32 h-32" />
              <p className="text-[10px] text-slate-400 mt-1">رمز الفاتورة الإلكترونية — هيئة الزكاة والضريبة والجمارك</p>
            </div>
          ) : (
            <p className="text-xs text-amber-600 font-bold print:hidden">
              أدخل الرقم الضريبي في إعدادات المحاسبة ليظهر رمز QR المطلوب من زاتكا
            </p>
          )}
          <p className="text-xs text-slate-400">شكراً لتعاملكم معنا — {settings.companyName}</p>
        </div>
      </div>

      <style jsx global>{`
        @media print {
          aside, nav, header {
            display: none !important;
          }
          body {
            background: white !important;
          }
        }
      `}</style>
    </div>
  );
}
