"use client";

import { useState, useEffect } from "react";
import Icon from "@/components/Icon";

type Country = { id: string; name: string };
type Airport = { id: string; airportName: string; city: { name: string } };
type Flight = {
  id: string;
  country: Country;
  approximatePrice: number;
  airWayName: string;
  arrivalAirport: Airport;
  departedAirport: Airport;
};

export default function AdminFlightsPage() {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [countries, setCountries] = useState<Country[]>([]);
  const [saudiAirports, setSaudiAirports] = useState<Airport[]>([]);
  const [destinationAirports, setDestinationAirports] = useState<Airport[]>([]);
  const [loading, setLoading] = useState(true);

  // Form states
  const [selectedCountryId, setSelectedCountryId] = useState("");
  const [selectedDepartedAirportId, setSelectedDepartedAirportId] = useState("");
  const [selectedArrivalAirportId, setSelectedArrivalAirportId] = useState("");
  const [approximatePrice, setApproximatePrice] = useState("");
  const [airWayName, setAirWayName] = useState("");

  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch flights
      const resFlights = await fetch("/api/admin/flights");
      const dataFlights = await resFlights.json();
      if (!dataFlights.error) setFlights(dataFlights);

      // Fetch airports
      const resAirports = await fetch("/api/admin/airports");
      const dataAirports = await resAirports.json();
      if (!dataAirports.error) {
        setSaudiAirports(dataAirports.saudiAirports || []);
        setDestinationAirports(dataAirports.destinationAirports || []);
      }

      // Fetch countries
      const resCities = await fetch("/api/admin/cities");
      const dataCities = await resCities.json();
      if (!dataCities.error) {
        const flattenedCountries: Country[] = dataCities.flatMap((dest: any) =>
          dest.countries.map((c: any) => ({ id: c.id, name: c.name }))
        );
        setCountries(flattenedCountries);
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

  const handleAddFlight = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCountryId || !selectedDepartedAirportId || !selectedArrivalAirportId || !approximatePrice || !airWayName) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch("/api/admin/flights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryId: selectedCountryId,
          departedAirportId: selectedDepartedAirportId,
          arrivalAirportId: selectedArrivalAirportId,
          approximatePrice,
          airWayName
        })
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم إضافة تسعيرة الطيران الدولي بنجاح");
        setApproximatePrice("");
        setAirWayName("");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ ما");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من الحذف؟")) return;
    setActionLoading(true);
    setError("");
    setMessage("");

    try {
      const res = await fetch(`/api/admin/flights?id=${id}`, {
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
        <h2 className="text-3xl font-extrabold text-primary mb-2">إدارة أسعار الطيران الدولي</h2>
        <p className="text-slate-600">إضافة وتعديل أسعار الرحلات الجوية من المطارات السعودية إلى مطارات الوصول الخارجية.</p>
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
              إضافة تسعيرة رحلة طيران
            </h3>

            <form onSubmit={handleAddFlight} className="space-y-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">الدولة المستهدفة</label>
                <select
                  required
                  value={selectedCountryId}
                  onChange={(e) => setSelectedCountryId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر الدولة...</option>
                  {countries.map((country) => (
                    <option key={country.id} value={country.id}>{country.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">مطار المغادرة (السعودية)</label>
                <select
                  required
                  value={selectedDepartedAirportId}
                  onChange={(e) => setSelectedDepartedAirportId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر مطار المغادرة...</option>
                  {saudiAirports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.airportName} ({airport.city?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">مطار الوصول (الوجهة)</label>
                <select
                  required
                  value={selectedArrivalAirportId}
                  onChange={(e) => setSelectedArrivalAirportId(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm cursor-pointer"
                >
                  <option value="">اختر مطار الوصول...</option>
                  {destinationAirports.map((airport) => (
                    <option key={airport.id} value={airport.id}>
                      {airport.airportName} ({airport.city?.name})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">خط الطيران (شركة الطيران)</label>
                <input
                  type="text"
                  required
                  value={airWayName}
                  onChange={(e) => setAirWayName(e.target.value)}
                  className="w-full py-2.5  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none text-sm"
                  placeholder="مثال: الخطوط السعودية، طيران أديل"
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
                  placeholder="مثال: 1800"
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
              <Icon name="flight_takeoff" className="text-secondary" />
              تسعيرات الرحلات المسجلة
            </h3>

            {loading ? (
              <div className="flex justify-center items-center py-20">
                <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : flights.length === 0 ? (
              <p className="text-slate-500 text-center py-20">لا توجد تسعيرات رحلات مسجلة بعد. استخدم النموذج لإضافة تسعيرة جديدة.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead>
                    <tr className="border-b border-outline-variant/20 text-slate-500">
                      <th className="pb-3 font-bold">الدولة</th>
                      <th className="pb-3 font-bold">مسار الطيران (مغادرة ← وصول)</th>
                      <th className="pb-3 font-bold">شركة الطيران</th>
                      <th className="pb-3 font-bold">السعر التقديري</th>
                      <th className="pb-3 font-bold text-left">إجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flights.map((flight) => (
                      <tr key={flight.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-slate-50/50">
                        <td className="py-4 font-bold text-primary">{flight.country?.name}</td>
                        <td className="py-4 text-slate-700">
                          <div className="font-bold">{flight.departedAirport?.airportName} ({flight.departedAirport?.city?.name})</div>
                          <div className="text-xs text-slate-400 mt-1">← {flight.arrivalAirport?.airportName} ({flight.arrivalAirport?.city?.name})</div>
                        </td>
                        <td className="py-4 text-slate-700">{flight.airWayName}</td>
                        <td className="py-4 font-black text-secondary-bright">{flight.approximatePrice.toLocaleString("en-US")} SAR</td>
                        <td className="py-4 text-left">
                          <button
                            onClick={() => handleDelete(flight.id)}
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
