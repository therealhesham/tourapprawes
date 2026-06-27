import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";

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
      <nav className="relative z-50 pt-6 px-6 md:px-12">
        <div className="max-w-[1400px] mx-auto flex justify-between items-center bg-white/80 backdrop-blur-md py-4 px-6 rounded-full shadow-[0_4px_30px_rgba(0,0,0,0.03)] border border-gray-100">

          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-black text-primary tracking-wide flex items-center gap-2">
              <Image src="/Untitled-3.png" alt="Rawaes Logo" width={450} height={153} className="h-[50px] sm:h-[50px] md:h-[50px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity logo-custom-color" />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 text-primary font-bold text-sm bg-gray-100 px-4 py-2 rounded-full">
              <span className="material-symbols-outlined text-[18px]">home</span>
              الرئيسية
            </Link>
            <Link href="/packages" className="flex items-center gap-2 text-gray-500 hover:text-primary font-medium text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              الباقات
            </Link>
            <Link href="/booking" className="flex items-center gap-2 text-gray-500 hover:text-primary font-medium text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">luggage</span>
              حجوزاتي
            </Link>
            <Link href="#" className="flex items-center gap-2 text-gray-500 hover:text-primary font-medium text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">favorite</span>
              المفضلة
            </Link>
            <Link href="#" className="flex items-center gap-2 text-gray-500 hover:text-primary font-medium text-sm transition-colors">
              <span className="material-symbols-outlined text-[18px]">person</span>
              حسابي
            </Link>
          </div>

          {/* Gold Membership Button */}
          <div className="flex items-center">

          </div>
        </div>
      </nav>

      {/* ─── Hero Section ───────────────────────────────────────────── */}
      <section className="relative z-10 pt-20 pb-32 text-center px-4">
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-primary mb-4 tracking-tight leading-tight">
          معاون MOAWEN
          <br />
          باقات سياحية فاخرة
        </h1>
      </section>

      {/* ─── Search Bar (Floating) ──────────────────────────────────── */}
      <div className="relative z-20 -mt-16 px-4">
        <div className="max-w-[1000px] mx-auto bg-white rounded-full shadow-[0_10px_40px_rgba(28,0,198,0.1)] border border-gray-100 p-3 flex flex-col md:flex-row items-center">

          <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-gray-100 md:divide-x-reverse">
            {/* Destination */}
            <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">وجهة السفر</p>
                <p className="text-sm font-bold text-primary">أين وجهتك القادمة؟</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">location_on</span>
            </div>

            {/* Dates */}
            <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">التواريخ</p>
                <p className="text-sm font-bold text-primary">متى تخطط للسفر؟</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">calendar_month</span>
            </div>

            {/* Budget */}
            <div className="px-6 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50 rounded-full transition-colors">
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">الميزانية</p>
                <p className="text-sm font-bold text-primary">تحديد سقف الميزانية</p>
              </div>
              <span className="material-symbols-outlined text-gray-400">account_balance_wallet</span>
            </div>
          </div>

          {/* Search Button */}
          <button className="mt-4 md:mt-0 w-full md:w-auto bg-primary text-white px-10 py-4 rounded-full font-bold text-lg flex items-center justify-center gap-2 hover:bg-[#1e1b4b] transition-colors shadow-lg shadow-primary/30">
            <span className="material-symbols-outlined">search</span>
            بحث
          </button>
        </div>
      </div>

      {/* ─── Exclusive Offers Section ───────────────────────────────── */}
      <section className="relative z-10 pt-24 pb-20 px-6 md:px-12">
        <div className="max-w-[1200px] mx-auto text-center mb-12">
          <div className="flex justify-center items-center gap-2 mb-2">
            <h2 className="text-2xl md:text-3xl font-black text-primary">باقاتنا المميزة</h2>
            {/* <span className="material-symbols-outlined text-primary text-3xl">auto_awesome</span> */}
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
                  <span className="material-symbols-outlined text-[16px] text-white">favorite</span>
                </div>

                {/* Rating Badge */}
                <div className="absolute top-4 right-4 bg-[#FBBF24] text-white text-xs font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md z-10">
                  <span>{dest.rating || "4.95"}</span>
                  <span className="material-symbols-outlined text-[14px]">star</span>
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
                  <span className="material-symbols-outlined text-[16px] text-gray-400">schedule</span>
                  {dest.days} أيام
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Footer minimal to match design */}
      <footer className="text-center py-8 text-gray-400 text-sm border-t border-gray-100 mt-10">
        © {new Date().getFullYear()} معاون MOAWEN - جميع الحقوق محفوظة
      </footer>
    </div>
  );
}
