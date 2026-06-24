"use client";

import { useState } from "react";
import Image from "next/image";
import BookingWizard from "./components/BookingWizard";
import {
  continents,
  countries as allCountries,
  hotelCategories,
  mockPackages,
  type TourPackage,
} from "./data/mockData";

export default function BookingPage() {
  const [filterCountry, setFilterCountry] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterDuration, setFilterDuration] = useState("");
  const [filterPrice, setFilterPrice] = useState("");
  const [showWizard, setShowWizard] = useState(false);

  const flatCountries = Object.values(allCountries).flat();

  const filteredPackages = mockPackages.filter((pkg) => {
    if (filterCountry && pkg.country !== filterCountry) return false;
    if (filterCategory && pkg.category !== filterCategory) return false;

    if (filterDuration) {
      if (filterDuration === "short" && pkg.duration > 5) return false;
      if (filterDuration === "medium" && (pkg.duration < 6 || pkg.duration > 9)) return false;
      if (filterDuration === "long" && pkg.duration < 10) return false;
    }

    if (filterPrice) {
      if (filterPrice === "low" && pkg.price > 5000) return false;
      if (filterPrice === "medium" && (pkg.price <= 5000 || pkg.price > 8000)) return false;
      if (filterPrice === "high" && pkg.price <= 8000) return false;
    }

    return true;
  });

  return (
    <>
      {/* ─── Navigation ─── */}
      <header className="fixed top-0 inset-x-0 z-40 transition-all duration-500 bg-primary/95 backdrop-blur-md border-b border-white/10">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-container-max mx-auto">
          <a href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={160}
              height={55}
              className="h-12 md:h-16 w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
            />
          </a>
          <nav className="flex items-center gap-6">
            <a href="/" className="font-bold text-base md:text-lg tracking-widest uppercase text-white/75 hover:text-white transition-colors">
              الرئيسية
            </a>
            <button
              onClick={() => setShowWizard(true)}
              className="gold-shimmer bg-primary text-background px-5 py-2 rounded-full font-bold text-sm btn-glow"
            >
              صمم رحلتك المخصصة
            </button>
          </nav>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="relative min-h-screen pt-32 pb-20 overflow-hidden bg-background">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <Image
            alt="Luxury Travel Destinations"
            src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1920&q=80"
            fill
            className="object-cover opacity-20 grayscale-30"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-white/95 via-background/90 to-background" />
        </div>

        {/* Orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[150px] opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4a017, transparent 70%)" }}
        />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-[150px] opacity-10 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c9a84c, transparent 70%)" }}
        />

        <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">


          {/* ─── Search Widget ─── */}
          <section className="mb-14" dir="rtl">
            <div className="glass-panel rounded-2xl shadow-xl border border-outline-variant/30 p-6 md:p-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {/* Country */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                    الدولة
                  </label>
                  <select
                    value={filterCountry}
                    onChange={(e) => setFilterCountry(e.target.value)}
                    className="w-full py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:border-secondary outline-none text-sm transition-all"
                  >
                    <option value="">جميع الدول</option>
                    {flatCountries.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Category */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                    التصنيف
                  </label>
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:border-secondary outline-none text-sm transition-all"
                  >
                    <option value="">جميع التصنيفات</option>
                    {hotelCategories.filter(h => h.id !== "auto").map((h) => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                    المدة
                  </label>
                  <select
                    value={filterDuration}
                    onChange={(e) => setFilterDuration(e.target.value)}
                    className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:border-secondary outline-none text-sm transition-all"
                  >
                    <option value="">أي مدة</option>
                    <option value="short">رحلة قصيرة (≤ 5 أيام)</option>
                    <option value="medium">رحلة متوسطة (6 - 9 أيام)</option>
                    <option value="long">رحلة طويلة (≥ 10 أيام)</option>
                  </select>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs text-secondary font-bold uppercase tracking-wider">
                    الميزانية (SAR)
                  </label>
                  <select
                    value={filterPrice}
                    onChange={(e) => setFilterPrice(e.target.value)}
                    className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl text-on-surface focus:border-secondary outline-none text-sm transition-all"
                  >
                    <option value="">جميع الميزانيات</option>
                    <option value="low">اقتصادية (≤ 5,000)</option>
                    <option value="medium">متوسطة (5,000 - 8,000)</option>
                    <option value="high">فاخرة VIP (≥ 8,000)</option>
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* ─── Packages Display Section ─── */}
          <section className="w-full">
            {filteredPackages.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8" dir="rtl">
                {filteredPackages.map((pkg) => (
                  <article
                    key={pkg.id}
                    className="card-hover group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] shadow-2xl border border-white/10 transition-all duration-500"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt={pkg.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                      src={pkg.image}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/30" />

                    {/* Layout contents */}
                    <div className="absolute inset-0 p-6 z-10 flex flex-col justify-between" dir="ltr">
                      {/* Top Info */}
                      <div className="flex justify-between items-start">
                        <div className="text-left text-shadow-subtle">
                          <span className="text-xl font-extrabold text-white tracking-wide block uppercase">
                            {pkg.continent}
                          </span>
                          <span className="text-xs font-semibold text-secondary-bright">
                            {pkg.country.toUpperCase()}
                          </span>
                        </div>
                        <div className="glass-dark text-white/90 px-3 py-1 rounded-full text-xs font-bold border border-white/20">
                          {pkg.duration} أيام
                        </div>
                      </div>

                      {/* Bottom Info */}
                      <div className="text-right text-shadow-strong space-y-2">
                        <span className="block text-xs font-bold text-white/60 uppercase tracking-widest">
                          {hotelCategories.find(h => h.id === pkg.category)?.name || pkg.category}
                        </span>
                        <h3 className="text-lg font-bold text-white leading-tight">
                          {pkg.title}
                        </h3>
                        <div className="flex justify-between items-end pt-2">
                          <button
                            onClick={() => alert(`تم تحديد حجز ${pkg.title}!`)}
                            className="bg-white/10 hover:bg-white/20 text-white w-9 h-9 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 transform group-hover:scale-110"
                          >
                            <span className="material-symbols-outlined text-base">arrow_forward</span>
                          </button>
                          <span className="block text-2xl font-black text-white tracking-tight">
                            {pkg.price.toLocaleString()} <span className="text-xs font-normal text-secondary-bright">SAR</span>
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              /* ─── Create Your Own Trip (No Results) ─── */
              <div className="text-center py-16 px-6 glass-panel rounded-3xl border border-outline-variant/30 max-w-2xl mx-auto animate-fade-in-up" dir="rtl">
                <span className="material-symbols-outlined text-6xl text-secondary mb-4 animate-bounce">
                  travel_explore
                </span>
                <h3 className="text-2xl font-bold text-primary mb-3">
                  لم نجد عروضاً تطابق خيارات بحثك الحالية
                </h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  لا تقلق، يمكنك تصميم رحلتك المخصصة تماماً بالمدينة والفنادق وخط السير المناسب لك بكامل الحرية وبثوانٍ معدودة!
                </p>
                <button
                  onClick={() => setShowWizard(true)}
                  className="gold-shimmer bg-primary text-background px-10 py-4 rounded-full font-bold text-lg uppercase tracking-widest btn-glow transition-all"
                >
                  صمم رحلتك بنفسك الآن
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ─── Wizard Overlay / Modal ─── */}
      {showWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-4xl my-8 animate-zoom-in">
            <BookingWizard onClose={() => setShowWizard(false)} />
          </div>
        </div>
      )}
    </>
  );
}
