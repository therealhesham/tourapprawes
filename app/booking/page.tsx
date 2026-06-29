"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState("upcoming");
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/booking")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const formatted = data.map(b => {
            // Determine if upcoming or past
            const start = new Date(b.startDate);
            const now = new Date();
            const type = start >= now ? "upcoming" : "past";

            return {
              id: b.id.substring(0, 8).toUpperCase(), // Short ID
              destination: b.companyPackage?.countryCode || "وجهة مخصصة",
              title: b.companyPackage?.name || "رحلة مخصصة",
              image: b.companyPackage?.image || "/images/default.jpg",
              startDate: b.startDate,
              endDate: b.endDate,
              duration: b.companyPackage?.days ? `${b.companyPackage.days} أيام` : "مخصصة",
              status: type === "upcoming" ? "مؤكد" : "مكتمل", // Simplified status for demo
              price: b.pricing.toLocaleString("en-US"),
              persons: 2, // Assuming default 2 for demo if not in schema
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "مؤكد":
        return "bg-green-100 text-green-700 border-green-200";
      case "قيد المراجعة":
        return "bg-yellow-100 text-yellow-700 border-yellow-200";
      case "مكتمل":
        return "bg-gray-100 text-gray-700 border-gray-200";
      case "ملغى":
        return "bg-red-100 text-red-700 border-red-200";
      default:
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "مؤكد": return "check_circle";
      case "قيد المراجعة": return "pending";
      case "مكتمل": return "task_alt";
      case "ملغى": return "cancel";
      default: return "info";
    }
  };

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
                  <Image
                    src={booking.image}
                    alt={booking.title}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4 md:hidden">
                    <h3 className="text-white text-lg font-bold">{booking.title}</h3>
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex-grow flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start mb-2">
                      <div className="hidden md:block">
                        <p className="text-gray-400 text-xs font-bold mb-1 tracking-widest">{booking.destination}</p>
                        <h3 className="text-primary text-xl font-bold">{booking.title}</h3>
                      </div>

                      {/* Status Badge */}
                      <div className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusColor(booking.status)}`}>
                        <span className="material-symbols-outlined text-[16px]">{getStatusIcon(booking.status)}</span>
                        {booking.status}
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
                        <p className="text-gray-400 text-xs font-semibold mb-1">المسافرون</p>
                        <p className="text-gray-700 font-bold text-sm flex items-center gap-1">
                          {booking.persons} أشخاص
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
                      <button className="bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                        الفاتورة
                      </button>
                      <button className="bg-primary text-white hover:bg-[#1e1b4b] px-4 py-2 rounded-lg font-bold text-sm transition-colors flex items-center gap-1">
                        <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                        التذكرة
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

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 flex-shrink-0 bg-white/50 backdrop-blur-sm mt-auto">
        © {new Date().getFullYear()} معاون MOAWEN - جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
