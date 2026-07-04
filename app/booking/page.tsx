"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [invoiceBooking, setInvoiceBooking] = useState<any | null>(null);

  useEffect(() => {
    fetch("/api/booking")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(b => {
            // Determine if upcoming or past
            const start = new Date(b.startDate);
            const end = new Date(b.endDate);
            const now = new Date();
            const type = start >= now ? "upcoming" : "past";

            // Duration from package days, otherwise computed from booking dates
            const diffDays = Math.round((end.getTime() - start.getTime()) / 86400000);
            const duration = b.companyPackage?.days
              ? `${b.companyPackage.days} أيام`
              : diffDays > 0 ? `${diffDays} أيام` : "";

            return {
              id: b.id.substring(0, 8).toUpperCase(), // Short ID
              fullId: b.id,
              destination: b.companyPackage?.countryCode || null,
              title: b.companyPackage?.name || "رحلة مخصصة",
              image: b.companyPackage?.image || null,
              startDate: b.startDate,
              endDate: b.endDate,
              duration,
              clientName: b.clientName,
              clientPhone: b.clientPhone,
              createdAt: b.createdAt,
              price: b.pricing.toLocaleString("en-US"),
              type: type
            };
          });
          setBookings(formatted);
        }
      })
      .catch(err => console.error("Error loading bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  const filteredBookings = bookings.filter(b => b.type === activeTab);

  // Badge derived from booking dates (no status column in the database)
  const getBadge = (type: string) =>
    type === "upcoming"
      ? { label: "قادمة", icon: "event_upcoming", classes: "bg-green-100 text-green-700 border-green-200" }
      : { label: "منتهية", icon: "task_alt", classes: "bg-gray-100 text-gray-700 border-gray-200" };

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex flex-col" dir="rtl" style={{ fontFamily: 'inherit' }}>
      {/* ─── Background Pattern ─────────────────────────────────────── */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{

          backgroundSize: '100% 100%, 100% 100%, 100% 100%, 40px 40px, 40px 40px',
          backgroundPosition: 'center center',
          zIndex: 0
        }}
      />

      {/* ─── Navbar ─────────────────────────────────────────────────── */}
      <Navbar theme="light" />

      {/* ─── Header ─────────────────────────────────────────────────── */}
      <section className="relative z-10 pt-16 pb-8 text-center px-4">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-primary">حجوزاتي</h1>
          <span className="material-symbols-outlined text-primary text-4xl">luggage</span>
        </div>
        <p className="text-gray-500 font-medium">تابع رحلاتك القادمة والسابقة من مكان واحد</p>
      </section>

      {/* ─── Tabs ───────────────────────────────────────────────────── */}
      <section className="relative z-20 mb-10 flex justify-center">
        <div className="bg-gray-50 p-1 rounded-full border border-gray-100 shadow-sm flex">
          <button
            onClick={() => setActiveTab("upcoming")}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "upcoming"
              ? "bg-white text-primary shadow-[0_2px_10px_rgba(46,49,146,0.1)]"
              : "text-gray-500 hover:text-primary"
              }`}
          >
            حجوزات قادمة
          </button>
          <button
            onClick={() => setActiveTab("past")}
            className={`px-8 py-2.5 rounded-full text-sm font-bold transition-all ${activeTab === "past"
              ? "bg-white text-primary shadow-[0_2px_10px_rgba(46,49,146,0.1)]"
              : "text-gray-500 hover:text-primary"
              }`}
          >
            حجوزات سابقة
          </button>
        </div>
      </section>

      {/* ─── Bookings List ─────────────────────────────────────────── */}
      <main className="relative z-10 max-w-[900px] mx-auto w-full px-6 pb-24 flex-grow">
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-primary rounded-full animate-spin" />
          </div>
        ) : filteredBookings.length > 0 ? (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-3xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-gray-100 flex flex-col md:flex-row transition-all duration-300 hover:shadow-[0_8px_30px_rgba(28,0,198,0.08)]">

                {/* Image */}
                <div className="relative w-full md:w-64 h-48 md:h-auto flex-shrink-0">
                  {booking.image ? (
                    <Image
                      src={booking.image}
                      alt={booking.title}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                      <span className="material-symbols-outlined text-5xl text-gray-300">travel_explore</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                    <h3 className="text-white text-lg font-bold">{booking.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="hidden md:block">
                        {booking.destination && (
                          <p className="text-gray-400 text-xs font-bold mb-1 tracking-widest">{booking.destination}</p>
                        )}
                        <h3 className="text-primary text-xl font-bold">{booking.title}</h3>
                      </div>

                      {/* Status Badge (derived from booking dates) */}
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold ${getBadge(booking.type).classes}`}>
                        <span className="material-symbols-outlined text-[16px]">{getBadge(booking.type).icon}</span>
                        {getBadge(booking.type).label}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4 mb-4 md:mb-0 bg-gray-50/50 p-3 rounded-xl border border-gray-100">
                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-1">رقم الحجز</p>
                        <p className="text-primary font-bold text-sm" dir="ltr">{booking.id}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-1">التاريخ</p>
                        <p className="text-gray-700 font-bold text-sm">{booking.startDate}</p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-1">المدة</p>
                        <p className="text-gray-700 font-bold text-sm flex items-center gap-1">
                          {booking.duration}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-semibold mb-1">اسم العميل</p>
                        <p className="text-gray-700 font-bold text-sm flex items-center gap-1">
                          {booking.clientName}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer of Card */}
                  <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-gray-400 text-xs font-semibold mb-1">إجمالي المبلغ</p>
                      <div>
                        <span className="text-primary font-black text-xl">{booking.price}</span>
                        <span className="text-primary font-bold text-xs ml-1">ريال</span>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setInvoiceBooking(booking)}
                        className="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1"
                      >
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        الفاتورة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="text-center py-20 px-6 bg-white rounded-3xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] max-w-2xl mx-auto">
            <span className="material-symbols-outlined text-6xl text-gray-300 mb-4 block">
              event_busy
            </span>
            <h3 className="text-xl font-bold text-[#1C00C6] mb-2">
              لا توجد {activeTab === "upcoming" ? "حجوزات قادمة" : "حجوزات سابقة"}
            </h3>
            <p className="text-gray-500 mb-8 text-sm">
              لم تقم بأي حجوزات حتى الآن. استكشف باقاتنا الرائعة وابدأ التخطيط لرحلتك القادمة!
            </p>
            <Link
              href="/packages"
              className="inline-block bg-primary text-white hover:bg-primary-container px-8 py-3 rounded-full font-bold text-sm transition-colors shadow-lg shadow-primary/20"
            >
              استكشف الباقات
            </Link>
          </div>
        )}
      </main>

      {/* ─── Invoice Modal ─────────────────────────────────────────── */}
      {invoiceBooking && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 print:bg-white print:p-0"
          onClick={() => setInvoiceBooking(null)}
        >
          <div
            className="invoice-print bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden print:shadow-none print:rounded-none print:max-w-none"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Invoice Header */}
            <div className="bg-primary text-white p-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-black mb-1">فاتورة الحجز</h2>
                <p className="text-white/70 text-xs font-bold" dir="ltr">#{invoiceBooking.id}</p>
              </div>
              <button
                onClick={() => setInvoiceBooking(null)}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors print:hidden"
                aria-label="إغلاق"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            {/* Invoice Body */}
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-400 text-sm font-semibold">الرحلة</span>
                <span className="text-primary font-bold">{invoiceBooking.title}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-400 text-sm font-semibold">اسم العميل</span>
                <span className="text-gray-800 font-bold">{invoiceBooking.clientName}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-400 text-sm font-semibold">رقم الجوال</span>
                <span className="text-gray-800 font-bold" dir="ltr">{invoiceBooking.clientPhone}</span>
              </div>
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-400 text-sm font-semibold">تاريخ الرحلة</span>
                <span className="text-gray-800 font-bold">{invoiceBooking.startDate} — {invoiceBooking.endDate}</span>
              </div>
              {invoiceBooking.duration && (
                <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                  <span className="text-gray-400 text-sm font-semibold">المدة</span>
                  <span className="text-gray-800 font-bold">{invoiceBooking.duration}</span>
                </div>
              )}
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <span className="text-gray-400 text-sm font-semibold">تاريخ إصدار الحجز</span>
                <span className="text-gray-800 font-bold">
                  {new Date(invoiceBooking.createdAt).toLocaleDateString("ar-SA")}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center bg-gray-50 rounded-xl p-4 border border-gray-100">
                <span className="text-gray-600 font-bold">الإجمالي</span>
                <div>
                  <span className="text-primary font-black text-2xl">{invoiceBooking.price}</span>
                  <span className="text-primary font-bold text-sm mr-1">ريال</span>
                </div>
              </div>
            </div>

            {/* Invoice Footer */}
            <div className="p-6 pt-0 flex gap-3 print:hidden">
              <button
                onClick={() => window.print()}
                className="flex-1 bg-primary text-white hover:bg-[#1e1b4b] px-4 py-3 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-[18px]">print</span>
                طباعة الفاتورة
              </button>
              <button
                onClick={() => setInvoiceBooking(null)}
                className="flex-1 bg-gray-100 text-gray-600 hover:bg-gray-200 px-4 py-3 rounded-xl font-bold text-sm transition-colors"
              >
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
