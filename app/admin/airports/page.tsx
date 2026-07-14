"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

type City = { id: string; name: string };
type Airport = { id: string; airportName: string; cityId: string; city: City };

export default function AdminAirportsPage() {
  const [saudiAirports, setSaudiAirports] = useState<Airport[]>([]);
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [saudiCityId, setSaudiCityId] = useState("");
  const [saudiAirportName, setSaudiAirportName] = useState("");

  const [destCityId, setDestCityId] = useState("");
  const [destAirportName, setDestAirportName] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch airports
      const resAirports = await fetch("/api/admin/airports");
      const dataAirports = await resAirports.json();
      if (!dataAirports.error) {
        setSaudiAirports(dataAirports.saudiAirports || []);
        setDestinationAirports(dataAirports.destinationAirports || []);
      }

      // Fetch all cities (to populate selects)
      const resCities = await fetch("/api/admin/cities");
      const dataCities = await resCities.json();
      if (!dataCities.error) {
        // Flatten destinations -> countries -> cities
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

  const handleAddSaudi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saudiCityId || !saudiAirportName) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/airports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "saudi", airportName: saudiAirportName, cityId: saudiCityId })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة المطار السعودي بنجاح");
        setSaudiAirportName("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!destCityId || !destAirportName) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/airports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "destination", airportName: destAirportName, cityId: destCityId })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة مطار الوجهة بنجاح");
        setDestAirportName("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/airports?id=${id}&type=${type}`, {
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
        <h2 className="text-3xl font-extrabold text-primary mb-2">إدارة مطارات السفر</h2>
        <p className="text-slate-600">إضافة وإدارة المطارات المحلية (مطارات السعودية) والمطارات الخارجية في وجهات السفر المختلفة.</p>
      </div>

      {/* Messages */}
      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      {/* Forms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

        {/* Saudi Airport Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Icon name="flight_takeoff" className="text-secondary" />
            إضافة مطار مغادرة (داخل السعودية)
          </h3>

          <form onSubmit={handleAddSaudi} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">المدينة السعودية</label>
              <select
                required
                value={saudiCityId}
                onChange={(e) => setSaudiCityId(e.target.value)}
                className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
              >
                <option value="">اختر المدينة...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">اسم المطار</label>
              <input
                type="text"
                required
                value={saudiAirportName}
                onChange={(e) => setSaudiAirportName(e.target.value)}
                className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                placeholder="مثال: مطار الملك عبد العزيز الدولي"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
            >
              إضافة مطار مغادرة
            </button>
          </form>
        </div>

        {/* Destination Airport Form */}
        <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
          <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
            <Icon name="flight_land" className="text-secondary" />
            إضافة مطار وصول (خارجي / في الوجهة)
          </h3>

          <form onSubmit={handleAddDestination} className="space-y-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">المدينة الخارجية</label>
              <select
                required
                value={destCityId}
                onChange={(e) => setDestCityId(e.target.value)}
                className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
              >
                <option value="">اختر المدينة...</option>
                {cities.map((city) => (
                  <option key={city.id} value={city.id}>{city.name}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">اسم المطار</label>
              <input
                type="text"
                required
                value={destAirportName}
                onChange={(e) => setDestAirportName(e.target.value)}
                className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                placeholder="مثال: مطار كوالالمبور الدولي"
              />
            </div>

            <button
              type="submit"
              disabled={actionLoading}
              className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
            >
              إضافة مطار وصول
            </button>
          </form>
        </div>

      </div>

      {/* Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        {/* Saudi Airports Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl">
          <h3 className="text-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <Icon name="flight_takeoff" className="text-secondary" />
            مطارات المغادرة السعودية المسجلة
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : saudiAirports.length === 0 ? (
            <p className="text-slate-500 text-center py-10 text-sm">لا توجد مطارات سعودية مسجلة بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-slate-500">
                    <th className="pb-3 font-bold">المطار</th>
                    <th className="pb-3 font-bold">المدينة</th>
                    <th className="pb-3 font-bold text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {saudiAirports.map((airport) => (
                    <tr key={airport.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-primary">{airport.airportName}</td>
                      <td className="py-3.5 text-slate-700">{airport.city?.name}</td>
                      <td className="py-3.5 text-left">
                        <button
                          onClick={() => handleDelete(airport.id, "saudi")}
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

        {/* Destination Airports Table */}
        <div className="glass-panel p-6 rounded-3xl border border-white/60 shadow-xl">
          <h3 className="text-lg font-bold text-primary mb-4 border-b border-outline-variant/30 pb-3 flex items-center gap-2">
            <Icon name="flight_land" className="text-secondary" />
            مطارات الوصول الخارجية المسجلة
          </h3>

          {loading ? (
            <div className="flex justify-center items-center py-10">
              <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : destinationAirports.length === 0 ? (
            <p className="text-slate-500 text-center py-10 text-sm">لا توجد مطارات خارجية مسجلة بعد.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-right">
                <thead>
                  <tr className="border-b border-outline-variant/20 text-slate-500">
                    <th className="pb-3 font-bold">المطار</th>
                    <th className="pb-3 font-bold">المدينة</th>
                    <th className="pb-3 font-bold text-left">إجراءات</th>
                  </tr>
                </thead>
                <tbody>
                  {destinationAirports.map((airport) => (
                    <tr key={airport.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-slate-50/50">
                      <td className="py-3.5 font-bold text-primary">{airport.airportName}</td>
                      <td className="py-3.5 text-slate-700">{airport.city?.name}</td>
                      <td className="py-3.5 text-left">
                        <button
                          onClick={() => handleDelete(airport.id, "destination")}
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
  );
}
