"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

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
    <div className="max-w-[1000px] mx-auto bg-white rounded-full shadow-[0_10px_40px_rgba(28,0,198,0.1)] border border-gray-100 p-3 flex flex-col md:flex-row items-center gap-2 md:gap-0">
      <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 md:divide-x-reverse">

        {/* ─── Destination ─────────────────────────────────────────── */}
        <div ref={destRef} className="relative px-6 py-3">
          <div
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => {
              setShowDestinationDropdown((v) => !v);
              setShowDatePicker(false);
              setShowBudgetPicker(false);
            }}
          >
            <div className="flex-1">
              <p className="text-xs font-bold text-gray-400 mb-1">وجهة السفر</p>
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
                className="text-sm font-bold text-primary bg-transparent border-none outline-none ring-0 shadow-none appearance-none w-full p-0 placeholder:font-bold placeholder:text-primary focus:outline-none focus:ring-0 focus:border-none"
              />
            </div>
            <span className="material-symbols-outlined text-gray-400 text-xl mr-2 flex-shrink-0">
              location_on
            </span>
          </div>

          {/* Destination Dropdown */}
          {showDestinationDropdown && (
            <div className="absolute top-full right-0 left-0 mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl overflow-hidden max-h-56 overflow-y-auto">
              {filteredCities.length === 0 ? (
                <div className="px-4 py-3 text-sm text-gray-400 text-center">
                  لا توجد نتائج
                </div>
              ) : (
                filteredCities.map((city) => (
                  <button
                    key={city.id}
                    type="button"
                    className="w-full text-right px-5 py-3 text-sm font-medium text-gray-700 hover:bg-primary/5 hover:text-primary transition-colors flex items-center gap-3"
                    onClick={() => {
                      setDestination(city.name);
                      setShowDestinationDropdown(false);
                    }}
                  >
                    <span className="material-symbols-outlined text-[16px] text-primary/50">
                      location_on
                    </span>
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
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => {
              setShowDatePicker((v) => !v);
              setShowDestinationDropdown(false);
              setShowBudgetPicker(false);
            }}
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">التواريخ</p>
              <p className="text-sm font-bold text-primary">
                {fromDate && toDate
                  ? `${fromDate} → ${toDate}`
                  : fromDate
                  ? `من ${fromDate}`
                  : "متى تخطط للسفر؟"}
              </p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-xl mr-2 flex-shrink-0">
              calendar_month
            </span>
          </div>

          {/* Date Picker Dropdown */}
          {showDatePicker && (
            <div
              className="absolute top-full right-0 mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-5 min-w-[300px]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">
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
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-gray-400 block mb-1">
                    تاريخ العودة
                  </label>
                  <input
                    type="date"
                    min={fromDate || today}
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium text-gray-700 outline-none focus:border-primary focus:ring-2 focus:ring-primary/10 transition"
                  />
                </div>
                <button
                  onClick={() => setShowDatePicker(false)}
                  className="w-full bg-primary text-white rounded-xl py-2 text-sm font-bold hover:bg-primary/90 transition-colors"
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
            className="flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors"
            onClick={() => {
              setShowBudgetPicker((v) => !v);
              setShowDestinationDropdown(false);
              setShowDatePicker(false);
            }}
          >
            <div>
              <p className="text-xs font-bold text-gray-400 mb-1">الميزانية</p>
              <p className="text-sm font-bold text-primary">
                حتى {budget.toLocaleString("ar-SA")} ريال
              </p>
            </div>
            <span className="material-symbols-outlined text-gray-400 text-xl mr-2 flex-shrink-0">
              account_balance_wallet
            </span>
          </div>

          {/* Budget Picker Dropdown */}
          {showBudgetPicker && (
            <div
              className="absolute top-full right-0 mt-2 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-5 min-w-[280px]"
              onClick={(e) => e.stopPropagation()}
            >
              <p className="text-xs font-bold text-gray-400 mb-3">
                الحد الأقصى للميزانية
              </p>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">0 ريال</span>
                <span className="text-sm font-black text-primary">
                  {budget.toLocaleString("ar-SA")} ريال
                </span>
                <span className="text-xs text-gray-400">100k ريال</span>
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
                    className={`px-3 py-1 rounded-full text-xs font-bold border transition-colors ${
                      budget === v
                        ? "bg-primary text-white border-primary"
                        : "border-gray-200 text-gray-500 hover:border-primary hover:text-primary"
                    }`}
                  >
                    {formatBudget(v)} ريال
                  </button>
                ))}
              </div>
              <button
                onClick={() => setShowBudgetPicker(false)}
                className="w-full mt-4 bg-primary text-white rounded-xl py-2 text-sm font-bold hover:bg-primary/90 transition-colors"
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
        className="mt-2 md:mt-0 w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all shadow-lg shadow-primary/30"
      >
        <span className="material-symbols-outlined">search</span>
        بحث
      </button>
    </div>
  );
}
