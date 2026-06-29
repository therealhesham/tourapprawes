"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface NavbarProps {
  theme?: "light" | "dark";
}

export default function Navbar({ theme = "light" }: NavbarProps) {
  const pathname = usePathname();
  const isDark = theme === "dark";

  const containerBg = isDark
    ? "bg-white/10 border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.1)] text-white"
    : "bg-white/80 border-gray-100 shadow-[0_4px_30px_rgba(0,0,0,0.03)] text-primary";

  const getLinkClasses = (path: string) => {
    const isActive = pathname === path || (path !== "/" && pathname?.startsWith(path));
    if (isDark) {
      if (isActive) {
        return "flex items-center gap-2 text-white font-bold text-sm bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm hover:bg-white/30 transition-all";
      }
      return "flex items-center gap-2 text-white/80 hover:text-white font-medium text-sm transition-colors";
    } else {
      if (isActive) {
        return "flex items-center gap-2 text-primary font-bold text-sm bg-gray-100 px-4 py-2 rounded-full transition-all";
      }
      return "flex items-center gap-2 text-gray-500 hover:text-primary font-medium text-sm transition-colors";
    }
  };

  return (
    <nav className={isDark ? "px-6 md:px-12" : "relative z-50 pt-6 px-6 md:px-12 flex-shrink-0"}>
      <div className={`max-w-[1400px] mx-auto flex justify-between items-center backdrop-blur-md py-4 px-6 rounded-full border ${containerBg}`}>
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className={isDark ? "text-2xl font-black text-white tracking-wide flex items-center gap-2" : "text-2xl font-black text-primary tracking-wide flex items-center gap-2"}>
            <Image
              src="/Untitled-3.png"
              alt="Rawaes Logo"
              width={450}
              height={153}
              className={`h-[50px] sm:h-[50px] md:h-[50px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity `}
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <div className="hidden md:flex items-center gap-8">
          <Link href="/" className={getLinkClasses("/")}>
            <span className="material-symbols-outlined text-[18px]">home</span>
            الرئيسية
          </Link>
          <Link href="/packages" className={getLinkClasses("/packages")}>
            <span className="material-symbols-outlined text-[18px]">travel_explore</span>
            الباقات
          </Link>
          <Link href="/booking" className={getLinkClasses("/booking")}>
            <span className="material-symbols-outlined text-[18px]">luggage</span>
            حجوزاتي
          </Link>
          <Link href="#" className={getLinkClasses("/favorites")}>
            <span className="material-symbols-outlined text-[18px]">favorite</span>
            المفضلة
          </Link>
          <Link href="#" className={getLinkClasses("/account")}>
            <span className="material-symbols-outlined text-[18px]">person</span>
            حسابي
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          <Link
            href="/booking/wizard"
            className={`flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${isDark
                ? "bg-white text-primary hover:bg-slate-100"
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
              }`}
          >
            <span className="material-symbols-outlined text-[18px]">edit_calendar</span>
            صمم باقتك
          </Link>
        </div>
      </div>
    </nav>
  );
}

