"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

export interface NavLink {
  label: string;
  href: string;
  id: string;
}

interface NavbarProps {
  links?: NavLink[];
  activeLinkId?: string;
  primaryCtaText?: string;
  onPrimaryCtaClick?: () => void;
  secondaryCtaText?: string;
  onSecondaryCtaClick?: () => void;
}

const DEFAULT_LINKS: NavLink[] = [
  { label: "رئيسية", href: "/", id: "home" },
  { label: "الباقات", href: "/packages", id: "packages" },
  { label: "وجهات", href: "/#destinations", id: "destinations" },
  { label: "اتصل بنا", href: "/#contact", id: "contact" },
];

export default function Navbar({
  links = DEFAULT_LINKS,
  activeLinkId = "tours",
  primaryCtaText = "احجز الآن",
  onPrimaryCtaClick,
  secondaryCtaText = "تسجيل الدخول",
  onSecondaryCtaClick,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500">
      <div className="glass-panel border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-3 md:py-4 w-full max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center shrink-0">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={340}
              height={116}
              className="h-10 sm:h-12 md:h-20 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
            />
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-8">
            {links.map((item) => {
              const isActive = item.id === activeLinkId;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={`relative font-bold text-lg tracking-widest uppercase transition-colors duration-300 group ${
                    isActive
                      ? "text-secondary"
                      : "text-primary/75 hover:text-primary"
                  }`}
                >
                  {item.label}
                  <span
                    className={`absolute -bottom-2 right-0 h-px bg-gradient-to-l from-secondary-bright to-secondary transition-all duration-300 ${
                      isActive ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              );
            })}
          </nav>

          {/* CTA & Menu Toggle */}
          <div className="flex items-center gap-2 md:gap-4">
            {onSecondaryCtaClick ? (
              <button
                onClick={onSecondaryCtaClick}
                className="hidden md:block text-primary/75 hover:text-primary font-bold text-lg tracking-widest uppercase transition-colors duration-300 cursor-pointer"
              >
                {secondaryCtaText}
              </button>
            ) : (
              <button className="hidden md:block text-primary/75 hover:text-primary font-bold text-lg tracking-widest uppercase transition-colors duration-300">
                {secondaryCtaText}
              </button>
            )}
            
            {onPrimaryCtaClick ? (
              <button
                onClick={onPrimaryCtaClick}
                className="gold-shimmer bg-primary text-background px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg uppercase tracking-widest btn-glow cursor-pointer"
              >
                {primaryCtaText}
              </button>
            ) : (
              <Link href="/packages" className="gold-shimmer bg-primary text-background px-4 py-2 sm:px-6 sm:py-2.5 md:px-8 md:py-3 rounded-full font-bold text-sm sm:text-base md:text-lg uppercase tracking-widest btn-glow inline-block text-center">
                {primaryCtaText}
              </Link>
            )}

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden flex items-center justify-center p-2 text-primary/75 hover:text-primary transition-colors cursor-pointer"
              aria-label="Toggle menu"
            >
              <span className="material-symbols-outlined text-2xl sm:text-3xl">
                {isMobileMenuOpen ? "close" : "menu"}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-x-0 bottom-0 top-[64px] sm:top-[72px] bg-background/95 backdrop-blur-md z-40 border-t border-outline-variant/30 flex flex-col justify-between p-6 overflow-y-auto">
          <nav className="flex flex-col gap-6 text-right py-4">
            {links.map((item) => {
              const isActive = item.id === activeLinkId;
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`text-xl font-bold tracking-widest uppercase py-2 transition-colors border-b border-outline-variant/10 ${
                    isActive ? "text-secondary font-extrabold" : "text-primary/75"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
          
          <div className="flex flex-col gap-4 pb-8">
            {onSecondaryCtaClick ? (
              <button
                onClick={() => {
                  onSecondaryCtaClick();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full text-center text-primary/75 font-bold text-lg py-3 border border-outline-variant/30 rounded-full cursor-pointer hover:bg-surface-variant/50"
              >
                {secondaryCtaText}
              </button>
            ) : (
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full text-center text-primary/75 font-bold text-lg py-3 border border-outline-variant/30 rounded-full hover:bg-surface-variant/50"
              >
                {secondaryCtaText}
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

