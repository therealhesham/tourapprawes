"use client";

import React, { useState, useEffect, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

interface Option {
  value: string;
  label: string;
}

function PackagesPageContent() {
  const searchParams = useSearchParams();

  // Read query params from SearchWidget
  const qDestination = searchParams.get("destination") || "";
  const qBudget = searchParams.get("budget") ? Number(searchParams.get("budget")) : null;
  const qFrom = searchParams.get("from") || "";
  const qTo = searchParams.get("to") || "";

  // DB Packages & UI filters states
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dbCities, setDbCities] = useState<any[]>([]);

  useEffect(() => {
    setLoading(true);
    const loadPkgs = fetch("/api/packages")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else if (Array.isArray(data)) {
          const formatted = data.map((pkg: any) => {
            return {
              ...pkg,
              price: pkg.pricing.toLocaleString("en-US"),
            };
          });
          setPackages(formatted);
        }
      })
      .catch(() => setError("حدث خطأ أثناء تحميل الباقات."));

    const loadCities = fetch("/api/admin/cities")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const flattened = data.flatMap((dest: any) =>
            dest.countries.flatMap((c: any) =>
              c.cities.map((city: any) => ({ id: city.id, name: city.name }))
            )
          );
          setDbCities(flattened);
        }
      })
      .catch(() => { });

    Promise.all([loadPkgs, loadCities]).finally(() => setLoading(false));
  }, []);

  // Apply filters from search params
  const filteredPackages = packages.filter((pkg) => {
    if (qDestination && !pkg.name?.toLowerCase().includes(qDestination.toLowerCase()) &&
      !pkg.title?.toLowerCase().includes(qDestination.toLowerCase()) &&
      !pkg.countryCode?.toLowerCase().includes(qDestination.toLowerCase()) &&
      !pkg.destinationCode?.toLowerCase().includes(qDestination.toLowerCase())) {
      return false;
    }
    if (qBudget !== null && pkg.pricing > qBudget) {
      return false;
    }
    return true;
  });


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
      <section className="relative z-10 pt-16 pb-10 text-center px-4">
        <div className="flex justify-center items-center gap-2 mb-2">
          <h1 className="text-3xl md:text-4xl font-black text-primary">استكشف باقاتنا</h1>
          <Icon name="travel_explore" className="text-primary text-4xl" />
        </div>
        <p className="text-gray-500 font-medium">أفضل العروض والبرامج السياحية المصممة خصيصاً لك</p>
      </section>

      {/* ─── Packages Grid ─────────────────────────────────────────── */}
      <main className="relative z-10 max-w-[1200px] mx-auto w-full px-6 md:px-12 pb-24 flex-grow">

        {/* Active Filters Bar */}
        {(qDestination || qBudget !== null || qFrom || qTo) && (
          <div className="flex flex-wrap gap-2 mb-6 items-center">
            <span className="text-xs font-bold text-gray-400 ml-1">فلاتر نشطة:</span>
            {qDestination && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                <Icon name="location_on" className="text-[14px]" />
                {qDestination}
              </span>
            )}
            {qBudget !== null && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                <Icon name="account_balance_wallet" className="text-[14px]" />
                حتى {qBudget.toLocaleString("ar-SA")} ريال
              </span>
            )}
            {qFrom && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-3 py-1.5 rounded-full border border-primary/20">
                <Icon name="calendar_month" className="text-[14px]" />
                {qFrom}{qTo ? ` → ${qTo}` : ""}
              </span>
            )}
            <Link href="/packages" className="text-xs text-gray-400 hover:text-red-500 transition-colors font-medium mr-1 flex items-center gap-1">
              <Icon name="close" className="text-[14px]" />
              مسح الكل
            </Link>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1C00C6] rounded-full animate-spin" />
          </div>
        ) : error ? (
          <div className="text-center py-20 text-red-500 font-bold">{error}</div>
        ) : filteredPackages.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm text-gray-400">
            <Icon name="search_off" className="text-5xl block mb-4" />
            <p className="text-lg font-bold">لا توجد باقات تطابق بحثك</p>
            <p className="text-sm mt-1">جرب تعديل معايير البحث</p>
            <Link href="/packages" className="inline-flex items-center gap-2 mt-4 text-primary font-bold text-sm hover:underline">
              <Icon name="refresh" className="text-[16px]" />
              عرض كل الباقات
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredPackages.map((dest) => (
              <Link key={dest.id} href={`/packages/${dest.id}`} className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1 block cursor-pointer">

                {/* Image Section */}
                <div className="relative h-64 w-full overflow-hidden">
                  <Image
                    src={dest.image}
                    alt={dest.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Heart Icon */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 cursor-pointer hover:bg-white/50 transition-colors z-10">
                    <Icon name="favorite" className="text-[16px] text-white" />
                  </div>

                  {/* Rating Badge */}
                  <div className="absolute top-4 right-4 bg-[#FBBF24] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md z-10">
                    <span>{dest.rating || '4.95'}</span>
                    <Icon name="star" className="text-[14px]" />
                  </div>

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-md text-primary text-xs font-bold px-3 py-1 rounded-full shadow-md z-10 border border-primary/20">
                    {dest.destinationCode || "VIP"}
                  </div>

                  {/* Bottom Gradient & City/Title Name */}
                  <div className="absolute inset-x-0 bottom-0 h-[60%] bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                    <p className="text-white/80 text-xs font-bold mb-1 tracking-widest">{dest.countryCode || ""}</p>
                    <h3 className="text-white text-xl font-bold leading-tight line-clamp-2">{dest.name}</h3>
                    <p className="text-white/80 text-xs font-medium mt-1 line-clamp-1">{dest.title}</p>
                  </div>
                </div>

                {/* Card Footer (Price & Duration) */}
                <div className="p-5 flex justify-between items-center bg-white border-t border-gray-50">
                  <div>
                    <span className="text-primary font-black text-lg">{dest.price}</span>
                    <span className="text-primary font-bold text-sm ml-1">ريال</span>
                  </div>
                  <div className="text-gray-500 text-sm font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                    <Icon name="schedule" className="text-[16px] text-gray-400" />
                    {dest.days}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>


      <Footer />
    </div>
  );
}

export default function PackagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex justify-center items-center">
        <div className="w-12 h-12 border-4 border-gray-200 border-t-[#1C00C6] rounded-full animate-spin" />
      </div>
    }>
      <PackagesPageContent />
    </Suspense>
  );
}
