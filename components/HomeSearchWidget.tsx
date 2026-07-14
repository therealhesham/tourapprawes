"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

export default function HomeSearchWidget() {
  const router = useRouter();
  const [country, setCountry] = useState("");
  const [duration, setDuration] = useState("");
  const [price, setPrice] = useState("");
  const [dbCountries, setDbCountries] = useState<{ id: string; name: string }[]>([]);

  useEffect(() => {
    fetch("/api/admin/cities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const flattened = data.flatMap((dest: any) =>
            dest.countries.map((c: any) => ({ id: c.id, name: c.name }))
          );
          setDbCountries(flattened);
        }
      })
      .catch((err) => console.error("Error loading countries:", err));
  }, []);

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (duration) params.set("duration", duration);
    if (price) params.set("price", price);

    router.push(`/booking?${params.toString()}`);
  };

  return (
    <div className="p-6 md:p-8" dir="rtl">
      <div className="flex flex-col md:flex-row gap-5 items-end">
        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full flex-grow text-right">
          {/* Destination */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Icon name="location_on" className="text-base text-primary" />
              الوجهة
            </label>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all cursor-pointer outline-none font-medium"
              style={{ appearance: "none" }}
            >
              <option value="">جميع الوجهات</option>
              {dbCountries.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Duration */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Icon name="calendar_month" className="text-base text-primary" />
              المدة
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all cursor-pointer outline-none font-medium"
              style={{ appearance: "none" }}
            >
              <option value="">أي مدة</option>
              <option value="short">رحلة قصيرة (≤ 5 أيام)</option>
              <option value="medium">رحلة متوسطة (6 - 9 أيام)</option>
              <option value="long">رحلة طويلة (≥ 10 أيام)</option>
            </select>
          </div>

          {/* Price */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
              <Icon name="payments" className="text-base text-primary" />
              الميزانية (SAR)
            </label>
            <select
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-700 transition-all cursor-pointer outline-none font-medium"
              style={{ appearance: "none" }}
            >
              <option value="">جميع الميزانيات</option>
              <option value="low">اقتصادية (≤ 5,000)</option>
              <option value="medium">متوسطة (5,000 - 8,000)</option>
              <option value="high">فاخرة VIP (≥ 8,000)</option>
            </select>
          </div>
        </div>

        {/* Search button */}
        <button
          onClick={handleSearch}
          className="bg-primary text-white py-3 px-6 rounded-xl text-sm font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 mt-4 md:mt-0 w-full md:w-auto"
          style={{ minWidth: "150px" }}
        >
          <Icon name="search" className="text-lg" />
          البحث عن رحلة
        </button>
      </div>
    </div>
  );
}
