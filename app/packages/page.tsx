"use client";

import React, { useState } from "react";
import Image from "next/image";

export default function PackagesPage() {
  const [viewMode, setViewMode] = useState<"list" | "grid">("list");

  const destinations = [
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
        <div className="max-w-[var(--spacing-container-max)] mx-auto relative z-10">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center">ابحث عن رحلتك القادمة</h1>
          
          {/* Search Bar */}
          <div className="bg-surface p-4 rounded-2xl shadow-xl max-w-5xl mx-auto flex flex-col md:flex-row gap-4 items-center">
            <div className="flex-1 w-full bg-surface-variant/50 rounded-xl px-4 py-3 border border-outline-variant/30 flex items-center gap-3 focus-within:border-secondary transition-colors">
              <span className="material-symbols-outlined text-outline">location_on</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">الوجهة</p>
                <input type="text" placeholder="إلى أين تريد الذهاب؟" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-on-surface placeholder:text-outline outline-none" />
              </div>
            </div>
            
            <div className="w-px h-10 bg-outline-variant/30 hidden md:block"></div>
            
            <div className="flex-1 w-full bg-surface-variant/50 rounded-xl px-4 py-3 border border-outline-variant/30 flex items-center gap-3 focus-within:border-secondary transition-colors">
              <span className="material-symbols-outlined text-outline">calendar_month</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">تاريخ السفر</p>
                <input type="text" placeholder="حدد التواريخ" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-on-surface placeholder:text-outline outline-none" />
              </div>
            </div>
            
            <div className="w-px h-10 bg-outline-variant/30 hidden md:block"></div>
            
            <div className="flex-1 w-full bg-surface-variant/50 rounded-xl px-4 py-3 border border-outline-variant/30 flex items-center gap-3 focus-within:border-secondary transition-colors">
              <span className="material-symbols-outlined text-outline">person</span>
              <div className="flex-1">
                <p className="text-[10px] font-bold text-on-surface-variant uppercase">المسافرون</p>
                <input type="text" placeholder="2 بالغين، 0 أطفال" className="w-full bg-transparent border-none p-0 text-sm focus:ring-0 text-on-surface placeholder:text-outline outline-none" />
              </div>
            </div>
            
            <button className="w-full md:w-auto bg-gradient-to-r from-secondary to-secondary-bright text-on-secondary px-8 py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:shadow-lg transition-all btn-glow gold-shimmer cursor-pointer">
              <span className="material-symbols-outlined">search</span>
              بحث
            </button>
          </div>
        </div>
      </section>

      <div className="max-w-[var(--spacing-container-max)] mx-auto px-4 md:px-6 mt-10 flex flex-col lg:flex-row gap-8">
        
        {/* Left Sidebar - Filters */}
        <aside className="w-full lg:w-1/4">
          <div className="bg-surface rounded-2xl border border-outline-variant/30 p-6 sticky top-24">
            <h3 className="font-bold text-lg mb-6 pb-4 border-b border-outline-variant/30 flex items-center gap-2">
              <span className="material-symbols-outlined">tune</span>
              تصفية النتائج
            </h3>
            
            <div className="mb-8">
              <h4 className="font-bold text-sm mb-4">الوجهة</h4>
              <div className="space-y-3">
                {["آسيا", "أوروبا", "الشرق الأوسط", "أفريقيا"].map((region) => (
                  <label key={region} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary border-outline-variant" />
                    <span className="text-sm text-on-surface-variant">{region}</span>
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
                  <label key={star} className="flex items-center gap-3 cursor-pointer">
                    <input type="checkbox" className="rounded text-secondary focus:ring-secondary border-outline-variant" />
                    <div className="flex items-center text-secondary text-sm">
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
          <div className="flex justify-between items-center bg-surface p-4 rounded-xl border border-outline-variant/30 mb-6">
            <p className="text-sm font-medium text-on-surface">تم العثور على <span className="font-bold text-secondary">3</span> باقات سفر</p>
            <div className="flex items-center gap-4">
              <select className="bg-transparent border-none text-sm text-on-surface-variant focus:ring-0 py-0 outline-none cursor-pointer">
                <option>ترتيب حسب: الأقل سعراً</option>
                <option>ترتيب حسب: الأعلى سعراً</option>
                <option>ترتيب حسب: الأكثر تقييماً</option>
              </select>
              
              <div className="flex items-center bg-surface-variant rounded-lg p-1 hidden sm:flex">
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
            {destinations.map((dest) => (
              <div 
                key={dest.id} 
                className={`bg-surface rounded-2xl border border-outline-variant/30 overflow-hidden hover:shadow-xl transition-shadow card-hover flex ${viewMode === "list" ? "flex-col sm:flex-row" : "flex-col"}`}
              >
                {/* Image Section */}
                <div className={`relative shrink-0 ${viewMode === "list" ? "w-full sm:w-1/3 min-h-[250px] sm:min-h-full" : "w-full h-56"}`}>
                  <Image 
                    src={dest.image} 
                    alt={dest.name} 
                    fill 
                    className="object-cover"
                  />
                  {dest.popular && (
                    <div className="absolute top-4 right-4 px-3 py-1 bg-error text-white text-xs font-bold rounded-md shadow-md z-10 flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">local_fire_department</span>
                      الأكثر طلباً
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <div className={`p-6 flex flex-col justify-between flex-1 ${viewMode === "list" ? "sm:p-6" : "p-6"}`}>
                  <div className={`flex justify-between gap-4 h-full ${viewMode === "list" ? "flex-col md:flex-row" : "flex-col"}`}>
                    <div className="flex-1">
                      <div className="flex items-center gap-1 text-on-surface-variant text-xs mb-1">
                        <span className="material-symbols-outlined text-[14px]">location_on</span>
                        {dest.name}
                      </div>
                      <h3 className="text-xl font-bold text-on-surface mb-2">{dest.title}</h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center text-secondary text-sm">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <span key={i} className={`material-symbols-outlined text-[16px] ${i < dest.rating ? "text-secondary" : "text-outline-variant"}`}>
                              star
                            </span>
                          ))}
                        </div>
                        <span className="text-xs text-on-surface-variant">({dest.reviews} تقييم)</span>
                      </div>

                      <p className="text-sm text-on-surface-variant mb-4 line-clamp-2">{dest.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-4 text-xs font-medium text-on-surface mb-4">
                        <div className="flex items-center gap-1.5 bg-surface-variant/50 px-3 py-1.5 rounded-full">
                          <span className="material-symbols-outlined text-[16px] text-secondary">schedule</span>
                          {dest.days}
                        </div>
                        <div className="flex items-center gap-1.5 bg-surface-variant/50 px-3 py-1.5 rounded-full" title={dest.includesText}>
                          {dest.features.map((icon, i) => (
                            <span key={i} className="material-symbols-outlined text-[16px] text-secondary">{icon}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Price & Action Section */}
                    <div className={`flex flex-col items-start md:items-end justify-center pt-4 md:pt-0 ${viewMode === "list" ? "border-t md:border-t-0 md:border-r border-outline-variant/30 md:pr-6 md:min-w-[180px]" : "border-t border-outline-variant/30 mt-auto"}`}>
                      <div className="w-full flex md:flex-col justify-between items-end md:items-end mb-4">
                         <div className="text-right">
                           <p className="text-xs text-on-surface-variant mb-1">السعر يبدأ من</p>
                           {dest.originalPrice && (
                             <p className="text-sm text-outline line-through decoration-error">{dest.originalPrice} ر.س</p>
                           )}
                           <div className="flex items-baseline gap-1 mb-1">
                             <span className="text-3xl font-black text-on-surface">{dest.price}</span>
                             <span className="text-on-surface-variant font-medium text-sm">ر.س</span>
                           </div>
                           <p className="text-[10px] text-on-surface-variant">شامل الضرائب والرسوم</p>
                         </div>
                      </div>
                      
                      <button className="w-full bg-primary text-white py-3 px-6 rounded-xl font-bold text-sm hover:bg-primary/90 transition-colors cursor-pointer text-center">
                        عرض التفاصيل
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
