"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import Icon from "@/components/Icon";

interface NavbarProps {
  theme?: "light" | "dark";
}

export default function Navbar({ theme = "light" }: NavbarProps) {
  const pathname = usePathname();
  const { status } = useSession();
  const isDark = theme === "dark";
  const [menuOpen, setMenuOpen] = useState(false);

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

  const getMobileLinkClasses = (path: string) => {
    const isActive = pathname === path || (path !== "/" && pathname?.startsWith(path));
    if (isDark) {
      return isActive
        ? "flex items-center gap-3 text-white font-bold text-base bg-white/20 px-4 py-3 rounded-2xl transition-all"
        : "flex items-center gap-3 text-white/80 hover:text-white hover:bg-white/10 font-medium text-base px-4 py-3 rounded-2xl transition-all";
    }
    return isActive
      ? "flex items-center gap-3 text-primary font-bold text-base bg-primary/5 px-4 py-3 rounded-2xl transition-all"
      : "flex items-center gap-3 text-gray-600 hover:text-primary hover:bg-gray-50 font-medium text-base px-4 py-3 rounded-2xl transition-all";
  };

  const navLinks = [
    { href: "/", icon: "home", label: "الرئيسية" },
    { href: "/packages", icon: "travel_explore", label: "الباقات" },
    { href: "/booking", icon: "luggage", label: "حجوزاتي" },
    { href: "#", icon: "favorite", label: "المفضلة", activePath: "/favorites" },
  ];

  return (
    <nav className={isDark ? "px-6 md:px-12" : "relative z-50 pt-6 px-6 md:px-12 flex-shrink-0"}>
      <div className="max-w-[1400px] mx-auto relative">
        <div className={`flex justify-between items-center backdrop-blur-md py-4 px-6 rounded-full border ${containerBg}`}>
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className={isDark ? "text-2xl font-black text-white tracking-wide flex items-center gap-2" : "text-2xl font-black text-primary tracking-wide flex items-center gap-2"}>
              <Image
                src="/logo-main.png"
                alt="Rawaes Logo"
                width={697}
                height={238}
                className={`h-[56px] w-auto object-contain opacity-95 hover:opacity-100 transition-opacity `}
              />
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link key={link.label} href={link.href} className={getLinkClasses(link.activePath ?? link.href)}>
                <Icon name={link.icon} className="text-[18px]" />
                {link.label}
              </Link>
            ))}
            {status === "authenticated" ? (
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className={getLinkClasses("/logout")}
              >
                <Icon name="logout" className="text-[18px]" />
                تسجيل الخروج
              </button>
            ) : (
              <Link href="/login" className={getLinkClasses("/login")}>
                <Icon name="person" className="text-[18px]" />
                تسجيل الدخول
              </Link>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3">
            <Link
              href="/booking/wizard"
              className={`hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full font-bold text-sm transition-all shadow-md ${isDark
                ? "bg-white text-primary hover:bg-slate-100"
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
                }`}
            >
              <Icon name="edit_calendar" className="text-[18px]" />
              صمم باقتك
            </Link>

            {/* Burger button (mobile only) */}
            <button
              onClick={() => setMenuOpen((open) => !open)}
              aria-label={menuOpen ? "إغلاق القائمة" : "فتح القائمة"}
              aria-expanded={menuOpen}
              className={`md:hidden flex h-11 w-11 items-center justify-center rounded-full transition-all ${isDark
                ? "bg-white/15 text-white hover:bg-white/25"
                : "bg-primary/5 text-primary hover:bg-primary/10"
                }`}
            >
              <span className="relative flex h-4 w-5 flex-col justify-between" aria-hidden="true">
                <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${menuOpen ? "translate-y-[7px] rotate-45" : ""}`} />
                <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`} />
                <span className={`h-0.5 w-full rounded-full bg-current transition-all duration-300 ${menuOpen ? "-translate-y-[7px] -rotate-45" : ""}`} />
              </span>
            </button>
          </div>
        </div>

        {/* Mobile menu panel */}
        <div
          className={`md:hidden absolute inset-x-0 top-full mt-3 z-50 origin-top transition-all duration-300 ${menuOpen
            ? "pointer-events-auto scale-100 opacity-100 translate-y-0"
            : "pointer-events-none scale-95 opacity-0 -translate-y-2"
            }`}
        >
          <div className={`rounded-3xl border p-3 backdrop-blur-xl shadow-[0_20px_60px_rgba(12,17,32,0.18)] ${isDark
            ? "bg-[#0c1120]/90 border-white/10"
            : "bg-white/95 border-gray-100"
            }`}
          >
            <div className="flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={getMobileLinkClasses(link.activePath ?? link.href)}
                >
                  <Icon name={link.icon} className="text-[20px]" />
                  {link.label}
                </Link>
              ))}
              {status === "authenticated" ? (
                <button
                  onClick={() => {
                    setMenuOpen(false);
                    signOut({ callbackUrl: "/" });
                  }}
                  className={getMobileLinkClasses("/logout")}
                >
                  <Icon name="logout" className="text-[20px]" />
                  تسجيل الخروج
                </button>
              ) : (
                <Link
                  href="/login"
                  onClick={() => setMenuOpen(false)}
                  className={getMobileLinkClasses("/login")}
                >
                  <Icon name="person" className="text-[20px]" />
                  تسجيل الدخول
                </Link>
              )}
            </div>

            <div className={`my-3 h-px w-full ${isDark ? "bg-white/10" : "bg-gray-100"}`} />

            <Link
              href="/booking/wizard"
              onClick={() => setMenuOpen(false)}
              className={`flex items-center justify-center gap-2 rounded-2xl px-6 py-3.5 font-bold text-sm transition-all shadow-md ${isDark
                ? "bg-white text-primary hover:bg-slate-100"
                : "bg-primary text-white hover:bg-primary/90 shadow-primary/30"
                }`}
            >
              <Icon name="edit_calendar" className="text-[18px]" />
              صمم باقتك
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
