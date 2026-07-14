import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import SearchWidget from "@/components/SearchWidget";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Icon from "@/components/Icon";

export default async function Home() {
  // Fetch up to 4 popular packages from the DB
  const packages = await prisma.companyPackage.findMany({
    take: 4,
    orderBy: {
      rating: 'desc',
    },
  });

  return (
    <div className="min-h-screen bg-white relative overflow-hidden" dir="rtl" style={{ fontFamily: 'inherit' }}>
      {/* ─── Hero & Navbar Wrapper ─────────────────────────────────────── */}
      <div
        className="relative bg-cover bg-center pt-6 pb-28 overflow-hidden"
        style={{ backgroundImage: "url('/images/maldives.png')" }}
      >
        {/* Dark overlay for text contrast and premium styling */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/35 to-black/75 z-0" />

        <div className="relative z-10">
          {/* ─── Navbar ─────────────────────────────────────────────────── */}
          <Navbar theme="light" />

          {/* ─── Hero Section ───────────────────────────────────────────── */}
          <section className="pt-24 pb-20 text-center px-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-white mb-4 tracking-tight leading-tight text-shadow-strong">
              معاون MOAWEN
              <br />
              باقات سياحية فاخرة
            </h1>
            <p className="text-white/80 max-w-xl mx-auto text-sm md:text-base font-medium mt-4 text-shadow-subtle leading-relaxed">
              اكتشف باقاتنا السياحية الفاخرة المصممة خصيصاً لتمنحك عطلة الأحلام مع معاون MOAWEN
            </p>
          </section>
        </div>
      </div>

      {/* ─── Search Bar (Floating) ──────────────────────────────────── */}
      <div className="relative z-20 -mt-16 px-4">
        <SearchWidget />
      </div>

      {/* ─── Services Quick Access ───────────────────────────────────── */}
      <section className="relative z-10 pt-10 pb-4 px-4">
        <div className="max-w-[1100px] mx-auto">
          <div
            className="bg-white rounded-3xl shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-gray-100 px-6 py-6"
            dir="rtl"
          >
            <div className="flex flex-wrap justify-around items-center gap-4">

              {/* الباقات السياحية */}
              <a
                href="/packages"
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1C00C6 0%, #100073 100%)" }}
                >
                  <Icon name="travel_explore" className="text-white text-3xl" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-primary transition-colors">الباقات السياحية</span>
              </a>

              <div className="hidden md:block w-px h-16 bg-gray-100" />

              {/* حجوزات الطيران */}
              <a
                href="#"
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #d4a017 0%, #a07820 100%)" }}
                >
                  <Icon name="flight_takeoff" className="text-white text-3xl" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#a07820] transition-colors">حجوزات الطيران</span>
              </a>

              <div className="hidden md:block w-px h-16 bg-gray-100" />

              {/* حجوزات الفنادق */}
              <a
                href="#"
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #1e1b4b 0%, #0c0a20 100%)" }}
                >
                  <Icon name="hotel" className="text-white text-3xl" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#1e1b4b] transition-colors">حجوزات الفنادق</span>
              </a>

              <div className="hidden md:block w-px h-16 bg-gray-100" />

              {/* استخراج التاشيرات */}
              <a
                href="#"
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #f5d98a 0%, #c9a84c 100%)" }}
                >
                  <Icon name="description" className="text-white text-3xl" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#c9a84c] transition-colors">استخراج التاشيرات</span>
              </a>

              <div className="hidden md:block w-px h-16 bg-gray-100" />

              {/* خدمات اخري */}
              <a
                href="#"
                className="group flex flex-col items-center gap-3 cursor-pointer select-none"
              >
                <div
                  className="w-16 h-16 rounded-2xl flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg"
                  style={{ background: "linear-gradient(135deg, #585e70 0%, #303031 100%)" }}
                >
                  <Icon name="dashboard" className="text-white text-3xl" />
                </div>
                <span className="text-sm font-bold text-gray-700 group-hover:text-[#585e70] transition-colors">خدمات اخري</span>
              </a>

            </div>
          </div>
        </div>
      </section>

      {/* ─── Exclusive Offers Section ───────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-2">
            <h2 className="text-2xl md:text-3xl font-black text-primary">باقاتنا المميزة</h2>
            {/* <Icon name="auto_awesome" className="text-primary text-3xl" /> */}
          </div>
          <p className="text-gray-500 font-medium">مجموعة مخصصة لأروع وجهات السفر الفخمة في العالم</p>
        </div>

        <div className="max-w-[1200px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {packages.map((dest) => (
            <Link href={`/packages`} key={dest.id} className="group bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.06)] border border-gray-100 hover:shadow-[0_8px_30px_rgba(28,0,198,0.12)] transition-all duration-300 transform hover:-translate-y-1 block">

              {/* Image Section */}
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={dest.image || "/images/default.jpg"}
                  alt={dest.name || "صورة الباقة"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />

                {/* Heart Icon */}
                <div className="absolute top-4 left-4 w-8 h-8 bg-white/30 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 cursor-pointer hover:bg-white/50 transition-colors z-10">
                  <Icon name="favorite" className="text-[16px] text-white" />
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-[#FBBF24] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md z-10">
                  <span>{dest.rating || "4.95"}</span>
                  <Icon name="star" className="text-[14px]" />
                </div>

                {/* Bottom Gradient & City Name */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex flex-col justify-end p-5">
                  <h3 className="text-white text-xl font-bold leading-tight">{dest.name}</h3>
                </div>
              </div>

              {/* Card Footer (Price & Duration) */}
              <div className="p-5 flex justify-between items-center bg-white border-t border-gray-50">
                <div>
                  <span className="text-primary font-black text-lg">{dest.pricing.toLocaleString("en-US")}</span>
                  <span className="text-primary font-bold text-sm ml-1">ريال</span>
                </div>
                <div className="text-gray-500 text-sm font-medium flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md">
                  <Icon name="schedule" className="text-[16px] text-gray-400" />
                  {dest.days} أيام
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <Footer />
    </div>
  );
}
