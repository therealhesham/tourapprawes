import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import HomeSearchWidget from "@/components/HomeSearchWidget";
import { prisma } from "@/lib/prisma";

export default async function Home() {
  const latestPackages = await prisma.companyPackage.findMany({
    orderBy: {
      createdAt: "desc"
    },
    take: 3
  });

  return (
    <>
      <Navbar activeLinkId="home" />

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Deep luxury gradient backdrop */}
        <div className="absolute inset-0 bg-background z-0">
          {/* Radial gold highlight in center */}
          <div 
            className="absolute inset-0 opacity-80"
            style={{
              background: "radial-gradient(circle at 50% 35%, #fbfaf7 0%, var(--color-background) 80%)"
            }}
          />
          {/* Subtle noise pattern overlay */}
          <div 
            className="absolute inset-0 opacity-[0.02]"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`
            }}
          />
        </div>

        {/* Animated breathing glow orbs */}
        <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] rounded-full blur-[120px] opacity-[0.18] pointer-events-none animate-float-slow"
          style={{ background: "radial-gradient(circle, var(--color-secondary-bright), transparent 75%)" }}
        />
        <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] rounded-full blur-[100px] opacity-[0.15] pointer-events-none animate-pulse-soft"
          style={{ background: "radial-gradient(circle, var(--color-secondary), transparent 75%)" }}
        />

        {/* Subtle rotating luxury compass/crest overlay */}
        <div className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 w-[600px] h-[600px] md:w-[800px] md:h-[800px] pointer-events-none opacity-[0.08] select-none animate-slow-spin">
          <svg viewBox="0 0 500 500" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-secondary" stroke="currentColor">
            {/* Outer rings */}
            <circle cx="250" cy="250" r="240" strokeWidth="1" />
            <circle cx="250" cy="250" r="235" strokeWidth="0.5" strokeDasharray="3,3" />
            <circle cx="250" cy="250" r="225" strokeWidth="1" />
            
            {/* Geometric star (Rub el Hizb style / 8-pointed star) */}
            <path d="M 250 10 L 320 180 L 490 250 L 320 320 L 250 490 L 180 320 L 10 250 L 180 180 Z" strokeWidth="1.5" />
            <path d="M 250 45 L 295 205 L 455 250 L 295 295 L 250 455 L 205 295 L 45 250 L 205 205 Z" strokeWidth="0.75" strokeDasharray="4,4" />
            
            {/* Secondary 8-pointed star rotated 45 degrees */}
            <g transform="rotate(45 250 250)">
              <path d="M 250 10 L 320 180 L 490 250 L 320 320 L 250 490 L 180 320 L 10 250 L 180 180 Z" strokeWidth="0.75" strokeOpacity="0.7" />
              <circle cx="250" cy="250" r="150" strokeWidth="0.5" strokeDasharray="5,5" />
            </g>

            {/* Concentric detail lines & compass markings */}
            <line x1="250" y1="10" x2="250" y2="490" strokeWidth="0.5" strokeOpacity="0.5" />
            <line x1="10" y1="250" x2="490" y2="250" strokeWidth="0.5" strokeOpacity="0.5" />
            
            {/* Small inner stars and decorative rings */}
            <circle cx="250" cy="250" r="80" strokeWidth="1" />
            <circle cx="250" cy="250" r="40" strokeWidth="1" />
            
            {/* Center diamond/compass point */}
            <polygon points="250,235 255,250 250,265 245,250" fill="currentColor" />
          </svg>
        </div>

        {/* Constellation & Flight Paths (Global Grid) */}
        <div className="absolute inset-0 z-0 pointer-events-none opacity-[0.22]">
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#a07820" stopOpacity="0.25" />
                <stop offset="50%" stopColor="#d4a017" stopOpacity="0.9" />
                <stop offset="100%" stopColor="#c9a84c" stopOpacity="0.25" />
              </linearGradient>
            </defs>
            {/* Global grid curves representing coordinates */}
            <path d="M-100,200 Q 400,-100 900,200 T 1900,-100" fill="none" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="5,5" />
            <path d="M-150,500 Q 500,200 1100,600 T 2100,300" fill="none" stroke="url(#gold-grad)" strokeWidth="1" />
            <path d="M-50,800 Q 600,400 1300,750 T 2300,500" fill="none" stroke="url(#gold-grad)" strokeWidth="1" strokeDasharray="3,6" />
            
            {/* Radial navigation arcs */}
            <circle cx="50%" cy="40%" r="200" fill="none" stroke="#d4a017" strokeWidth="0.5" strokeOpacity="0.1" />
            <circle cx="50%" cy="40%" r="400" fill="none" stroke="#d4a017" strokeWidth="0.5" strokeOpacity="0.08" strokeDasharray="10,15" />
            <circle cx="50%" cy="40%" r="600" fill="none" stroke="#d4a017" strokeWidth="0.5" strokeOpacity="0.05" />

            {/* Glowing nodes (ports / travel destinations) */}
            <g transform="translate(120, 180)">
              <circle r="4" fill="#d4a017" className="animate-pulse-point" />
              <circle r="2" fill="#fff" />
            </g>
            <g transform="translate(420, 480)">
              <circle r="4" fill="#d4a017" className="animate-pulse-point" />
              <circle r="2" fill="#fff" />
            </g>
            <g transform="translate(980, 220)">
              <circle r="5" fill="#d4a017" className="animate-pulse-point" />
              <circle r="2.5" fill="#fff" />
            </g>
            <g transform="translate(1250, 520)">
              <circle r="4" fill="#d4a017" className="animate-pulse-point" />
              <circle r="2" fill="#fff" />
            </g>
            <g transform="translate(700, 580)">
              <circle r="4" fill="#d4a017" className="animate-pulse-point" />
              <circle r="2" fill="#fff" />
            </g>
          </svg>
        </div>

        {/* Luxury Star Dust / Shimmering Particles */}
        <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
          {[
            { top: "15%", left: "10%", size: "w-1 h-1", delay: "1s" },
            { top: "25%", left: "80%", size: "w-1.5 h-1.5", delay: "2s" },
            { top: "60%", left: "15%", size: "w-2 h-2", delay: "0s" },
            { top: "75%", left: "85%", size: "w-1 h-1", delay: "3.5s" },
            { top: "45%", left: "90%", size: "w-1.5 h-1.5", delay: "1.5s" },
            { top: "80%", left: "30%", size: "w-1 h-1", delay: "2.5s" },
            { top: "10%", left: "70%", size: "w-2 h-2", delay: "0.5s" },
            { top: "35%", left: "20%", size: "w-1 h-1", delay: "4s" },
          ].map((star, idx) => (
            <div
              key={idx}
              className={`absolute rounded-full bg-secondary-bright/40 animate-pulse-soft ${star.size}`}
              style={{
                top: star.top,
                left: star.left,
                animationDelay: star.delay,
                boxShadow: "0 0 6px 1px rgba(212, 160, 23, 0.4)",
              }}
            />
          ))}
        </div>

        {/* Hero Content */}
        <div className="relative z-20 text-center px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto pb-40">
          {/* Brand Logo in Hero */}
          <div className="flex justify-center mb-10 animate-fade-in-up">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={550}
              height={187}
              className="h-36 md:h-48 w-auto object-contain"
              priority
            />
          </div>

          {/* Main title */}
          <h1
            className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-primary mb-6 animate-fade-in-up-delay-1"
            style={{ fontWeight: 200 }}
          >
            باقات سياحية{" "}
            <span className="gradient-gold" style={{ fontWeight: 300 }}>
              فاخرة
            </span>
          </h1>

          {/* Sub-text */}
          <p className="font-body-lg text-body-lg text-primary/75 mb-10 max-w-2xl mx-auto animate-fade-in-up-delay-2">
            استمتع بتجربة سفر مختلفة مع روائس للسفر والسياحة من خلال رحلات
            سياحية خارجية مليانة متعة واكتشاف.
          </p>

        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-float">
          <span className="font-label-sm text-label-sm text-primary/50 uppercase tracking-widest">
            استكشف
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-primary/40 to-transparent" />
        </div>
      </section>

      <HomeSearchWidget />

      {/* ─── Packages ────────────────────────────────────────────────── */}
      <section id="destinations" className="pt-24 pb-20 px-margin-mobile md:px-margin-desktop bg-background">
        <div className="max-w-container-max mx-auto">
          {/* Section header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-14 gap-4">
            <div>
              <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3 flex items-center gap-2">
                <span className="inline-block w-8 h-px bg-secondary" />
                العروض الحصرية
              </p>
              <h2 className="font-headline-lg text-headline-lg text-on-background">
                عروض شهر يونيو
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant mt-2 max-w-md">
                باقات حصرية لوجهات متميزة بأسعار تنافسية لا تُفوَّت
              </p>
            </div>
            <Link href="/packages">
              <button className="inline-flex items-center gap-2 text-secondary hover:text-secondary-bright font-label-sm text-label-sm uppercase tracking-widest transition-colors duration-300 group cursor-pointer">
                عرض الكل
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-300">
                  arrow_left
                </span>
              </button>
            </Link>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {latestPackages.map((pkg) => (
              <Link href={`/packages?id=${pkg.id}`} key={pkg.id}>
                <article className="card-hover group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg border border-white/10 h-full">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    alt={pkg.title}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    src={pkg.image}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />

                  {/* LTR Layout container overlay for absolute alignment to match reference image */}
                  <div className="absolute inset-0 p-7 z-10 select-none pointer-events-none" dir="ltr">
                    {/* Top Info */}
                    <div className="absolute top-7 left-7 text-left text-shadow-subtle">
                      <span className="text-2xl font-bold text-white tracking-wide">{pkg.name}</span>
                      <span className="text-sm font-medium text-white/80 block mt-1">{pkg.title}</span>
                    </div>
                    <div className="absolute top-7 right-7 glass-dark text-white/90 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-white/20">
                      {pkg.days}
                    </div>

                    {/* Bottom Info */}
                    <div className="absolute bottom-7 left-7 pointer-events-auto bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110">
                      <span className="material-symbols-outlined text-lg">arrow_forward</span>
                    </div>

                    <div className="absolute bottom-7 right-7 text-right text-shadow-subtle">
                      <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-widest">
                        تبدأ من
                      </span>
                      <span className="block text-3xl font-extrabold text-white tracking-tight mt-0.5">
                        {pkg.pricing.toLocaleString("en-US")} <span className="text-base font-normal text-secondary-bright">SAR</span>
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            ))}
          </div>

          {/* View more */}
          <div className="mt-12 text-center">
            <Link href="/packages">
              <button className="inline-flex items-center gap-2 border border-secondary/40 text-secondary hover:bg-secondary hover:text-on-secondary px-8 py-3 rounded-full font-label-sm text-label-sm uppercase tracking-widest transition-all duration-300 btn-glow group cursor-pointer">
                عرض المزيد من الباقات
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-300">
                  arrow_left
                </span>
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Why Us ──────────────────────────────────────────────────── */}
      <section className="py-20 px-margin-mobile md:px-margin-desktop bg-surface-container">
        <div className="max-w-container-max mx-auto">
          <div className="text-center mb-14">
            <p className="font-label-sm text-label-sm text-secondary uppercase tracking-widest mb-3 flex items-center justify-center gap-2">
              <span className="inline-block w-8 h-px bg-secondary" />
              مميزاتنا
              <span className="inline-block w-8 h-px bg-secondary" />
            </p>
            <h2 className="font-headline-lg text-headline-lg text-on-background">
              لماذا تختار روائس؟
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: "verified",
                title: "جودة مضمونة",
                desc: "نختار لكم أفضل الفنادق والخدمات بعناية تامة",
              },
              {
                icon: "support_agent",
                title: "دعم 24/7",
                desc: "فريقنا في خدمتكم على مدار الساعة طوال رحلتكم",
              },
              {
                icon: "payments",
                title: "أسعار تنافسية",
                desc: "أفضل الأسعار مع أعلى مستويات الجودة والرفاهية",
              },
              {
                icon: "luggage",
                title: "تجربة شاملة",
                desc: "نتولى كل التفاصيل من التأشيرة حتى العودة",
              },
            ].map((item) => (
              <div
                key={item.title}
                className="group bg-surface-container-lowest rounded-2xl p-7 border border-outline-variant/30 hover:border-secondary/30 transition-all duration-300 hover:shadow-lg text-center"
              >
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-secondary/20 to-secondary-bright/10 flex items-center justify-center mx-auto mb-5 group-hover:scale-110 transition-transform duration-300">
                  <span className="material-symbols-outlined text-secondary text-2xl">
                    {item.icon}
                  </span>
                </div>
                <h3 className="font-headline-md text-headline-md text-on-surface mb-2">
                  {item.title}
                </h3>
                <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section id="contact" className="relative py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
        {/* Dark bg */}
        <div className="absolute inset-0 bg-primary" />
        {/* Gold glow */}
        <div
          className="absolute -top-20 left-1/2 -translate-x-1/2 w-full max-w-2xl h-64 rounded-full blur-3xl opacity-25 pointer-events-none"
          style={{ background: "radial-gradient(ellipse, #d4a017, transparent 70%)" }}
        />
        {/* Pattern texture */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(circle, #d4a017 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        <div className="relative z-10 max-w-3xl mx-auto text-center">
          <p className="font-label-sm text-label-sm text-secondary-bright uppercase tracking-widest mb-4 flex items-center justify-center gap-2">
            <span className="inline-block w-8 h-px bg-secondary-bright" />
            خدمة VIP
            <span className="inline-block w-8 h-px bg-secondary-bright" />
          </p>

          <h2 className="font-headline-lg text-headline-lg text-white mb-6">
            هل تبحث عن تجربة{" "}
            <span className="gradient-gold">مصممة خصيصاً لك؟</span>
          </h2>
          <p className="font-body-lg text-body-lg text-white/70 mb-10 max-w-xl mx-auto">
            فريقنا من مستشاري السفر الفاخر جاهز لتصميم رحلة أحلامك بدقة وعناية،
            لتناسب ذوقك الرفيع.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="gold-shimmer bg-primary text-background px-10 py-4 rounded-full font-label-sm text-label-sm uppercase tracking-widest btn-glow inline-flex items-center justify-center gap-3 shadow-lg">
              <span className="material-symbols-outlined">headset_mic</span>
              احجز استشارة مجانية
            </button>
            <button className="border border-white/20 text-white hover:border-white/50 hover:bg-white/10 px-10 py-4 rounded-full font-label-sm text-label-sm uppercase tracking-widest transition-all duration-300 inline-flex items-center justify-center gap-3">
              <span className="material-symbols-outlined">phone</span>
              تواصل معنا
            </button>
          </div>
        </div>
      </section>

      {/* ─── Footer ──────────────────────────────────────────────────── */}
      <footer className="bg-primary-container">
        {/* Gold top line */}
        <div className="h-px w-full bg-gradient-to-l from-transparent via-secondary to-transparent opacity-40" />

        <div className="px-margin-mobile md:px-margin-desktop py-14 w-full max-w-container-max mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="gradient-gold font-headline-lg text-headline-lg mb-4">
                Rawaes
              </div>
              <p className="font-body-md text-body-md text-on-primary-container/70 leading-relaxed">
                روائس للسفر والسياحة — رحلات فاخرة لأرقى الوجهات العالمية.
              </p>
              {/* Social icons */}
              <div className="flex gap-3 mt-5">
                {["language", "alternate_email", "smartphone"].map((icon) => (
                  <button
                    key={icon}
                    className="w-9 h-9 rounded-full border border-white/15 flex items-center justify-center text-white/60 hover:border-secondary hover:text-secondary transition-all duration-300"
                  >
                    <span className="material-symbols-outlined text-sm">{icon}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Links columns */}
            <div>
              <p className="font-label-sm text-label-sm text-secondary-bright uppercase tracking-widest mb-5">
                الخدمات
              </p>
              <ul className="space-y-3">
                {["الوجهات السياحية", "الجولات الفاخرة", "حجز الفنادق", "تأشيرات السفر"].map((l) => (
                  <li key={l}>
                    <a href="#" className="font-body-md text-body-md text-on-primary-container/70 hover:text-secondary transition-colors duration-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-label-sm text-label-sm text-secondary-bright uppercase tracking-widest mb-5">
                الشركة
              </p>
              <ul className="space-y-3">
                {["من نحن", "شركاؤنا", "المدونة", "تواصل معنا"].map((l) => (
                  <li key={l}>
                    <a href="#" className="font-body-md text-body-md text-on-primary-container/70 hover:text-secondary transition-colors duration-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <p className="font-label-sm text-label-sm text-secondary-bright uppercase tracking-widest mb-5">
                القانونية
              </p>
              <ul className="space-y-3">
                {["سياسة الخصوصية", "الشروط والأحكام", "سياسة الإلغاء"].map((l) => (
                  <li key={l}>
                    <a href="#" className="font-body-md text-body-md text-on-primary-container/70 hover:text-secondary transition-colors duration-300">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="font-body-md text-body-md text-on-primary-container/50">
              © 2024 Rawaes Elite Travel. جميع الحقوق محفوظة.
            </p>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-secondary-bright animate-pulse" />
              <span className="font-label-sm text-label-sm text-on-primary-container/50 uppercase tracking-widest">
                Luxury Travel Partner
              </span>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
