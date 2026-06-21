import Image from "next/image";

export default function Home() {
  return (
    <>
      {/* ─── Navigation ─────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500">
        <div className="glass-dark border-b border-white/10">
          <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-container-max mx-auto">
            {/* Logo */}
            <a href="/" className="flex items-center">
              <Image
                src="/logo.png"
                alt="Rawaes Logo"
                width={280}
                height={96}
                className="h-14 w-auto object-contain brightness-0 invert opacity-95 hover:opacity-100 transition-opacity"
              />
            </a>

            {/* Nav Links */}
            <nav className="hidden md:flex items-center gap-8">
              {[
                { label: "وجهات", href: "#" },
                { label: "جولات", href: "#", active: true },
                { label: "رحلات جوية", href: "#" },
                { label: "تأشيرات", href: "#" },
                { label: "فنادق", href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className={`relative font-body-md text-body-md tracking-widest uppercase transition-colors duration-300 group ${item.active
                    ? "text-secondary-bright"
                    : "text-white/75 hover:text-white"
                    }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-1 right-0 h-px bg-gradient-to-l from-secondary-bright to-secondary transition-all duration-300 ${item.active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                  />
                </a>
              ))}
            </nav>

            {/* CTA */}
            <div className="flex items-center gap-4">
              <button className="hidden md:block text-white/75 hover:text-white font-body-md text-body-md tracking-widest uppercase transition-colors duration-300">
                تسجيل الدخول
              </button>
              <button className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-6 py-2.5 rounded-full font-body-md text-body-md uppercase tracking-widest btn-glow">
                احجز الآن
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── Hero ────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background image */}
        <div className="absolute inset-0 z-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            alt="Luxury Travel Destinations"
            className="w-full h-full object-cover scale-105"
            style={{ animation: "none" }}
            src="https://flammang.lu/wp-content/uploads/2025/04/312733.jpg"
          />
          {/* Rich multi-stop gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/30 to-primary/90" />
          {/* Side vignette */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary/60 via-transparent to-primary/30" />
        </div>

        {/* Decorative glow orbs */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(circle, #d4a017, transparent 70%)" }}
        />
        <div className="absolute bottom-1/4 left-1/4 w-72 h-72 rounded-full blur-3xl opacity-15 pointer-events-none"
          style={{ background: "radial-gradient(circle, #c9a84c, transparent 70%)" }}
        />

        {/* Hero Content */}
        <div className="relative z-20 text-center px-margin-mobile md:px-margin-desktop max-w-5xl mx-auto pb-40">
          {/* Eyebrow label */}
          <div className="luxury-divider mb-6 animate-fade-in-up">
            <span className="font-label-sm text-label-sm text-secondary-bright tracking-widest uppercase px-4">
              اكتشف العالم برفاهية
            </span>
          </div>

          {/* Main title */}
          <h1
            className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-white mb-6 text-shadow-strong animate-fade-in-up-delay-1"
            style={{ fontWeight: 200 }}
          >
            باقات سياحية{" "}
            <span className="gradient-gold" style={{ fontWeight: 300 }}>
              فاخرة
            </span>
          </h1>

          {/* Sub-text */}
          <p className="font-body-lg text-body-lg text-white/80 mb-10 max-w-2xl mx-auto animate-fade-in-up-delay-2">
            استمتع بتجربة سفر مختلفة مع روائس للسفر والسياحة من خلال رحلات
            سياحية خارجية مليانة متعة واكتشاف.
          </p>

          {/* Stat pills */}
          <div className="flex flex-wrap justify-center gap-6 animate-fade-in-up-delay-3">
            {[
              { icon: "flight_takeoff", value: "+50", label: "وجهة" },
              { icon: "star", value: "5★", label: "تقييم العملاء" },
              { icon: "groups", value: "+1200", label: "رحلة ناجحة" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="glass-dark rounded-2xl px-6 py-3 flex items-center gap-3 border border-white/10"
              >
                <span className="material-symbols-outlined text-secondary-bright text-lg">
                  {stat.icon}
                </span>
                <div className="text-right">
                  <div className="font-headline-md text-headline-md text-white leading-none">
                    {stat.value}
                  </div>
                  <div className="font-label-sm text-label-sm text-white/60 uppercase tracking-wider mt-1">
                    {stat.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-float">
          <span className="font-label-sm text-label-sm text-white/50 uppercase tracking-widest">
            استكشف
          </span>
          <div className="w-px h-12 bg-gradient-to-b from-white/50 to-transparent" />
        </div>
      </section>

      {/* ─── Search / Filter Bar ─────────────────────────────────────── */}
      <section className="relative z-30 -mt-24 px-margin-mobile md:px-margin-desktop">
        <div className="max-w-container-max mx-auto">
          <div className="glass-panel rounded-2xl shadow-2xl overflow-hidden border border-white/60">
            {/* Top accent bar */}
            <div className="h-1 w-full bg-gradient-to-l from-secondary-bright via-secondary to-secondary-bright/50" />

            <div className="p-6 md:p-8 flex flex-col md:flex-row gap-6 items-end">
              {/* Filters */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full flex-grow">
                {/* Destination */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-secondary">
                      location_on
                    </span>
                    الوجهة
                  </label>
                  <div className="relative">
                    <select className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none">
                      <option value="">جميع الوجهات</option>
                      <option value="malaysia">ماليزيا</option>
                      <option value="bosnia">البوسنة</option>
                      <option value="albania">ألبانيا أو كوسوفو</option>
                    </select>

                  </div>
                </div>

                {/* Duration */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-secondary">
                      calendar_month
                    </span>
                    المدة
                  </label>
                  <div className="relative">
                    <select className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none">
                      <option value="">أي مدة</option>
                      <option value="5">5 أيام</option>
                      <option value="8">8 أيام</option>
                      <option value="10+">10+ أيام</option>
                    </select>

                  </div>
                </div>

                {/* Price */}
                <div className="flex flex-col gap-2">
                  <label className="flex items-center gap-2 font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
                    <span className="material-symbols-outlined text-base text-secondary">
                      payments
                    </span>
                    الميزانية (SAR)
                  </label>
                  <div className="relative">
                    <select className="w-full py-3  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 appearance-none font-body-md text-on-surface transition-all cursor-pointer outline-none">
                      <option value="">جميع الأسعار</option>
                      <option value="5000-6000">5,000 – 6,000</option>
                      <option value="6000-7000">6,000 – 7,000</option>
                      <option value="7000+">7,000+</option>
                    </select>

                  </div>
                </div>
              </div>

              {/* Search button */}
              <button className="gold-shimmer w-full md:w-auto bg-gradient-to-l from-primary to-primary/80 text-on-primary px-10 py-3.5 rounded-xl font-label-sm text-label-sm uppercase tracking-widest whitespace-nowrap btn-glow border border-white/10 flex items-center justify-center gap-2">
                <span className="material-symbols-outlined text-sm">search</span>
                البحث عن رحلة
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Packages ────────────────────────────────────────────────── */}
      <section className="pt-24 pb-20 px-margin-mobile md:px-margin-desktop bg-background">
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
            <button className="inline-flex items-center gap-2 text-secondary hover:text-secondary-bright font-label-sm text-label-sm uppercase tracking-widest transition-colors duration-300 group">
              عرض الكل
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-300">
                arrow_left
              </span>
            </button>
          </div>

          {/* Cards grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* ── Card 1: Maldives (Pool Deck) ── */}
            <article className="card-hover group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Maldives Tour"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />

              {/* LTR Layout container overlay for absolute alignment to match reference image */}
              <div className="absolute inset-0 p-7 z-10 select-none pointer-events-none" dir="ltr">
                {/* Top Info */}
                <div className="absolute top-7 left-7 text-left text-shadow-subtle">
                  <span className="text-2xl font-bold text-white tracking-wide">Asia</span>
                  <span className="text-sm font-medium text-white/80 ml-2">Maldives</span>
                </div>
                <div className="absolute top-7 right-7 glass-dark text-white/90 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-white/20">
                  8 أيام
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-7 left-7 pointer-events-auto bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>

                <div className="absolute bottom-7 right-7 text-right text-shadow-subtle">
                  <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-widest">
                    FROM
                  </span>
                  <span className="block text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    5,950 <span className="text-base font-normal text-secondary-bright">SAR</span>
                  </span>
                  <span className="block text-[10px] font-medium text-white/60 uppercase tracking-widest mt-1">
                    PRICE PER PERSON
                  </span>
                </div>
              </div>
            </article>

            {/* ── Card 2: Bosnia (Village Bridge) ── */}
            <article className="card-hover group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Bosnia Tour"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />

              <div className="absolute inset-0 p-7 z-10 select-none pointer-events-none" dir="ltr">
                {/* Top Info */}
                <div className="absolute top-7 left-7 text-left text-shadow-subtle">
                  <span className="text-2xl font-bold text-white tracking-wide">Europe</span>
                  <span className="text-sm font-medium text-white/80 ml-2">Bosnia</span>
                </div>
                <div className="absolute top-7 right-7 glass-dark text-white/90 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-white/20">
                  8 أيام
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-7 left-7 pointer-events-auto bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>

                <div className="absolute bottom-7 right-7 text-right text-shadow-subtle">
                  <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-widest">
                    FROM
                  </span>
                  <span className="block text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    6,666 <span className="text-base font-normal text-secondary-bright">SAR</span>
                  </span>
                  <span className="block text-[10px] font-medium text-white/60 uppercase tracking-widest mt-1">
                    PRICE PER PERSON
                  </span>
                </div>
              </div>
            </article>

            {/* ── Card 3: Albania (Beach Resort) ── */}
            <article className="card-hover group cursor-pointer relative rounded-3xl overflow-hidden aspect-[3/4] shadow-lg border border-white/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                alt="Albania Tour"
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                src="https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/45" />

              <div className="absolute inset-0 p-7 z-10 select-none pointer-events-none" dir="ltr">
                {/* Top Info */}
                <div className="absolute top-7 left-7 text-left text-shadow-subtle">
                  <span className="text-2xl font-bold text-white tracking-wide">Europe</span>
                  <span className="text-sm font-medium text-white/80 ml-2">Albania</span>
                </div>
                <div className="absolute top-7 right-7 glass-dark text-white/90 px-3 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider border border-white/20">
                  5 أيام
                </div>

                {/* Bottom Info */}
                <div className="absolute bottom-7 left-7 pointer-events-auto bg-white/10 hover:bg-white/20 text-white w-10 h-10 rounded-full flex items-center justify-center border border-white/20 transition-all duration-300 group-hover:scale-110">
                  <span className="material-symbols-outlined text-lg">arrow_forward</span>
                </div>

                <div className="absolute bottom-7 right-7 text-right text-shadow-subtle">
                  <span className="block text-[10px] font-semibold text-white/70 uppercase tracking-widest">
                    FROM
                  </span>
                  <span className="block text-3xl font-extrabold text-white tracking-tight mt-0.5">
                    5,400 <span className="text-base font-normal text-secondary-bright">SAR</span>
                  </span>
                  <span className="block text-[10px] font-medium text-white/60 uppercase tracking-widest mt-1">
                    PRICE PER PERSON
                  </span>
                </div>
              </div>
            </article>
          </div>

          {/* View more */}
          <div className="mt-12 text-center">
            <button className="inline-flex items-center gap-2 border border-secondary/40 text-secondary hover:bg-secondary hover:text-on-secondary px-8 py-3 rounded-full font-label-sm text-label-sm uppercase tracking-widest transition-all duration-300 btn-glow group">
              عرض المزيد من الباقات
              <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform duration-300">
                arrow_left
              </span>
            </button>
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
      <section className="relative py-24 px-margin-mobile md:px-margin-desktop overflow-hidden">
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
            <button className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-4 rounded-full font-label-sm text-label-sm uppercase tracking-widest btn-glow inline-flex items-center justify-center gap-3 shadow-lg">
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
