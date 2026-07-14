"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";

type Stats = {
  destinations: number;
  countries: number;
  cities: number;
  saudiAirports: number;
  destinationAirports: number;
  flights: number;
  transports: number;
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/summary")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setStats(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    { label: "الرحلات الدولية المتاحة", value: stats?.flights || 0, icon: "flight_takeoff", color: "from-blue-500/20 to-blue-600/10", link: "/admin/flights" },
    { label: "التنقلات الداخلية بين المدن", value: stats?.transports || 0, icon: "directions_car", color: "from-green-500/20 to-green-600/10", link: "/admin/transports" },
    { label: "المدن المسجلة", value: stats?.cities || 0, icon: "location_city", color: "from-amber-500/20 to-amber-600/10", link: "/admin/cities" },
    { label: "الدول المسجلة", value: stats?.countries || 0, icon: "public", color: "from-purple-500/20 to-purple-600/10", link: "/admin/cities" },
    { label: "الوجهات السياحية", value: stats?.destinations || 0, icon: "map", color: "from-teal-500/20 to-teal-600/10", link: "/admin/cities" },
    { label: "المطارات السعودية", value: stats?.saudiAirports || 0, icon: "flight", color: "from-sky-500/20 to-sky-600/10", link: "/admin/airports" },
    { label: "المطارات المحلية في الوجهات", value: stats?.destinationAirports || 0, icon: "local_airport", color: "from-indigo-500/20 to-indigo-600/10", link: "/admin/airports" },
  ];

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h2 className="text-3xl font-extrabold text-primary mb-2">مرحباً بك في لوحة الإدارة</h2>
        <p className="text-slate-600">نظرة عامة على البيانات الحالية والمسارات السياحية المفعلة.</p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, idx) => (
          <Link
            key={idx}
            href={card.link}
            className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group flex flex-col justify-between h-40"
          >
            <div className="flex justify-between items-start">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center`}>
                <Icon name={card.icon} className="text-secondary text-2xl" />
              </div>
              <span className="text-3xl font-black text-primary tracking-tight">{card.value}</span>
            </div>
            <div className="mt-4">
              <p className="text-sm font-bold text-slate-500">{card.label}</p>
              <p className="text-xs text-secondary-bright mt-1 font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                إدارة البيانات
                <Icon name="arrow_forward" className="text-[10px] transform rotate-180" />
              </p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl mt-8">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
          <Icon name="flash_on" className="text-secondary" />
          روابط الوصول السريع
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <Link
            href="/admin/flights"
            className="flex items-center justify-center gap-3 p-4 bg-primary text-background rounded-xl font-bold hover:shadow-lg transition-all btn-glow"
          >
            <Icon name="add_circle" />
            إضافة تسعيرة رحلة دولية
          </Link>

          <Link
            href="/admin/transports"
            className="flex items-center justify-center gap-3 p-4 bg-primary text-background rounded-xl font-bold hover:shadow-lg transition-all btn-glow"
          >
            <Icon name="add_circle" />
            إضافة تسعيرة تنقل داخلي
          </Link>

          <Link
            href="/admin/cities"
            className="flex items-center justify-center gap-3 p-4 bg-primary text-background rounded-xl font-bold hover:shadow-lg transition-all btn-glow"
          >
            <Icon name="add_circle" />
            إضافة مدينة أو دولة جديدة
          </Link>

          <Link
            href="/admin/airports"
            className="flex items-center justify-center gap-3 p-4 bg-primary text-background rounded-xl font-bold hover:shadow-lg transition-all btn-glow"
          >
            <Icon name="add_circle" />
            إضافة مطار جديد
          </Link>
        </div>
      </div>
    </div>
  );
}
