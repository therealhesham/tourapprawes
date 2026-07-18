"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Icon from "@/components/Icon";

const sidebarLinks = [
  { label: "لوحة التحكم", href: "/admin", icon: "dashboard" },
  { label: "رحلات العملاء", href: "/admin/client-trips", icon: "assignment" },
  { label: "الباقات الجاهزة", href: "/admin/packages", icon: "card_travel" },
  { label: "الرحلات الدولية", href: "/admin/flights", icon: "flight_takeoff" },
  { label: "التنقلات الداخلية", href: "/admin/transports", icon: "directions_car" },
  { label: "المدن والوجهات", href: "/admin/cities", icon: "location_city" },
  { label: "إدارة المطارات", href: "/admin/airports", icon: "local_airport" },
  { label: "الموظفون", href: "/admin/staff", icon: "admin_panel_settings" },
];

const crmLinks = [
  { label: "لوحة خدمة العملاء", href: "/admin/crm", icon: "contact_phone" },
  { label: "العملاء", href: "/admin/crm/customers", icon: "person" },
  { label: "تذاكر الدعم", href: "/admin/crm/tickets", icon: "sms" },
];

const accountingLinks = [
  { label: "لوحة المحاسبة", href: "/admin/accounting", icon: "account_balance" },
  { label: "الفواتير الضريبية", href: "/admin/accounting/invoices", icon: "receipt_long" },
  { label: "سندات القبض", href: "/admin/accounting/receipts", icon: "download" },
  { label: "سندات الصرف", href: "/admin/accounting/payments", icon: "upload" },
  { label: "فواتير الموردين", href: "/admin/accounting/purchases", icon: "shopping_cart" },
  { label: "القيود اليومية", href: "/admin/accounting/journal", icon: "edit_note" },
  { label: "شجرة الحسابات", href: "/admin/accounting/accounts", icon: "account_tree" },
  { label: "التقارير المالية", href: "/admin/accounting/reports", icon: "monitoring" },
  { label: "إعدادات المحاسبة", href: "/admin/accounting/settings", icon: "settings" },
];

function NavGroup({
  links,
  title,
  pathname,
}: {
  links: { label: string; href: string; icon: string }[];
  title?: string;
  pathname: string;
}) {
  return (
    <>
      {title && (
        <p className="px-4 pt-5 pb-1 text-xs font-black text-white/40 tracking-wider">{title}</p>
      )}
      {links.map((link) => {
        const isActive = pathname === link.href;
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-bold ${isActive
              ? "bg-white text-primary shadow-md"
              : "text-white/80 hover:bg-white/5 hover:text-white"
              }`}
          >
            <Icon name={link.icon} className="text-xl" />
            <span>{link.label}</span>
          </Link>
        );
      })}
    </>
  );
}

// Shared between the fixed desktop sidebar and the mobile drawer
function SidebarContent({ pathname }: { pathname: string }) {
  return (
    <>
      {/* Logo and Brand */}
      <div className="p-6 border-b border-white/10 flex justify-between items-center">
        <Link href="/admin" className="flex items-center mx-auto">
          <Image
            src="/logo-main.png"
            alt="Rawaes Logo"
            width={300}
            height={80}
            className="h-24 md:h-32 w-auto object-contain brightness-0 invert"
          />
        </Link>
      </div>

      {/* Links */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-2 md:mt-4">
        <NavGroup links={sidebarLinks} pathname={pathname} />
        <NavGroup links={crmLinks} title="خدمة العملاء" pathname={pathname} />
        <NavGroup links={accountingLinks} title="المحاسبة" pathname={pathname} />
      </nav>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-white/80 hover:bg-white/5 hover:text-white"
        >
          <Icon name="open_in_new" className="text-xl" />
          <span>عرض موقع العميل</span>
        </Link>

        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-red-400 hover:bg-red-500/10 hover:text-red-300 cursor-pointer text-right"
        >
          <Icon name="logout" className="text-xl" />
          <span>تسجيل الخروج</span>
        </button>
      </div>
    </>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();
  const [menuOpen, setMenuOpen] = useState(false);

  // Navigating (link tap) closes the mobile drawer
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  // If session is loading, show loading screen
  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-secondary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-600 font-bold">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    );
  }

  // NextAuth middleware protects /admin/*, but just in case, don't show layout if unauthenticated
  if (status === "unauthenticated" && pathname !== "/admin/login") {
    return null;
  }

  // Bypass layout wrapper on the login page
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-background flex" dir="rtl">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 bg-primary text-white border-l border-white/10 shrink-0 relative flex-col">
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Mobile drawer + backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 backdrop-blur-sm transition-opacity md:hidden ${
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setMenuOpen(false)}
      />
      <aside
        className={`fixed inset-y-0 right-0 z-50 w-72 max-w-[85vw] bg-primary text-white flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <button
          onClick={() => setMenuOpen(false)}
          className="absolute top-4 left-4 text-white/70 hover:text-white p-2"
          aria-label="إغلاق القائمة"
        >
          <Icon name="close" className="text-2xl" />
        </button>
        <SidebarContent pathname={pathname} />
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="glass-panel border-b border-outline-variant/30 h-16 shrink-0 flex items-center justify-between px-4 md:px-6 z-30 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            {/* Burger — mobile only */}
            <button
              onClick={() => setMenuOpen(true)}
              className="md:hidden p-2 -mr-2 text-primary hover:bg-primary/5 rounded-xl"
              aria-label="فتح القائمة"
            >
              <Icon name="menu" className="text-2xl" />
            </button>
            <Icon name="admin_panel_settings" className="hidden sm:inline text-secondary text-2xl shrink-0" />
            <h1 className="text-base md:text-lg font-bold text-primary truncate">
              لوحة إدارة السفر والسياحة
            </h1>
          </div>

          {/* <div className="flex items-center gap-2 shrink-0">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-600 text-sm font-bold truncate max-w-[120px] sm:max-w-none">
              متصل: {session?.user?.name || "المسؤول"}
            </span>
          </div> */}
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-surface-container/30 relative">
          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-full h-[500px] pointer-events-none opacity-[0.03] overflow-hidden">
            <div className="w-[500px] h-[500px] rounded-full blur-[100px] bg-secondary-bright absolute -top-40 -left-40" />
          </div>
          <div className="relative z-10">{children}</div>
        </main>
      </div>
    </div>
  );
}
