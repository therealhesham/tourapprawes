"use client";

import React, { useState } from "react";
import Image from "next/image";

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
          <div className="absolute top-[calc(100%+8px)] right-0 w-[calc(100vw-32px)] md:w-[320px] p-5 bg-surface border border-outline-variant/20 rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] animate-fade-in-up origin-top cursor-default" onClick={e => e.stopPropagation()}>
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
                className="w-full bg-gradient-to-r from-secondary to-secondary-bright text-on-secondary py-3 rounded-lg text-sm font-bold mt-2 hover:shadow-md transition-all cursor-pointer btn-glow"
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

  const destinationsList = [
    {
      id: "bali",
      name: "جزيرة بالي، إندونيسيا",
      title: "سحر الطبيعة الاستوائية",
      description: "استمتع بجمال الغابات الاستوائية والشواطئ الساحرة في منتجعات بالي الفاخرة مع جولات سياحية لا تُنسى.",
      price: "6,500",
      originalPrice: "7,200",
      days: "7 أيام / 6 ليالي",
      image: "/images/bali.png",
      popular: true,
      rating: 5,
      reviews: 124,
      features: ["flight", "hotel", "restaurant", "directions_car"],
      includesText: "طيران، فندق 5 نجوم، إفطار، تنقلات"
    },
    {
      id: "maldives",
      name: "جزر المالديف",
      title: "عطلة الأحلام فوق الماء",
      description: "عش تجربة لا تُنسى في الفيلات المائية وسط المياه الفيروزية الصافية والرمال البيضاء.",
      price: "12,900",
      originalPrice: null,
      days: "5 أيام / 4 ليالي",
      image: "/images/maldives.png",
      popular: false,
      rating: 5,
      reviews: 89,
      features: ["flight", "hotel", "restaurant", "sailing"],
      includesText: "طيران، فيلا مائية، إقامة شاملة، قارب سريع"
    },
    {
      id: "elgouna",
      name: "الجونة، مصر",
      title: "رفاهية البحر الأحمر",
      description: "اكتشف روعة البحر الأحمر واستمتع بالأنشطة البحرية الممتعة واليخوت الفاخرة في الجونة.",
      price: "3,200",
      originalPrice: "3,800",
      days: "4 أيام / 3 ليالي",
      image: "/images/elgouna.png",
      popular: false,
      rating: 4,
      reviews: 210,
      features: ["hotel", "restaurant", "directions_car"],
      includesText: "فندق 5 نجوم، إفطار، تنقلات"
    }
  ];

  return (
    <main className="min-h-screen bg-background pb-20 font-body-md">
      
      {/* Search Header Banner */}
      <section className="bg-primary pt-24 pb-12 px-6 relative">
        <div className="absolute inset-0 opacity-10 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-secondary blur-3xl"></div>
        </div>
        <div className="w-full max-w-[var(--spacing-container-max)] mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-8 text-center">ابحث عن رحلتك القادمة</h1>
          
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
            <button className="w-full h-[64px] bg-gradient-to-r from-secondary to-secondary-bright text-on-secondary px-6 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-xl hover:-translate-y-0.5 transition-all btn-glow gold-shimmer cursor-pointer xl:col-span-1 shadow-lg">
              <span className="material-symbols-outlined text-2xl">search</span>
              <span className="text-lg">بحث</span>
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-4 md:px-6 mt-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-surface rounded-2xl border border-outline-variant/30 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-6 pb-4 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">tune</span>
              تصفية النتائج
            </h3>
            
            <div className="mb-8">
              <h4 className="font-bold text-sm mb-4">الوجهة</h4>
              <div className="space-y-3">
                {["آسيا", "أوروبا", "الشرق الأوسط", "أفريقيا"].map((region) => (
                  <label key={region} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary border-outline-variant/50 w-4 h-4 transition-colors cursor-pointer" />
                    <span className="text-sm text-on-surface-variant group-hover:text-secondary transition-colors">{region}</span>
                  </label>
                ))}
              </div>
            </div>
            
            <div className="mb-8">
              <h4 className="font-bold text-sm mb-4">السعر</h4>
              <input type="range" className="w-full accent-secondary" min="1000" max="20000" />
              <div className="flex justify-between text-xs text-on-surface-variant mt-2">
                <span>1,000 ر.س</span>
                <span>20,000 ر.س</span>
              </div>
            </div>

            <div className="mb-8">
              <h4 className="font-bold text-sm mb-4">التقييم</h4>
              <div className="space-y-3">
                {[5, 4, 3].map((star) => (
                  <label key={star} className="flex items-center gap-3 cursor-pointer group">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary border-outline-variant/50 w-4 h-4 transition-colors cursor-pointer" />
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
            <p className="text-sm font-medium text-on-surface">تم العثور على <span className="font-bold text-secondary">3</span> باقات سفر</p>
            <div className="flex items-center gap-4">
              <div className="relative group hidden sm:block">
                <select className="bg-transparent border-none text-sm text-on-surface-variant focus:ring-0 py-0 outline-none cursor-pointer appearance-none pr-6 font-medium">
                  <option>ترتيب حسب: الأقل سعراً</option>
                  <option>ترتيب حسب: الأعلى سعراً</option>
                  <option>ترتيب حسب: الأكثر تقييماً</option>
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
          <div className={`grid gap-6 ${viewMode === "grid" ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1"}`}>
            {destinationsList.map((dest) => (
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
                  <div className={`flex justify-between gap-4 h-full ${viewMode === "list" ? "flex-col md:flex-row" : "flex-col"}`}>
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
                          {dest.features.map((icon, i) => (
                            <span key={i} className="material-symbols-outlined text-[16px] text-secondary">{icon}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Section */}
                    <div className={`flex flex-col items-start md:items-end justify-center pt-4 md:pt-0 ${viewMode === "list" ? "border-t md:border-t-0 md:border-r border-outline-variant/30 md:pr-6 md:min-w-[200px]" : "border-t border-outline-variant/30 mt-auto"}`}>
                      <div className="w-full flex md:flex-col justify-between items-end md:items-end mb-4">
                        <div className="text-right w-full">
                          <p className="text-xs font-bold text-on-surface-variant mb-1 uppercase tracking-wider">يبدأ من</p>
                          {dest.originalPrice && (
                            <p className="text-sm text-outline line-through decoration-error decoration-2">{dest.originalPrice} ر.س</p>
                          )}
                          <div className="flex items-baseline gap-1 mb-1 justify-end md:justify-start flex-row-reverse md:flex-row">
                            <span className="text-3xl font-black text-on-surface tracking-tight">{dest.price}</span>
                            <span className="text-on-surface-variant font-bold text-sm">ر.س</span>
                          </div>
                          <p className="text-[10px] text-on-surface-variant bg-surface-variant/50 px-2 py-0.5 rounded inline-block mt-1">شامل الضرائب والرسوم</p>
                        </div>
                      </div>

                      <button className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all hover:shadow-lg hover:-translate-y-0.5 cursor-pointer text-center btn-glow">
                        تفاصيل الباقة
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
