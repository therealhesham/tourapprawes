"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type CompanyPackage = {
  id: string;
  name: string;
  title: string;
  description: string;
  pricing: number;
  originalPricing: number | null;
  days: string;
  image: string;
  popular: boolean;
  rating: number;
  reviews: number;
  features: any; // JSON array
  includesText: string;
  countryCode: string | null;
  destinationCode: string | null;
  departingFlight?: any;
  returningFlight?: any;
  cityStays?: any;
};

export default function AdminPackagesPage() {
  const confirmDialog = useConfirm();
  const [packages, setPackages] = useState<CompanyPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadPackages = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/packages");
      const data = await res.json();
      if (!data.error) {
        setPackages(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog("هل أنت متأكد من حذف هذه الباقة؟"))) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/packages?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم حذف الباقة بنجاح.");
        loadPackages();
      }
    } catch (err) {
      setError("حدث خطأ أثناء حذف الباقة.");
    } finally {
      setActionLoading(false);
    }
  };

  const countryLabels: Record<string, string> = {
    id: "إندونيسيا",
    mv: "المالديف",
    eg: "مصر",
    tr: "تركيا",
    my: "ماليزيا",
  };

  return (
    <div className="space-y-8 text-right animate-fade-in-up" dir="rtl">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary mb-2 border-r-4 border-secondary pr-3">إدارة الباقات الجاهزة (الباقات المجهزة)</h2>
          <p className="text-slate-600">إضافة وتعديل الباقات الجاهزة التي تظهر للعملاء في صفحة الباقات الأمامية.</p>
        </div>
        <Link
          href="/admin/packages/new"
          className="py-3 px-6 bg-primary text-background font-bold rounded-xl hover:opacity-95 shadow-md btn-glow flex items-center gap-2 cursor-pointer text-sm"
        >
          <Icon name="add_circle" className="text-lg" />
          إضافة باقة جديدة
        </Link>
      </div>

      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      <div className="w-full">
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-md min-h-[500px]">
          <h3 className="text-lg font-bold text-primary mb-5 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Icon name="card_travel" className="text-secondary" />
            قائمة الباقات الجاهزة النشطة
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-slate-500 text-center py-20">لا توجد باقات جاهزة مضافة حالياً.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-500 font-bold">
                    <th className="pb-3 pr-2">الباقة والوجهة</th>
                    <th className="pb-3">البلد</th>
                    <th className="pb-3">المدة</th>
                    <th className="pb-3">السعر الحالي</th>
                    <th className="pb-3">التقييم</th>
                    <th className="pb-3 text-left pl-2">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {packages.map((pkg) => (
                    <tr key={pkg.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-4 pr-2">
                        <div className="font-bold text-primary">{pkg.title}</div>
                        <div className="text-xs text-slate-400 mt-1">{pkg.name}</div>
                        <div className="flex flex-wrap gap-1.5 mt-1.5">
                          {pkg.departingFlight && (
                            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5" title={pkg.departingFlight.airWayName}>
                              <Icon name="flight_takeoff" className="text-[10px]" />
                              ذهاب
                            </span>
                          )}
                          {pkg.returningFlight && (
                            <span className="text-[10px] bg-slate-50 border border-slate-200 text-slate-600 px-1.5 py-0.5 rounded flex items-center gap-0.5" title={pkg.returningFlight.airWayName}>
                              <Icon name="flight_land" className="text-[10px]" />
                              عودة
                            </span>
                          )}
                          {Array.isArray(pkg.cityStays) && pkg.cityStays.length > 0 && (
                            <span className="text-[10px] bg-secondary/15 text-secondary px-1.5 py-0.5 rounded font-black flex items-center gap-0.5">
                              <Icon name="location_city" className="text-[10px]" />
                              {pkg.cityStays.length} مدن
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 text-slate-700 font-medium">
                        {pkg.countryCode ? countryLabels[pkg.countryCode] || pkg.countryCode : "غير محدد"}
                      </td>
                      <td className="py-4 text-slate-600 text-xs">{pkg.days}</td>
                      <td className="py-4 text-secondary-bright font-black">{pkg.pricing.toLocaleString()} ر.س</td>
                      <td className="py-4 text-secondary text-xs">
                        <div className="flex items-center gap-0.5">
                          <Icon name="star" className="text-[14px]" />
                          <span>{pkg.rating} ({pkg.reviews})</span>
                        </div>
                      </td>
                      <td className="py-4 text-left pl-2">
                        <div className="flex items-center gap-3 justify-end">
                          <Link
                            href={`/admin/packages/new?id=${pkg.id}`}
                            className="text-secondary hover:text-secondary-bright font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Icon name="edit" className="text-sm" />
                            تعديل
                          </Link>
                          <button
                            onClick={() => handleDelete(pkg.id)}
                            disabled={actionLoading}
                            className="text-red-500 hover:text-red-700 font-bold text-xs flex items-center gap-1 cursor-pointer"
                          >
                            <Icon name="delete" className="text-sm" />
                            حذف
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
