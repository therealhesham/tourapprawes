"use client";

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
  return (
    <header className="fixed top-0 inset-x-0 z-50 transition-all duration-500">
      <div className="glass-panel border-b border-outline-variant/30 shadow-sm">
        <div className="flex justify-between items-center px-margin-mobile md:px-margin-desktop py-4 w-full max-w-container-max mx-auto">
          {/* Logo */}
          <Link href="/" className="flex items-center">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={340}
              height={116}
              className="h-28 md:h-32 w-auto object-contain opacity-95 hover:opacity-100 transition-opacity"
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

          {/* CTA */}
          <div className="flex items-center gap-4">
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
                className="gold-shimmer bg-primary text-background px-8 py-3 rounded-full font-bold text-lg uppercase tracking-widest btn-glow cursor-pointer"
              >
                {primaryCtaText}
              </button>
            ) : (
              <button className="gold-shimmer bg-primary text-background px-8 py-3 rounded-full font-bold text-lg uppercase tracking-widest btn-glow">
                {primaryCtaText}
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
