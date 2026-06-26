"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";

interface Option {
  value: string;
  label: string;
}

interface ElegantSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: Option[];
  placeholder: string;
  icon: string;
  label: string;
  disabled?: boolean;
}

function ElegantSelect({ value, onChange, options, placeholder, icon, label, disabled = false }: ElegantSelectProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {isOpen && !disabled && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
      <div
        className={`w-full bg-surface-variant/50 rounded-xl px-4 py-3 border transition-all relative z-50 ${disabled ? 'opacity-60 cursor-not-allowed border-outline-variant/20' : 'cursor-pointer hover:border-secondary/50'} ${isOpen && !disabled ? 'border-secondary shadow-md bg-surface' : 'border-outline-variant/30'}`}
        onClick={() => { if (!disabled) setIsOpen(!isOpen); }}
      >
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined transition-colors ${isOpen && !disabled ? 'text-secondary' : 'text-outline'}`}>{icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</p>
            <div className="flex justify-between items-center text-sm text-on-surface mt-0.5">
              <span className={!value ? "text-outline" : "font-medium"}>
                {value ? options.find(o => o.value === value)?.label : placeholder}
              </span>
              <span className={`material-symbols-outlined text-outline text-lg transition-transform duration-300 ${isOpen && !disabled ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
            </div>
          </div>
        </div>

        {isOpen && !disabled && (
          <div className="absolute top-[calc(100%+8px)] right-0 w-full min-w-[200px] bg-surface border border-outline-variant/20 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] overflow-hidden animate-fade-in-up origin-top max-h-60 overflow-y-auto">
            {options.length > 0 ? options.map(opt => (
              <div
                key={opt.value}
                className={`px-4 py-3.5 text-sm transition-colors cursor-pointer border-b border-outline-variant/10 last:border-0 ${value === opt.value ? 'bg-secondary/10 text-secondary font-bold' : 'text-on-surface hover:bg-surface-variant hover:text-secondary'}`}
                onClick={(e) => { e.stopPropagation(); onChange(opt.value); setIsOpen(false); }}
              >
                {opt.label}
              </div>
            )) : (
              <div className="px-4 py-3.5 text-sm text-outline-variant text-center">لا توجد خيارات متاحة</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function ElegantDatePicker({ label, icon }: { label: string, icon: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const formatDisplay = () => {
    if (fromDate && toDate) return `${fromDate} إلى ${toDate}`;
    if (fromDate) return `من ${fromDate}`;
    return "حدد التواريخ";
  };

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)}></div>}
      <div
        className={`w-full bg-surface-variant/50 rounded-xl px-4 py-3 border transition-all relative z-50 cursor-pointer hover:border-secondary/50 ${isOpen ? 'border-secondary shadow-md bg-surface' : 'border-outline-variant/30'}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex items-center gap-3">
          <span className={`material-symbols-outlined transition-colors ${isOpen ? 'text-secondary' : 'text-outline'}`}>{icon}</span>
          <div className="flex-1">
            <p className="text-[10px] font-bold text-on-surface-variant uppercase">{label}</p>
            <div className="flex justify-between items-center text-sm text-on-surface mt-0.5">
              <span className={!(fromDate || toDate) ? "text-outline" : "font-medium"}>
                {formatDisplay()}
              </span>
              <span className={`material-symbols-outlined text-outline text-lg transition-transform duration-300 ${isOpen ? 'rotate-180 text-secondary' : ''}`}>expand_more</span>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 md:left-auto md:translate-x-0 md:right-0 w-[calc(100vw-48px)] md:w-[320px] p-5 bg-surface border border-outline-variant/20 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up origin-top cursor-default" onClick={e => e.stopPropagation()}>
            <div className="flex flex-col gap-5">
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">تاريخ المغادرة</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-lg py-2.5 px-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-on-surface transition-colors cursor-pointer"
                    value={fromDate}
                    onChange={e => setFromDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <div>
                <label className="text-xs font-bold text-on-surface-variant mb-2 block">تاريخ العودة</label>
                <div className="relative">
                  <input
                    type="date"
                    className="w-full bg-surface-variant/30 border border-outline-variant/30 rounded-lg py-2.5 px-3 text-sm focus:border-secondary focus:ring-1 focus:ring-secondary outline-none text-on-surface transition-colors cursor-pointer"
                    value={toDate}
                    onChange={e => setToDate(e.target.value)}
                    min={fromDate || new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setIsOpen(false); }}
                className="w-full bg-primary text-background py-3 rounded-lg text-sm font-bold mt-2 hover:shadow-md transition-all cursor-pointer btn-glow"
              >
                تأكيد التواريخ
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default function PackagesPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  // Form State
  const [country, setCountry] = useState("");
  const [destination, setDestination] = useState("");
  const [hotelStars, setHotelStars] = useState("");
  const [programType, setProgramType] = useState("");

  // DB Packages & UI filters states
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedRegions, setSelectedRegions] = useState<string[]>([]);
  const [maxPrice, setMaxPrice] = useState(20000);
  const [selectedRatings, setSelectedRatings] = useState<number[]>([]);
  const [sortBy, setSortBy] = useState("price_asc");
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  const [selectedPackageToBook, setSelectedPackageToBook] = useState<any | null>(null);
  const [dbCities, setDbCities] = useState<any[]>([]);

  // Booking Form States
  const [bookingClientName, setBookingClientName] = useState("");
  const [bookingClientPhone, setBookingClientPhone] = useState("");
  const [bookingStartDate, setBookingStartDate] = useState("");
  const [bookingEndDate, setBookingEndDate] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingMessage, setBookingMessage] = useState("");
  const [bookingErrorMsg, setBookingErrorMsg] = useState("");

  useEffect(() => {
    setLoading(true);

    // Load packages
    const loadPkgs = fetch("/api/packages")
      .then(res => res.json())
      .then(data => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          const formatted = data.map((pkg: any) => {
            let parsedFeatures = [];
            try {
              parsedFeatures = typeof pkg.features === "string"
                ? JSON.parse(pkg.features)
                : pkg.features;
            } catch (e) {
              console.error("Error parsing features:", e);
            }
            return {
              ...pkg,
              features: parsedFeatures,
              price: pkg.pricing.toLocaleString("en-US"),
              originalPrice: pkg.originalPricing ? pkg.originalPricing.toLocaleString("en-US") : null,
            };
          });
          setPackages(formatted);
        }
      })
      .catch(err => {
        console.error("Error loading packages:", err);
        setError("حدث خطأ أثناء تحميل الباقات.");
      });

    // Load cities to resolve IDs
    const loadCities = fetch("/api/admin/cities")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          const flattened = data.flatMap((dest: any) =>
            dest.countries.flatMap((c: any) => c.cities.map((city: any) => ({ id: city.id, name: city.name })))
          );
          setDbCities(flattened);
        }
      })
      .catch(err => console.error("Error loading cities in packages page:", err));

    Promise.all([loadPkgs, loadCities]).finally(() => setLoading(false));
  }, []);

  const getCityName = (cityId: string) => {
    return dbCities.find(c => c.id === cityId)?.name || cityId;
  };

  const handleBookSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookingClientName || !bookingClientPhone || !bookingStartDate || !bookingEndDate || !selectedPackageToBook) {
      setBookingErrorMsg("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setBookingLoading(true);
    setBookingErrorMsg("");
    setBookingMessage("");

    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName: bookingClientName,
          clientPhone: bookingClientPhone,
          startDate: bookingStartDate,
          endDate: bookingEndDate,
          departingFlightId: selectedPackageToBook.departingFlightId || null,
          returningFlightId: selectedPackageToBook.returningFlightId || null,
          pricing: Number(selectedPackageToBook.pricing),
          cityStays: selectedPackageToBook.cityStays || [],
          companyPackageId: selectedPackageToBook.id
        })
      });

      const data = await res.json();
      if (data.error) {
        setBookingErrorMsg(data.error);
      } else {
        setBookingMessage("تم تسجيل حجزك بنجاح! سيتواصل معك فريق خدمة العملاء قريباً.");
        setBookingClientName("");
        setBookingClientPhone("");
        setBookingStartDate("");
        setBookingEndDate("");
        setTimeout(() => {
          setSelectedPackageToBook(null);
          setBookingMessage("");
        }, 3000);
      }
    } catch (err) {
      setBookingErrorMsg("حدث خطأ أثناء إرسال طلب الحجز. يرجى المحاولة لاحقاً.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCountryChange = (val: string) => {
    setCountry(val);
    setDestination(""); // Reset destination when country changes
  };

  const countries = [
    { value: "id", label: "إندونيسيا" },
    { value: "mv", label: "المالديف" },
    { value: "eg", label: "مصر" },
    { value: "tr", label: "تركيا" },
    { value: "my", label: "ماليزيا" }
  ];

  const destinationsByCountry: Record<string, Option[]> = {
    id: [
      { value: "bali", label: "بالي" },
      { value: "jakarta", label: "جاكرتا" },
      { value: "lombok", label: "لومبوك" },
    ],
    mv: [
      { value: "male", label: "ماليه" },
      { value: "maafushi", label: "مافوشي" },
    ],
    eg: [
      { value: "elgouna", label: "الجونة" },
      { value: "sharm", label: "شرم الشيخ" },
      { value: "cairo", label: "القاهرة" },
      { value: "hurghada", label: "الغردقة" },
    ],
    tr: [
      { value: "istanbul", label: "إسطنبول" },
      { value: "antalya", label: "أنطاليا" },
      { value: "cappadocia", label: "كابادوكيا" },
    ],
    my: [
      { value: "kuala", label: "كوالالمبور" },
      { value: "langkawi", label: "لنكاوي" },
      { value: "penang", label: "بينانج" },
    ]
  };

  const destinationOptions = country ? destinationsByCountry[country] : [];

  const getRegionByCountryCode = (code?: string | null): string => {
    if (!code) return "";
    const lower = code.toLowerCase();
    if (lower === "id" || lower === "mv" || lower === "my") return "آسيا";
    if (lower === "tr") return "أوروبا";
    if (lower === "eg") return "أفريقيا";
    return "";
  };

  const filteredPackages = packages
    .filter((pkg) => {
      // 1. Country filter
      if (country && pkg.countryCode !== country) return false;
      // 2. Destination filter
      if (destination && pkg.destinationCode !== destination) return false;
      // 3. Hotel Stars filter
      if (hotelStars && pkg.rating < Number(hotelStars)) return false;
      // 4. Program Type filter
      if (programType) {
        const textToSearch = `${pkg.title} ${pkg.description} ${pkg.includesText}`.toLowerCase();
        if (programType === "family" && !textToSearch.includes("عائل")) return false;
        if (programType === "honeymoon" && !(textToSearch.includes("عسل") || textToSearch.includes("الهنيمون"))) return false;
        if (programType === "adventure" && !textToSearch.includes("مغامر")) return false;
        if (programType === "relax" && !(textToSearch.includes("استجمام") || textToSearch.includes("هدوء") || textToSearch.includes("شواطئ"))) return false;
      }
      // 5. Region filter
      if (selectedRegions.length > 0) {
        const reg = getRegionByCountryCode(pkg.countryCode);
        if (!selectedRegions.includes(reg)) return false;
      }
      // 6. Rating filter
      if (selectedRatings.length > 0 && !selectedRatings.includes(pkg.rating)) return false;
      // 7. Max Price filter
      if (pkg.pricing > maxPrice) return false;

      return true;
    })
    .sort((a, b) => {
      if (sortBy === "price_asc") return a.pricing - b.pricing;
      if (sortBy === "price_desc") return b.pricing - a.pricing;
      if (sortBy === "rating_desc") return b.rating - a.rating;
      return 0;
    });

  return (
    <>
      <Navbar
        activeLinkId="destinations"
        primaryCtaText="صمم رحلتك"
        onPrimaryCtaClick={() => {
          window.location.href = "/booking?showWizard=true";
        }}
      />
      <main className="min-h-screen bg-background pb-20 font-body-md">

        {/* Search Header Banner */}
        <section className="bg-background pt-48 md:pt-56 pb-12 px-6 relative">
          <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
            <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary blur-3xl"></div>
          </div>
          <div className="w-full max-w-[var(--spacing-container-max)] mx-auto relative z-10">
            <h1 className="text-3xl md:text-4xl font-bold text-primary mb-8 text-center">ابحث عن رحلتك القادمة</h1>

            {/* Elegant Search Bar */}
            <div className="bg-surface p-4 md:p-6 rounded-2xl shadow-2xl w-full mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-6 gap-5 items-center relative z-20">

              {/* 1. Country (Elegant Dropdown) */}
              <div className="xl:col-span-1">
                <ElegantSelect
                  label="البلد"
                  icon="public"
                  placeholder="اختر البلد"
                  value={country}
                  onChange={handleCountryChange}
                  options={countries}
                />
              </div>

              {/* 2. Destination (Dependent Elegant Dropdown) */}
              <div className="xl:col-span-1">
                <ElegantSelect
                  label="الوجهة"
                  icon="location_on"
                  placeholder={country ? "اختر الوجهة" : "اختر البلد أولاً"}
                  value={destination}
                  onChange={setDestination}
                  options={destinationOptions}
                  disabled={!country}
                />
              </div>

              {/* 3. Date From and To */}
              <div className="xl:col-span-1 h-full">
                <ElegantDatePicker
                  label="التاريخ (من - إلى)"
                  icon="calendar_month"
                />
              </div>

              {/* 4. Hotel Stars (Elegant Dropdown) */}
              <div className="xl:col-span-1">
                <ElegantSelect
                  label="مستوى الفنادق"
                  icon="star"
                  placeholder="كم نجمة؟"
                  value={hotelStars}
                  onChange={setHotelStars}
                  options={[
                    { value: "3", label: "3 نجوم" },
                    { value: "4", label: "4 نجوم" },
                    { value: "5", label: "5 نجوم فاخرة" }
                  ]}
                />
              </div>

              {/* 5. Program Type (Elegant Dropdown) */}
              <div className="xl:col-span-1">
                <ElegantSelect
                  label=" البرنامج"
                  icon="category"
                  placeholder="نوع الرحلة"
                  value={programType}
                  onChange={setProgramType}
                  options={[
                    { value: "family", label: "عائلي" },
                    { value: "honeymoon", label: "شهر عسل" },
                    { value: "adventure", label: "مغامرات" },
                    { value: "relax", label: "استجمام" }
                  ]}
                />
              </div>

              {/* Search Button */}
              <button className="w-full h-[64px] bg-primary text-background px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all btn-glow gold-shimmer cursor-pointer xl:col-span-1 shadow-lg">
                <span className="material-symbols-outlined text-2xl">search</span>
                <span className="text-lg">بحث</span>
              </button>
            </div>
          </div>
        </section>

        <div className="max-w-[var(--spacing-container-max)] mx-auto px-4 md:px-6 mt-10 flex flex-col lg:flex-row gap-8">

          {/* Left Sidebar - Filters */}
          <aside className="w-full lg:w-1/4">
            {/* Mobile Filter Toggle Button */}
            <button
              onClick={() => setIsFiltersOpen(!isFiltersOpen)}
              className="lg:hidden w-full mb-4 bg-surface border border-outline-variant/30 text-primary py-3.5 px-6 rounded-2xl font-bold flex items-center justify-between shadow-sm cursor-pointer"
            >
              <span className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">tune</span>
                تصفية النتائج
              </span>
              <span className="material-symbols-outlined text-outline transition-transform duration-300">
                {isFiltersOpen ? "expand_less" : "expand_more"}
              </span>
            </button>

            {/* Collapsible Content */}
            <div className={`${isFiltersOpen ? "block" : "hidden"} lg:block bg-surface rounded-2xl border border-outline-variant/30 p-6 sticky top-24`}>
              <h3 className="hidden lg:flex font-bold text-lg mb-6 pb-4 border-b border-outline-variant/30 items-center gap-2">
                <span className="material-symbols-outlined text-secondary">tune</span>
                تصفية النتائج
              </h3>

              <div className="mb-8">
                <h4 className="font-bold text-sm mb-4">الوجهة</h4>
                <div className="space-y-3">
                  {["آسيا", "أوروبا", "الشرق الأوسط", "أفريقيا"].map((region) => (
                    <label key={region} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedRegions.includes(region)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRegions([...selectedRegions, region]);
                          } else {
                            setSelectedRegions(selectedRegions.filter(r => r !== region));
                          }
                        }}
                        className="rounded text-secondary focus:ring-secondary border-outline-variant/50 w-4 h-4 transition-colors cursor-pointer"
                      />
                      <span className="text-sm text-on-surface-variant group-hover:text-secondary transition-colors">{region}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-sm mb-4">السعر الأقصى</h4>
                <input
                  type="range"
                  min="1000"
                  max="20000"
                  step="500"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-secondary cursor-pointer"
                />
                <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                  <span>1,000 ر.س</span>
                  <span className="font-bold text-secondary">{maxPrice.toLocaleString("en-US")} ر.س</span>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="font-bold text-sm mb-4">التقييم</h4>
                <div className="space-y-3">
                  {[5, 4, 3].map((star) => (
                    <label key={star} className="flex items-center gap-3 cursor-pointer group">
                      <input
                        type="checkbox"
                        checked={selectedRatings.includes(star)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedRatings([...selectedRatings, star]);
                          } else {
                            setSelectedRatings(selectedRatings.filter(s => s !== star));
                          }
                        }}
                        className="rounded text-secondary focus:ring-secondary border-outline-variant/50 w-4 h-4 transition-colors cursor-pointer"
                      />
                      <div className="flex items-center text-secondary text-sm opacity-80 group-hover:opacity-100 transition-opacity">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <span key={i} className="material-symbols-outlined text-[16px]">
                            {i < star ? "star" : "star_rate"}
                          </span>
                        ))}
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content - Results */}
          <div className="flex-1">
            {/* Sorting Bar */}
            <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-outline-variant/30 mb-6 shadow-sm">
              <p className="text-sm font-medium text-on-surface">تم العثور على <span className="font-bold text-secondary">{filteredPackages.length}</span> باقات سفر</p>
              <div className="flex items-center gap-4">
                <div className="relative group hidden sm:block">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-transparent border-none text-sm text-on-surface-variant focus:ring-0 py-0 outline-none cursor-pointer appearance-none pr-6 font-medium"
                  >
                    <option value="price_asc">ترتيب حسب: الأقل سعراً</option>
                    <option value="price_desc">ترتيب حسب: الأعلى سعراً</option>
                    <option value="rating_desc">ترتيب حسب: الأكثر تقييماً</option>
                  </select>
                  <span className="material-symbols-outlined absolute top-1/2 right-0 -translate-y-1/2 text-[18px] text-outline pointer-events-none group-hover:text-secondary transition-colors">sort</span>
                </div>

                <div className="flex items-center bg-surface-variant rounded-lg p-1">
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${viewMode === "list" ? "bg-surface shadow-sm text-secondary" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    <span className="material-symbols-outlined text-sm">view_list</span>
                  </button>
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md flex items-center justify-center transition-colors cursor-pointer ${viewMode === "grid" ? "bg-surface shadow-sm text-secondary" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    <span className="material-symbols-outlined text-sm">grid_view</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Results List */}
            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : error ? (
              <div className="text-center py-20 text-red-500 font-bold">{error}</div>
            ) : filteredPackages.length === 0 ? (
              <div className="text-center py-20 text-slate-500 font-medium">لا توجد باقات سياحية تطابق معايير البحث.</div>
            ) : (
              <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
                {filteredPackages.map((dest) => (
                  <div
                    key={dest.id}
                    className={`bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden hover:shadow-xl transition-all duration-300 card-hover flex ${viewMode === "list" ? "flex-col sm:flex-row" : "flex-col"}`}
                  >
                    {/* Image Section */}
                    <div className={`relative shrink-0 overflow-hidden ${viewMode === "list" ? "w-full sm:w-1/3 min-h-[250px] sm:min-h-full" : "w-full h-56"}`}>
                      <Image
                        src={dest.image}
                        alt={dest.name}
                        fill
                        className="object-cover transition-transform duration-700 hover:scale-110"
                      />
                      {dest.popular && (
                        <div className="absolute top-4 right-4 px-3 py-1 bg-gradient-to-r from-error to-error/80 text-white text-xs font-bold rounded-md shadow-md z-10 flex items-center gap-1 backdrop-blur-sm border border-white/20">
                          <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                          الأكثر طلباً
                        </div>
                      )}
                    </div>

                    {/* Content Section */}
                    <div className={`p-6 flex flex-col justify-between flex-1 ${viewMode === "list" ? "sm:p-6" : "p-6"}`}>
                      <div className={`flex justify-between gap-4 h-full ${viewMode === "list" ? "flex-col sm:flex-row" : "flex-col"}`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-1 text-on-surface-variant text-xs mb-2">
                            <span className="material-symbols-outlined text-[14px] text-secondary">location_on</span>
                            <span className="font-medium tracking-wide">{dest.name}</span>
                          </div>
                          <h3 className="text-xl font-bold text-on-surface mb-2 leading-tight">{dest.title}</h3>

                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center text-secondary text-sm drop-shadow-sm">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <span key={i} className={`material-symbols-outlined text-[16px] ${i < dest.rating ? "text-secondary" : "text-outline-variant"}`}>
                                  star
                                </span>
                              ))}
                            </div>
                            <span className="text-xs font-medium text-on-surface-variant">({dest.reviews} تقييم)</span>
                          </div>

                          <p className="text-sm text-on-surface-variant mb-5 line-clamp-2 leading-relaxed">{dest.description}</p>

                          <div className="flex flex-wrap items-center gap-3 text-xs font-medium text-on-surface mb-4">
                            <div className="flex items-center gap-1.5 bg-surface-variant/80 px-3 py-1.5 rounded-full border border-outline-variant/10">
                              <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                              {dest.days}
                            </div>
                            <div className="flex items-center gap-1.5 bg-surface-variant/80 px-3 py-1.5 rounded-full border border-outline-variant/10" title={dest.includesText}>
                              {dest.features.map((icon: string, i: number) => (
                                <span key={i} className="material-symbols-outlined text-[16px] text-secondary">{icon}</span>
                              ))}
                            </div>
                          </div>
                        </div>

                        {/* Price & Action Section */}
                        <div className={`flex flex-col items-start sm:items-end justify-center pt-4 sm:pt-0 ${viewMode === "list" ? "border-t sm:border-t-0 sm:border-r border-outline-variant/30 sm:pr-6 sm:min-w-[200px]" : "border-t border-outline-variant/30 mt-auto"}`}>
                          <div className="w-full flex sm:flex-col justify-between items-end sm:items-end mb-4">
                            <div className="text-right w-full">
                              <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">يبدأ من</p>
                              {dest.originalPrice && (
                                <p className="text-sm text-outline line-through decoration-error decoration-2">{dest.originalPrice} ر.س</p>
                              )}
                              <div className="flex items-baseline gap-1 mb-1 justify-end sm:justify-start flex-row-reverse sm:flex-row">
                                <span className="text-3xl font-black text-on-surface tracking-tight">{dest.price}</span>
                                <span className="text-on-surface-variant font-bold text-sm">ر.س</span>
                              </div>
                              <p className="text-[10px] text-on-surface-variant bg-surface-variant/50 px-2 py-0.5 rounded inline-block mt-1">شامل الضرائب والرسوم</p>
                            </div>
                          </div>

                          <button
                            onClick={() => setSelectedPackageToBook(dest)}
                            className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center btn-glow"
                          >
                            تفاصيل الباقة
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        {/* Booking Modal */}
        {selectedPackageToBook && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm overflow-y-auto" dir="rtl">
            <div className="w-full max-w-2xl bg-surface rounded-3xl p-6 md:p-8 shadow-2xl relative border border-outline-variant/30 text-right animate-zoom-in">
              {/* Close Button */}
              <button
                onClick={() => {
                  setSelectedPackageToBook(null);
                  setBookingErrorMsg("");
                  setBookingMessage("");
                }}
                className="absolute top-6 left-6 text-outline hover:text-primary transition-colors p-2 rounded-full hover:bg-surface-variant cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>

              <h3 className="text-2xl font-bold text-primary mb-6 border-b border-outline-variant/30 pb-4">تفاصيل وحجز البرنامج السياحي</h3>

              {bookingMessage && (
                <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-6">{bookingMessage}</div>
              )}
              {bookingErrorMsg && (
                <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-6">{bookingErrorMsg}</div>
              )}

              <div className="space-y-6 text-on-surface overflow-y-auto max-h-[60vh] pl-2">

                {/* Package Header Preview */}
                <div className="bg-primary/5 p-5 rounded-2xl border border-primary/10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <span className="text-xs text-secondary font-bold block mb-1">{selectedPackageToBook.name}</span>
                    <h4 className="text-xl font-bold text-primary">{selectedPackageToBook.title}</h4>
                    <span className="text-xs text-on-surface-variant block mt-1">المدة: {selectedPackageToBook.days}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-on-surface-variant block uppercase tracking-wider">سعر البرنامج</span>
                    <div className="flex items-baseline gap-1 mt-0.5 justify-end">
                      <span className="text-3xl font-black text-secondary-bright">{selectedPackageToBook.price}</span>
                      <span className="text-secondary-bright font-bold text-sm">ر.س</span>
                    </div>
                  </div>
                </div>

                {/* Itinerary / Cities stay */}
                {Array.isArray(selectedPackageToBook.cityStays) && selectedPackageToBook.cityStays.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-primary border-r-4 border-secondary pr-2">خط سير الرحلة والمدن</h5>
                    <div className="grid grid-cols-1 gap-3 bg-surface-variant/40 p-4 rounded-2xl border border-outline-variant/20">
                      {selectedPackageToBook.cityStays.map((stay: any, idx: number) => (
                        <div key={idx} className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="w-5 h-5 rounded-full bg-secondary text-background flex items-center justify-center font-bold">{idx + 1}</span>
                          <span className="font-bold text-primary">{getCityName(stay.cityId)}</span>
                          <span className="text-[10px] text-on-surface-variant bg-surface px-2 py-0.5 rounded border border-outline-variant/10">
                            فندق: {stay.hotelCategory === "auto" ? "تلقائي" : stay.hotelCategory === "family" ? "عائلي" : stay.hotelCategory === "honeymoon" ? "شهر عسل" : stay.hotelCategory === "budget" ? "اقتصادي" : "فاخر VIP"}
                          </span>
                          {stay.transportFromPrevious && (
                            <span className="text-[10px] text-secondary-bright font-black bg-secondary/10 px-2 py-0.5 rounded">
                              مواصلات: {
                                stay.transportFromPrevious.startsWith("db_")
                                  ? "خاصة"
                                  : stay.transportFromPrevious === "flight" ? "طيران داخلي" : stay.transportFromPrevious === "train" ? "قطار" : stay.transportFromPrevious === "bus" ? "باص" : "سيارة خاصة"
                              }
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Flights configured */}
                {(selectedPackageToBook.departingFlight || selectedPackageToBook.returningFlight) && (
                  <div className="space-y-3">
                    <h5 className="font-bold text-primary border-r-4 border-secondary pr-2">تفاصيل الطيران الدولي المشمول</h5>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedPackageToBook.departingFlight && (
                        <div className="p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/10 text-xs">
                          <span className="font-bold text-on-surface flex items-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-sm text-secondary">flight_takeoff</span>
                            طيران الذهاب: {selectedPackageToBook.departingFlight.airWayName}
                          </span>
                          <span className="text-on-surface-variant block">
                            {selectedPackageToBook.departingFlight.departedAirport?.airportName} ← {selectedPackageToBook.departingFlight.arrivalAirport?.airportName}
                          </span>
                        </div>
                      )}
                      {selectedPackageToBook.returningFlight && (
                        <div className="p-3 bg-surface-variant/20 rounded-xl border border-outline-variant/10 text-xs">
                          <span className="font-bold text-on-surface flex items-center gap-1 mb-1">
                            <span className="material-symbols-outlined text-sm text-secondary">flight_land</span>
                            طيران العودة: {selectedPackageToBook.returningFlight.airWayName}
                          </span>
                          <span className="text-on-surface-variant block">
                            {selectedPackageToBook.returningFlight.departedAirport?.airportName} ← {selectedPackageToBook.returningFlight.arrivalAirport?.airportName}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Booking Form Fields */}
                <form onSubmit={handleBookSubmit} className="space-y-4 pt-4 border-t border-outline-variant/30">
                  <h5 className="font-bold text-primary border-r-4 border-secondary pr-2">تأكيد حجز العميل</h5>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-on-surface-variant font-bold">الاسم بالكامل</label>
                      <input
                        type="text"
                        required
                        placeholder="مثال: محمد أحمد"
                        value={bookingClientName}
                        onChange={(e) => setBookingClientName(e.target.value)}
                        className="w-full py-2.5 px-3 bg-surface-variant/30 border border-outline-variant/30 rounded-xl focus:border-secondary outline-none text-sm"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-on-surface-variant font-bold">رقم الجوال</label>
                      <input
                        type="tel"
                        required
                        placeholder="مثال: 0500000000"
                        value={bookingClientPhone}
                        onChange={(e) => setBookingClientPhone(e.target.value)}
                        className="w-full py-2.5 px-3 bg-surface-variant/30 border border-outline-variant/30 rounded-xl focus:border-secondary outline-none text-sm text-left"
                        dir="ltr"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-on-surface-variant font-bold">تاريخ الذهاب</label>
                      <input
                        type="date"
                        required
                        value={bookingStartDate}
                        min={new Date().toISOString().split("T")[0]}
                        onChange={(e) => setBookingStartDate(e.target.value)}
                        className="w-full py-2.5 px-3 bg-surface-variant/30 border border-outline-variant/30 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
                      />
                    </div>

                    <div className="flex flex-col gap-2">
                      <label className="text-xs text-on-surface-variant font-bold">تاريخ العودة</label>
                      <input
                        type="date"
                        required
                        value={bookingEndDate}
                        min={bookingStartDate || new Date().toISOString().split("T")[0]}
                        onChange={(e) => setBookingEndDate(e.target.value)}
                        className="w-full py-2.5 px-3 bg-surface-variant/30 border border-outline-variant/30 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={bookingLoading}
                    className="w-full py-3 bg-secondary text-background font-bold rounded-xl hover:opacity-95 shadow-md btn-glow transition-all cursor-pointer text-center text-sm mt-4"
                  >
                    {bookingLoading ? "جاري تسجيل الحجز..." : "تأكيد وإرسال طلب الحجز"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </>
  );
}
