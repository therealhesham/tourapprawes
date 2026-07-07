"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { hotelCategories, transportMethods } from "@/app/booking/data/mockData";

// Where an in-progress booking form is stashed when submitting requires a login first
const PKG_BOOKING_SNAPSHOT_KEY = "packageBookingSnapshot";

export default function PackageDetailsPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;

  const [pkg, setPkg] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Booking form states
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  useEffect(() => {
    if (!id) return;
    fetch(`/api/packages/${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setPkg(data);
        }
      })
      .catch(() => setError("حدث خطأ أثناء تحميل الباقة."))
      .finally(() => setLoading(false));
  }, [id]);

  // Restore a booking form stashed before a login redirect
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(PKG_BOOKING_SNAPSHOT_KEY);
      if (!saved) return;
      const snapshot = JSON.parse(saved);
      if (snapshot.packageId !== id) return;
      sessionStorage.removeItem(PKG_BOOKING_SNAPSHOT_KEY);
      setClientName(snapshot.clientName || "");
      setClientPhone(snapshot.clientPhone || "");
      setStartDate(snapshot.startDate || "");
      setEndDate(snapshot.endDate || "");
      setShowBookingForm(true);
    } catch {
      sessionStorage.removeItem(PKG_BOOKING_SNAPSHOT_KEY);
    }
  }, [id]);

  const features: string[] = Array.isArray(pkg?.features) ? pkg.features : [];
  const cityStays: any[] = Array.isArray(pkg?.cityStays) ? pkg.cityStays : [];

  const hotelLabel = (catId: string) =>
    hotelCategories.find((c) => c.id === catId)?.name || catId;
  const transportLabel = (tId: string) =>
    transportMethods.find((t) => t.id === tId)?.name || tId;

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setBookingError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          clientPhone,
          startDate,
          endDate,
          departingFlightId: pkg?.departingFlightId || null,
          returningFlightId: pkg?.returningFlightId || null,
          pricing: pkg?.pricing,
          cityStays,
          companyPackageId: pkg?.id,
        }),
      });
      if (res.status === 401) {
        // Stash the form so it survives the login round-trip
        sessionStorage.setItem(
          PKG_BOOKING_SNAPSHOT_KEY,
          JSON.stringify({ packageId: id, clientName, clientPhone, startDate, endDate })
        );
        window.location.href =
          "/login?callbackUrl=" + encodeURIComponent(`/packages/${id}`);
        return;
      }
      const data = await res.json();
      if (data.error) {
        setBookingError(data.error);
      } else {
        setBookingSuccess(true);
      }
    } catch {
      setBookingError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col" dir="rtl">
      <Navbar theme="light" />

      {loading ? (
        <div className="flex-grow flex justify-center items-center py-32">
          <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1C00C6] rounded-full animate-spin" />
        </div>
      ) : error || !pkg ? (
        <div className="flex-grow flex flex-col justify-center items-center py-32 text-center px-4">
          <span className="material-symbols-outlined text-6xl text-gray-300 mb-4">search_off</span>
          <p className="text-xl font-bold text-gray-500 mb-2">{error || "الباقة غير موجودة"}</p>
          <Link href="/packages" className="inline-flex items-center gap-2 mt-4 text-primary font-bold hover:underline">
            <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
            العودة إلى الباقات
          </Link>
        </div>
      ) : (
        <main className="flex-grow">
          {/* ─── Hero ─────────────────────────────────────────────── */}
          <section className="relative h-[380px] md:h-[460px] w-full overflow-hidden">
            <Image src={pkg.image} alt={pkg.name} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-black/10" />
            <div className="absolute inset-x-0 bottom-0 max-w-[1200px] mx-auto w-full px-6 md:px-12 pb-8">
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {pkg.destinationCode && (
                  <span className="bg-white/90 backdrop-blur-md text-primary text-xs font-bold px-3 py-1 rounded-full border border-primary/20">
                    {pkg.destinationCode}
                  </span>
                )}
                {pkg.countryCode && (
                  <span className="bg-white/20 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full border border-white/30">
                    {pkg.countryCode}
                  </span>
                )}
                <span className="bg-[#FBBF24] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md">
                  <span>{pkg.rating}</span>
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  {pkg.reviews > 0 && <span className="font-medium">({pkg.reviews} تقييم)</span>}
                </span>
              </div>
              <h1 className="text-white text-3xl md:text-4xl font-black leading-tight mb-1">{pkg.name}</h1>
              <p className="text-white/85 text-base md:text-lg font-medium">{pkg.title}</p>
            </div>
          </section>

          {/* ─── Content ──────────────────────────────────────────── */}
          <section className="max-w-[1200px] mx-auto w-full px-6 md:px-12 py-10 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Details column */}
            <div className="lg:col-span-2 flex flex-col gap-8">
              {/* Description */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-black text-primary mb-3 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">description</span>
                  عن الباقة
                </h2>
                <p className="text-gray-600 leading-relaxed whitespace-pre-line">{pkg.description}</p>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">stars</span>
                    مميزات الباقة
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700 bg-gray-50 rounded-xl px-4 py-3">
                        <span className="material-symbols-outlined text-[18px] text-green-600">check_circle</span>
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Itinerary */}
              {cityStays.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">route</span>
                    مسار الرحلة
                  </h2>
                  <div className="flex flex-col">
                    {cityStays.map((stay, i) => (
                      <div key={i} className="flex gap-4">
                        {/* Timeline marker */}
                        <div className="flex flex-col items-center">
                          <div className="w-8 h-8 rounded-full bg-primary text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                            {i + 1}
                          </div>
                          {i < cityStays.length - 1 && <div className="w-px flex-grow bg-gray-200 my-1" />}
                        </div>
                        <div className={`flex-grow ${i < cityStays.length - 1 ? "pb-6" : ""}`}>
                          <p className="font-bold text-gray-800">
                            {stay.cityName || "مدينة"}
                            {stay.countryName && <span className="text-gray-400 text-sm font-medium"> · {stay.countryName}</span>}
                          </p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {stay.nights ? (
                              <span className="flex items-center gap-1 bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">dark_mode</span>
                                {stay.nights} {stay.nights > 2 ? "ليالي" : stay.nights === 2 ? "ليلتان" : "ليلة"}
                              </span>
                            ) : null}
                            {stay.hotelCategory && (
                              <span className="flex items-center gap-1 bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">hotel</span>
                                فندق {hotelLabel(stay.hotelCategory)}
                              </span>
                            )}
                            {stay.transportFromPrevious && (
                              <span className="flex items-center gap-1 bg-primary/5 text-primary text-xs font-bold px-3 py-1.5 rounded-full">
                                <span className="material-symbols-outlined text-[14px]">directions_bus</span>
                                {transportLabel(stay.transportFromPrevious)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Flights */}
              {(pkg.departingFlight || pkg.returningFlight) && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-primary mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">flight</span>
                    رحلات الطيران
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {pkg.departingFlight && (
                      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <p className="text-xs font-bold text-secondary mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">flight_takeoff</span>
                          رحلة الذهاب
                        </p>
                        <p className="font-bold text-gray-800 text-sm">{pkg.departingFlight.airWayName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {pkg.departingFlight.departedAirport?.city?.name} ← {pkg.departingFlight.arrivalAirport?.city?.name}
                        </p>
                      </div>
                    )}
                    {pkg.returningFlight && (
                      <div className="border border-gray-100 rounded-xl p-4 bg-gray-50/50">
                        <p className="text-xs font-bold text-secondary mb-2 flex items-center gap-1">
                          <span className="material-symbols-outlined text-[16px]">flight_land</span>
                          رحلة العودة
                        </p>
                        <p className="font-bold text-gray-800 text-sm">{pkg.returningFlight.airWayName}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {pkg.returningFlight.departedAirport?.city?.name} ← {pkg.returningFlight.arrivalAirport?.city?.name}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Includes */}
              {pkg.includesText && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-black text-primary mb-3 flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary">inventory_2</span>
                    الباقة تشمل
                  </h2>
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{pkg.includesText}</p>
                </div>
              )}
            </div>

            {/* Price / booking column */}
            <div className="lg:col-span-1">
              <div className="sticky top-6 bg-white rounded-2xl border border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.06)] p-6">
                <div className="flex items-end gap-2 mb-1">
                  <span className="text-3xl font-black text-primary">{Number(pkg.pricing).toLocaleString("en-US")}</span>
                  <span className="text-primary font-bold mb-1">ريال</span>
                  {pkg.originalPricing && pkg.originalPricing > pkg.pricing && (
                    <span className="text-gray-400 line-through text-sm mb-1.5">
                      {Number(pkg.originalPricing).toLocaleString("en-US")}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-4">للشخص الواحد · شامل الضريبة</p>

                <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3 mb-5">
                  <span className="material-symbols-outlined text-[18px] text-gray-400">schedule</span>
                  مدة الرحلة: <span className="font-bold">{pkg.days}</span>
                </div>

                <button
                  onClick={() => setShowBookingForm(true)}
                  className="gold-shimmer w-full bg-primary text-white py-3.5 rounded-xl font-bold text-sm cursor-pointer transition-all hover:bg-primary/90 flex items-center justify-center gap-2 shadow-md shadow-primary/30"
                >
                  <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
                  احجز هذه الباقة
                </button>

                <Link
                  href="/booking/wizard"
                  className="mt-3 w-full border border-gray-200 text-gray-700 hover:bg-gray-50 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-[18px]">tune</span>
                  أو صمم باقتك بنفسك
                </Link>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* ─── Booking Modal ────────────────────────────────────────── */}
      {showBookingForm && pkg && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-200 text-right animate-zoom-in" dir="rtl">
            {bookingSuccess ? (
              <div className="text-center py-4">
                <span className="material-symbols-outlined text-6xl text-green-500 mb-4">check_circle</span>
                <h3 className="text-xl font-bold text-primary mb-2">تم إرسال طلب الحجز بنجاح!</h3>
                <p className="text-sm text-slate-600 mb-6">سنتواصل معك قريباً لتأكيد حجز باقة «{pkg.name}».</p>
                <div className="flex gap-3">
                  <Link href="/booking" className="flex-1 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm transition-all hover:bg-primary/90">
                    حجوزاتي
                  </Link>
                  <button
                    onClick={() => { setShowBookingForm(false); setBookingSuccess(false); }}
                    className="flex-1 border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all"
                  >
                    إغلاق
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h3 className="text-xl font-bold text-primary mb-1 flex items-center gap-2">
                  <span className="material-symbols-outlined text-secondary">edit_calendar</span>
                  حجز باقة «{pkg.name}»
                </h3>
                <p className="text-sm text-slate-600 mb-6">
                  أدخل بياناتك وتواريخ رحلتك وسنتواصل معك لتأكيد الحجز.
                </p>

                {bookingError && (
                  <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold mb-4">
                    {bookingError}
                  </div>
                )}

                <form onSubmit={submitBooking} className="space-y-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-secondary font-bold">الاسم بالكامل</label>
                    <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm" placeholder="مثال: محمد أحمد" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-secondary font-bold">رقم الجوال</label>
                    <input type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm text-left" placeholder="05xxxxxxxx" dir="ltr" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-secondary font-bold">تاريخ الذهاب</label>
                      <input type="date" required value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm" />
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-secondary font-bold">تاريخ العودة</label>
                      <input type="date" required value={endDate} min={startDate || undefined} onChange={(e) => setEndDate(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm" />
                    </div>
                  </div>
                  <div className="pt-4 flex justify-between gap-4">
                    <button type="button" onClick={() => setShowBookingForm(false)} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all flex-1">
                      إلغاء
                    </button>
                    <button type="submit" disabled={isSubmitting} className="gold-shimmer bg-primary text-background px-6 py-3 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 transition-all flex-1 flex items-center justify-center gap-2">
                      {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
