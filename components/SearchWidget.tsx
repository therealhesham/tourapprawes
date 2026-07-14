"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Icon from "@/components/Icon";

interface City {
  id: string;
  name: string;
}

export default function SearchWidget() {
  const router = useRouter();

  // States
  const [destination, setDestination] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [budget, setBudget] = useState(20000);
  const [cities, setCities] = useState<City[]>([]);
  const [showDestinationDropdown, setShowDestinationDropdown] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showBudgetPicker, setShowBudgetPicker] = useState(false);

  const destRef = useRef<HTMLDivElement>(null);
  const dateRef = useRef<HTMLDivElement>(null);
  const budgetRef = useRef<HTMLDivElement>(null);

  // Fetch cities
  useEffect(() => {
    fetch("/api/admin/cities")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const flattened: City[] = data.flatMap((dest: any) =>
            dest.countries.flatMap((c: any) =>
              c.cities.map((city: any) => ({ id: city.id, name: city.name }))
            )
          );
          setCities(flattened);
        }
      })
      .catch(() => {});
  }, []);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (destRef.current && !destRef.current.contains(e.target as Node)) {
        setShowDestinationDropdown(false);
      }
      if (dateRef.current && !dateRef.current.contains(e.target as Node)) {
        setShowDatePicker(false);
      }
      if (budgetRef.current && !budgetRef.current.contains(e.target as Node)) {
        setShowBudgetPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const filteredCities = cities.filter(
    (c) =>
      !destination ||
      c.name.toLowerCase().includes(destination.toLowerCase())
  );

  const formatBudget = (v: number) =>
    v >= 1000 ? `${(v / 1000).toFixed(0)}k` : `${v}`;

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (destination) params.set("destination", destination);
    if (fromDate) params.set("from", fromDate);
    if (toDate) params.set("to", toDate);
    params.set("budget", String(budget));
    router.push(`/packages?${params.toString()}`);
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="max-w-[1000px] mx-auto bg-white/95 backdrop-blur-md rounded-3xl md:rounded-full shadow-[0_20px_50px_rgba(12,17,32,0.15)] border border-white/80 p-3 flex flex-col md:flex-row items-center gap-2 md:gap-0 transition-all duration-300 hover:shadow-[0_25px_60px_rgba(12,17,32,0.2)]">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100 md:divide-x-reverse">

        {/* ─── Destination ─────────────────────────────────────────── */}
        <div ref={destRef} className="relative px-6 py-3">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-slate-50/80 rounded-full p-2 transition-all duration-200"
            onClick={() => {
              setShowDestinationDropdown((v) => !v);
              setShowDatePicker(false);
              setShowBudgetPicker(false);
            }}
          >
            <div className="flex-1">
              <p className="text-xs font-bold text-slate-400 mb-1">وجهة السفر</p>
              <input
                type="text"
                value={destination}
                onChange={(e) => {
                  setDestination(e.target.value);
                  setShowDestinationDropdown(true);
                }}
                onClick={(e) => {
                  e.stopPropagation();
                  setShowDestinationDropdown(true);
                  setShowDatePicker(false);
                  setShowBudgetPicker(false);
                }}
                placeholder="أين وجهتك القادمة؟"
                className="text-sm font-bold text-primary bg-transparent border-none outline-none ring-0 shadow-none appearance-none w-full p-0 placeholder:font-bold placeholder:text-primary/70 focus:outline-none focus:ring-0 focus:border-none"
              />
            </div>
            <Icon name="location_on" className="text-slate-400 text-xl mr-2 flex-shrink-0" />
          </div>

          {/* Destination Dropdown */}
          {showDestinationDropdown && (
            <div className="absolute top-full right-0 left-0 mt-3 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto transition-all">
              {filteredCities.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-400 text-center">
                  لا توجد نتائج
                </div>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className="w-full text-right px-5 py-3 text-sm font-medium text-slate-700 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3"
                    onClick={() => {
                      setDestination(city.name);
                      setShowDestinationDropdown(false);
                    }}
                  >
                    <Icon name="location_on" className="text-[16px] text-primary/50" />
                    {city.name}
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        {/* ─── Dates ───────────────────────────────────────────────── */}
        <div ref={dateRef} className="relative px-6 py-3">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-slate-50/80 rounded-full p-2 transition-all duration-200"
            onClick={() => {
              setShowDatePicker((v) => !v);
              setShowDestinationDropdown(false);
              setShowBudgetPicker(false);
            }}
          >
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">التواريخ</p>
              <p className="text-sm font-bold text-primary">
                {fromDate && toDate
                  ? `${fromDate} → ${toDate}`
                  : fromDate
                  ? `من ${fromDate}`
                  : "متى تخطط للسفر؟"}
              </p>
            </div>
            <Icon name="calendar_month" className="text-slate-400 text-xl mr-2 flex-shrink-0" />
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div
              className="absolute top-full right-0 mt-3 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl p-5 min-w-[300px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">
                    تاريخ المغادرة
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={fromDate}
                    onChange={(e) => {
                      setFromDate(e.target.value);
                      if (toDate && e.target.value > toDate) setToDate("");
                    }}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 block mb-1">
                    تاريخ العودة
                  </label>
                  <input
                    type="date"
                    min={fromDate || today}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl px-4 py-2 text-sm font-medium text-slate-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary/95 transition-colors cursor-pointer"
                >
                  تأكيد
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ─── Budget ──────────────────────────────────────────────── */}
        <div ref={budgetRef} className="relative px-6 py-3">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-slate-50/80 rounded-full p-2 transition-all duration-200"
            onClick={() => {
              setShowBudgetPicker((v) => !v);
              setShowDestinationDropdown(false);
              setShowDatePicker(false);
            }}
          >
            <div>
              <p className="text-xs font-bold text-slate-400 mb-1">الميزانية</p>
              <p className="text-sm font-bold text-primary">
                حتى {budget.toLocaleString("ar-SA")} ريال
              </p>
            </div>
            <Icon name="account_balance_wallet" className="text-slate-400 text-xl mr-2 flex-shrink-0" />
          </div>

          {/* Budget Picker Dropdown */}
          {showBudgetPicker && (
            <div
              className="absolute top-full right-0 mt-3 z-50 bg-white border border-slate-100 rounded-2xl shadow-2xl p-5 min-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-bold text-slate-400 mb-3">
                الحد الأقصى للميزانية
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-slate-400">0 ريال</span>
                <span className="text-sm font-black text-primary">
                  {budget.toLocaleString("ar-SA")} ريال
                </span>
                <span className="text-xs text-slate-400">100k ريال</span>
              </div>
              <input
                type="range"
                min={1000}
                max={100000}
                step={1000}
                value={budget}
                onChange={(e) => setBudget(Number(e.target.value))}
                className="w-full accent-primary h-1.5 rounded-full cursor-pointer"
                style={{
                  background: `linear-gradient(to left, #e5e7eb ${100 - ((budget - 1000) / 99000) * 100}%, #1C00C6 ${100 - ((budget - 1000) / 99000) * 100}%)`,
                }}
              />
              <div className="flex flex-wrap gap-2 mt-4">
                {[5000, 10000, 20000, 50000].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBudget(v)}
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors cursor-pointer ${
                      budget === v
                        ? "bg-primary text-white border-primary"
                        : "border-slate-200 text-slate-500 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {formatBudget(v)} ريال
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowBudgetPicker(false)}
                className="w-full mt-4 bg-primary text-white rounded-xl py-2.5 text-sm font-bold hover:bg-primary/95 transition-colors cursor-pointer"
              >
                تأكيد
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Search Button ───────────────────────────────────────────── */}
      <button
        onClick={handleSearch}
        className="mt-2 md:mt-0 w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/95 active:scale-95 transition-all shadow-lg shadow-primary/30 cursor-pointer"
      >
        <Icon name="search" />
        بحث
      </button>
    </div>
  );
}
