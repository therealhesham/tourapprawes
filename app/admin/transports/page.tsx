"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type City = { id: string; name: string };
type Transport = {
  id: string;
  transportationName: string;
  approximatePrice: number;
  cityId: string;
  departureCity: City;
  arrivalCityId: string;
  arrivalCity: City;
};

export default function AdminTransportsPage() {
  const confirmDialog = useConfirm();
  const [transports, setTransports] = useState<Transport[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedDepartureCityId, setSelectedDepartureCityId] = useState("");
  const [selectedArrivalCityId, setSelectedArrivalCityId] = useState("");
  const [transportationName, setTransportationName] = useState("");
  const [approximatePrice, setApproximatePrice] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch transports
      const resTransports = await fetch("/api/admin/transports");
      const dataTransports = await resTransports.json();
      if (!dataTransports.error) setTransports(dataTransports);

      // Fetch cities
      const resCities = await fetch("/api/admin/cities");
      const dataCities = await resCities.json();
      if (!dataCities.error) {
        const flattenedCities: City[] = dataCities.flatMap((dest: any) =>
          dest.countries.flatMap((c: any) => c.cities)
        );
        setCities(flattenedCities);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddTransport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDepartureCityId || !selectedArrivalCityId || !transportationName || !approximatePrice) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/transports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cityId: selectedDepartureCityId,
          arrivalCityId: selectedArrivalCityId,
          transportationName,
          approximatePrice
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة تسعيرة النقل الداخلي بنجاح");
        setTransportationName("");
        setApproximatePrice("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!(await confirmDialog("هل أنت متأكد من الحذف؟"))) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/transports?id=${id}`, {
        method: "DELETE"
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم الحذف بنجاح");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ أثناء الحذف");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h2 className="text-3xl font-extrabold text-primary mb-2">إدارة التنقلات الداخلية</h2>
        <p className="text-slate-600">إضافة وتعديل أسعار وسائل النقل المختلفة (قطار، سيارة خاصة، حافلة، إلخ) بين المدن السياحية.</p>
      </div>

      {/* Messages */}
      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Add Form Column */}
        <div className="lg:col-span-1">
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md sticky top-6">
            <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
              <Icon name="add_circle" className="text-secondary" />
              إضافة تسعيرة نقل داخلي
            </h3>

            <form onSubmit={handleAddTransport} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">مدينة المغادرة</label>
                <select
                  required
                  value={selectedDepartureCityId}
                  onChange={(e) => setSelectedDepartureCityId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر مدينة المغادرة...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">مدينة الوصول</label>
                <select
                  required
                  value={selectedArrivalCityId}
                  onChange={(e) => setSelectedArrivalCityId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر مدينة الوصول...</option>
                  {cities.map((city) => (
                    <option key={city.id} value={city.id}>{city.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">وسيلة النقل</label>
                <input
                  type="text"
                  required
                  value={transportationName}
                  onChange={(e) => setTransportationName(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: سيارة خاصة، قطار سريع"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">السعر التقديري (SAR)</label>
                <input
                  type="number"
                  required
                  value={approximatePrice}
                  onChange={(e) => setApproximatePrice(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: 350"
                />
              </div>

              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
              >
                إضافة التسعيرة
              </button>
            </form>
          </div>
        </div>

        {/* Data List Column */}
        <div className="lg:col-span-2">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl min-h-[500px]">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Icon name="directions_car" className="text-secondary" />
              تسعيرات النقل الداخلي المسجلة
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : transports.length === 0 ? (
              <p className="text-slate-500 text-center py-20">لا توجد تسعيرات نقل داخلي مسجلة بعد. استخدم النموذج لإضافة تسعيرة جديدة.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-slate-500">
                      <th className="pb-3 font-bold">المسار (من ← إلى)</th>
                      <th className="pb-3 font-bold">وسيلة النقل</th>
                      <th className="pb-3 font-bold">السعر التقديري</th>
                      <th className="pb-3 font-bold text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transports.map((transport) => (
                      <tr key={transport.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-slate-50/50">
                        <td className="py-4 text-slate-700">
                          <div className="font-bold text-primary">
                            {transport.departureCity?.name} ← {transport.arrivalCity?.name}
                          </div>
                        </td>
                        <td className="py-4 text-slate-700 font-bold">{transport.transportationName}</td>
                        <td className="py-4 font-black text-secondary-bright">
                          {transport.approximatePrice.toLocaleString("en-US")} SAR
                        </td>
                        <td className="py-4 text-left">
                          <button
                            onClick={() => handleDelete(transport.id)}
                            className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer mr-auto"
                          >
                            <Icon name="delete" className="text-xs" />
                            حذف
                          </button>
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
    </div>
  );
}
