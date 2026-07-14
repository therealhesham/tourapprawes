"use client";

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

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session, status } = useSession();

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
    <div className="min-h-screen bg-background flex flex-col md:flex-row-reverse" dir="rtl">
      {/* Sidebar */}
      <aside className="w-full md:w-64 bg-primary text-white border-l border-white/10 shrink-0 relative flex flex-col">
        {/* Logo and Brand */}
        <div className="p-6 border-b border-white/10 flex justify-between items-center">
          <Link href="/admin" className="flex items-center mx-auto">
            <Image
              src="/logo.png"
              alt="Rawaes Logo"
              width={300}
              height={80}
              className="h-32 w-auto object-contain brightness-0 invert"
            />
          </Link>
        </div>

        {/* Links */}
        <nav className="flex-1 p-4 space-y-2 mt-4">
          {sidebarLinks.map((link) => {
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

          <p className="px-4 pt-5 pb-1 text-xs font-black text-white/40 tracking-wider">المحاسبة</p>
          {accountingLinks.map((link) => {
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
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header className="glass-panel border-b border-outline-variant/30 h-16 shrink-0 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-3">
            <Icon name="admin_panel_settings" className="text-secondary text-2xl" />
            <h1 className="text-lg font-bold text-primary">لوحة إدارة السفر والسياحة</h1>
          </div>

          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
            <span className="text-slate-600 text-sm font-bold">
              متصل: {session?.user?.name || "المسؤول"}
            </span>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-surface-container/30 relative">
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
