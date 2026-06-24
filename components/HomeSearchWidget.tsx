"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function HomeSearchWidget() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (duration) params.set("duration", duration);
    if (price) params.set("price", price);

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <section className="relative z-30 -mt-36 md:-mt-44 px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto">
        <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/60">
          {/* Top accent bar */}
          <div className="h-1 w-full bg-gradient-to-l from-secondary-bright via-secondary to-secondary-bright/50" />

          <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end">
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full flex-grow text-right" dir="rtl">
              {/* Destination */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                  <span className="material-symbols-outlined text-base text-secondary">
                    location_on
                  </span>
                  الوجهة
                </label>
                <div className="relative">
                  <select
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    className="w-full py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none "
                  >
                    <option value="">جميع الوجهات</option>
                    <option value="malaysia">ماليزيا</option>
                    <option value="maldives">المالديف</option>
                    <option value="thailand">تايلاند</option>
                    <option value="bosnia">البوسنة</option>
                    <option value="albania">ألبانيا</option>
                    <option value="georgia">جورجيا</option>
                    <option value="egypt">مصر</option>
                    <option value="morocco">المغرب</option>
                  </select>
                </div>
              </div>

              {/* Duration */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                  <span className="material-symbols-outlined text-base text-secondary">
                    calendar_month
                  </span>
                  المدة
                </label>
                <div className="relative">
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none "
                  >
                    <option value="">أي مدة</option>
                    <option value="short">رحلة قصيرة (≤ 5 أيام)</option>
                    <option value="medium">رحلة متوسطة (6 - 9 أيام)</option>
                    <option value="long">رحلة طويلة (≥ 10 أيام)</option>
                  </select>
                </div>
              </div>

              {/* Price */}
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider font-bold">
                  <span className="material-symbols-outlined text-base text-secondary">
                    payments
                  </span>
                  الميزانية (SAR)
                </label>
                <div className="relative">
                  <select
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full py-3 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none "
                  >
                    <option value="">جميع الميزانيات</option>
                    <option value="low">اقتصادية (≤ 5,000)</option>
                    <option value="medium">متوسطة (5,000 - 8,000)</option>
                    <option value="high">فاخرة VIP (≥ 8,000)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Search button */}
            <button
              onClick={handleSearch}
              className="gold-shimmer w-full md:w-auto bg-gradient-to-l from-primary to-primary/80 text-on-primary px-10 py-3.5 rounded-xl font-label-sm text-label-sm uppercase tracking-widest whitespace-nowrap btn-glow border border-white/10 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm">search</span>
              البحث عن رحلة
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
