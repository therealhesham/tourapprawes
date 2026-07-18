"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";
import { useConfirm } from "@/components/ConfirmDialog";

type City = { id: string; name: string };
type Country = { id: string; name: string; cities: City[] };
type Destination = { id: string; destination: string; countries: Country[] };

export default function AdminCitiesPage() {
  const confirmDialog = useConfirm();
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [loading, setLoading] = useState(true);

  // Forms states
  const [newDest, setNewDest] = useState("");

  const [selectedDestId, setSelectedDestId] = useState("");
  const [newCountry, setNewCountry] = useState("");

  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [newCity, setNewCity] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = () => {
    setLoading(true);
    fetch("/api/admin/cities")
      .then((res) => res.json())
      .then((data) => {
        if (!data.error) setDestinations(data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDest) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "destination", destination: newDest })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة الوجهة بنجاح");
        setNewDest("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCountry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCountry || !selectedDestId) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "country", name: newCountry, destinationId: selectedDestId })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة الدولة بنجاح");
        setNewCountry("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCity || !selectedCountryId) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "city", name: newCity, countryId: selectedCountryId })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة المدينة بنجاح");
        setNewCity("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string, type: string) => {
    if (!(await confirmDialog("هل أنت متأكد من الحذف؟"))) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/cities?id=${id}&type=${type}`, {
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

  // Flattened lists for selectors
  const allCountries = destinations.flatMap((d) => d.countries);

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h2 className="text-3xl font-extrabold text-primary mb-2">المدن والوجهات السياحية</h2>
        <p className="text-slate-600">إدارة القارات/الوجهات، الدول والمدن التابعة لها لتسهيل تخطيط المسارات.</p>
      </div>

      {/* Messages */}
      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      {/* Grid: Forms and List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left Side: Forms Column */}
        <div className="lg:col-span-1 space-y-6">

          {/* Add Destination */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
            <h3 className="text-lg font-bold text-primary mb-4">إضافة وجهة رئيسية (قارة)</h3>
            <form onSubmit={handleAddDestination} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">اسم الوجهة / القارة</label>
                <input
                  type="text"
                  required
                  value={newDest}
                  onChange={(e) => setNewDest(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: أوروبا، آسيا"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
              >
                إضافة وجهة
              </button>
            </form>
          </div>

          {/* Add Country */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
            <h3 className="text-lg font-bold text-primary mb-4">إضافة دولة</h3>
            <form onSubmit={handleAddCountry} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">الوجهة الرئيسية</label>
                <select
                  required
                  value={selectedDestId}
                  onChange={(e) => setSelectedDestId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر الوجهة...</option>
                  {destinations.map((d) => (
                    <option key={d.id} value={d.id}>{d.destination}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">اسم الدولة</label>
                <input
                  type="text"
                  required
                  value={newCountry}
                  onChange={(e) => setNewCountry(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: ماليزيا، البوسنة"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
              >
                إضافة دولة
              </button>
            </form>
          </div>

          {/* Add City */}
          <div className="glass-panel p-6 rounded-2xl border border-white/60 shadow-md">
            <h3 className="text-lg font-bold text-primary mb-4">إضافة مدينة</h3>
            <form onSubmit={handleAddCity} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">الدولة</label>
                <select
                  required
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر الدولة...</option>
                  {allCountries.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">اسم المدينة</label>
                <input
                  type="text"
                  required
                  value={newCity}
                  onChange={(e) => setNewCity(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: كوالالمبور، سراييفو"
                />
              </div>
              <button
                type="submit"
                disabled={actionLoading}
                className="w-full bg-primary text-background py-2.5 rounded-xl font-bold text-sm btn-glow cursor-pointer disabled:opacity-50"
              >
                إضافة مدينة
              </button>
            </form>
          </div>

        </div>

        {/* Right Side: Data List Column */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl min-h-[500px]">
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
              <Icon name="list_alt" className="text-secondary" />
              الوجهات والدول المسجلة
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : destinations.length === 0 ? (
              <p className="text-slate-500 text-center py-20">لا توجد بيانات مسجلة بعد. ابدأ بإضافة قارة أو وجهة سياحية.</p>
            ) : (
              <div className="space-y-6">
                {destinations.map((dest) => (
                  <div key={dest.id} className="p-5 bg-surface-container/20 rounded-2xl border border-slate-100/50">

                    {/* Destination Title */}
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-black text-primary flex items-center gap-2">
                        <Icon name="map" className="text-secondary text-base" />
                        {dest.destination}
                      </span>
                      <button
                        onClick={() => handleDelete(dest.id, "destination")}
                        className="text-red-500 hover:text-red-700 text-sm font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <Icon name="delete" className="text-sm" />
                        حذف
                      </button>
                    </div>

                    {/* Countries within Destination */}
                    {dest.countries.length === 0 ? (
                      <p className="text-slate-400 text-xs mr-6">لا توجد دول مضافة في هذه الوجهة.</p>
                    ) : (
                      <div className="mr-6 space-y-4 border-r border-slate-200/50 pr-4">
                        {dest.countries.map((c) => (
                          <div key={c.id} className="bg-white/40 p-4 rounded-xl border border-slate-100">

                            {/* Country Header */}
                            <div className="flex justify-between items-center mb-2">
                              <span className="font-bold text-primary flex items-center gap-2">
                                <Icon name="public" className="text-secondary text-sm" />
                                {c.name}
                              </span>
                              <button
                                onClick={() => handleDelete(c.id, "country")}
                                className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1 cursor-pointer"
                              >
                                <Icon name="delete" className="text-xs" />
                                حذف
                              </button>
                            </div>

                            {/* Cities within Country */}
                            {c.cities.length === 0 ? (
                              <p className="text-slate-400 text-xs mr-6">لا توجد مدن مضافة بعد.</p>
                            ) : (
                              <div className="mr-6 flex flex-wrap gap-2 mt-2">
                                {c.cities.map((city) => (
                                  <div key={city.id} className="bg-slate-100/80 px-3 py-1.5 rounded-lg border border-slate-200/30 flex items-center gap-2 text-xs">
                                    <span className="font-bold text-slate-800">{city.name}</span>
                                    <button
                                      onClick={() => handleDelete(city.id, "city")}
                                      className="text-red-400 hover:text-red-600 transition-colors cursor-pointer"
                                    >
                                      <Icon name="close" className="text-xs" />
                                    </button>
                                  </div>
                                ))}
                              </div>
                            )}

                          </div>
                        ))}
                      </div>
                    )}

                  </div>
                ))}
              </div>
            )}

          </div>
        </div>

      </div>
    </div>
  );
}
