"use client";

import { useState, useEffect } from "react";

type Airport = { id: string; airportName: string; city: { name: string } };
type Flight = {
  id: string;
  airWayName: string;
  approximatePrice: number;
  departedAirport: Airport;
  arrivalAirport: Airport;
};
type CompanyPackage = { id: string; name: string; title: string };
type Booking = {
  id: string;
  clientName: string;
  clientPhone: string;
  startDate: string;
  endDate: string;
  pricing: number;
  cityStays: any; // JSON
  departingFlight?: Flight;
  returningFlight?: Flight;
  createdAt: string;
  companyPackage?: CompanyPackage | null;
};

type City = { id: string; name: string };
type Transport = { id: string; transportationName: string; approximatePrice: number };

export default function AdminClientTripsPage() {
  const [bookings, setBokings] = useState<Booking[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [transports, setTransports] = useState<Transport[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadData = async () => {
    setLoading(true);
    try {
      // 1. Load bookings
      const resBookings = await fetch("/api/admin/client-trips");
      const dataBookings = await resBookings.json();
      if (!dataBookings.error) setBokings(dataBookings);

      // 2. Load cities to resolve IDs in itinerary
      const resCities = await fetch("/api/admin/cities");
      const dataCities = await resCities.json();
      if (!dataCities.error && Array.isArray(dataCities)) {
        const flattened: City[] = dataCities.flatMap((dest: any) =>
          dest.countries.flatMap((c: any) => c.cities.map((city: any) => ({ id: city.id, name: city.name })))
        );
        setCities(flattened);
      }

      // 3. Load transports to resolve database transit IDs in itinerary
      const resTransports = await fetch("/api/admin/transports");
      const dataTransports = await resTransports.json();
      if (!dataTransports.error && Array.isArray(dataTransports)) {
        setTransports(dataTransports);
      }
    } catch (err) {
      console.error("Error loading admin client trips data:", err);
      setError("حدث خطأ أثناء تحميل البيانات.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف هذا الحجز؟")) return;
    try {
      const res = await fetch(`/api/admin/client-trips?id=${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage("تم حذف الحجز بنجاح.");
        loadData();
      }
    } catch (err) {
      setError("حدث خطأ أثناء حذف الحجز.");
    }
  };

  // Helper resolvers
  const getCityName = (cityId: string) => {
    return cities.find((c) => c.id === cityId)?.name || cityId;
  };

  const getTransportName = (transportCodeOrId: string) => {
    if (!transportCodeOrId) return "";
    if (transportCodeOrId.startsWith("db_")) {
      const dbId = transportCodeOrId.replace("db_", "");
      const matched = transports.find((t) => t.id === dbId);
      return matched ? `${matched.transportationName} (${matched.approximatePrice} SAR)` : "مواصلات مخصصة";
    }

    const staticMapping: Record<string, string> = {
      flight: "طيران داخلي (تقديري)",
      train: "قطار (تقديري)",
      bus: "حافلة (تقديري)",
      car: "سيارة خاصة (تقديري)",
    };
    return staticMapping[transportCodeOrId] || transportCodeOrId;
  };

  const hotelCategoriesMapping: Record<string, string> = {
    auto: "تلقائي (السيستم يختار)",
    family: "عائلات",
    honeymoon: "شهر عسل",
    budget: "اقتصادي",
    luxury: "فاخر",
  };

  return (
    <div className="space-y-8 text-right" dir="rtl">
      <div>
        <h2 className="text-3xl font-extrabold text-primary mb-2">إدارة رحلات العملاء</h2>
        <p className="text-slate-600">عرض وتفاصيل طلبات تصميم الرحلات المخصصة التي قام العملاء بتصميمها وتقديمها من الواجهة الأمامية.</p>
      </div>

      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-xl min-h-[500px]">
        <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2 border-b border-outline-variant/30 pb-4">
          <span className="material-symbols-outlined text-secondary">card_travel</span>
          قائمة طلبات الحجز المستلمة
        </h3>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-10 h-10 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : bookings.length === 0 ? (
          <p className="text-slate-500 text-center py-20">لا توجد طلبات حجز مسجلة حتى الآن.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-right">
              <thead>
                <tr className="border-b border-outline-variant/20 text-slate-500">
                  <th className="pb-3 font-bold">اسم العميل</th>
                  <th className="pb-3 font-bold">رقم الجوال</th>
                  <th className="pb-3 font-bold">تاريخ السفر (من ← إلى)</th>
                  <th className="pb-3 font-bold">تكلفة البرنامج</th>
                  <th className="pb-3 font-bold text-left">إجراءات</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} className="border-b border-outline-variant/10 last:border-0 hover:bg-slate-50/50">
                    <td className="py-4 font-bold text-primary">
                      <div>{booking.clientName}</div>
                      {booking.companyPackage && (
                        <div className="text-xs text-secondary-bright font-black mt-1 bg-secondary/15 px-2 py-0.5 rounded inline-block">
                          باقة جاهزة: {booking.companyPackage.name} ({booking.companyPackage.title})
                        </div>
                      )}
                    </td>
                    <td className="py-4 text-slate-700">{booking.clientPhone}</td>
                    <td className="py-4 text-slate-700">
                      <div className="font-bold">{booking.startDate}</div>
                      <div className="text-xs text-slate-400 mt-1">إلى: {booking.endDate}</div>
                    </td>
                    <td className="py-4 font-black text-secondary-bright">{booking.pricing.toLocaleString("en-US")} SAR</td>
                    <td className="py-4 text-left flex justify-end gap-3">
                      <button
                        onClick={() => setSelectedBooking(booking)}
                        className="text-secondary hover:text-secondary-bright font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">visibility</span>
                        تفاصيل البرنامج
                      </button>
                      <button
                        onClick={() => handleDelete(booking.id)}
                        className="text-red-500 hover:text-red-700 font-bold flex items-center gap-1 cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-xs">delete</span>
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

      {/* Details Dialog Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-200">
            {/* Close Button */}
            <button
              onClick={() => setSelectedBooking(null)}
              className="absolute top-6 left-6 text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100"
            >
              <span className="material-symbols-outlined">close</span>
            </button>

            <h3 className="text-2xl font-bold text-primary mb-6 border-b border-slate-200 pb-4">تفاصيل حجز العميل</h3>

            <div className="space-y-6 text-slate-800">
               {/* Customer Contact Card */}
              <div className="grid grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100 text-sm">
                <div>
                  <span className="text-slate-400 block mb-1">اسم العميل:</span>
                  <span className="font-bold text-primary">{selectedBooking.clientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">رقم الهاتف/الجوال:</span>
                  <span className="font-bold text-primary" dir="ltr">{selectedBooking.clientPhone}</span>
                </div>
                {selectedBooking.companyPackage && (
                  <div className="col-span-2">
                    <span className="text-slate-400 block mb-1">الباقة المحجوزة:</span>
                    <span className="font-bold text-secondary-bright">
                      {selectedBooking.companyPackage.name} - {selectedBooking.companyPackage.title}
                    </span>
                  </div>
                )}
                <div>
                  <span className="text-slate-400 block mb-1">تاريخ الذهاب:</span>
                  <span className="font-bold text-primary">{selectedBooking.startDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 block mb-1">تاريخ العودة:</span>
                  <span className="font-bold text-primary">{selectedBooking.endDate}</span>
                </div>
                <div className="col-span-2 mt-2 pt-2 border-t border-slate-200/60 flex justify-between items-center">
                  <span className="font-bold text-slate-700">التكلفة التقديرية الكلية للبرنامج:</span>
                  <span className="font-black text-xl text-secondary-bright">{selectedBooking.pricing.toLocaleString("en-US")} SAR</span>
                </div>
              </div>

              {/* Flights Configured */}
              {(selectedBooking.departingFlight || selectedBooking.returningFlight) ? (
                <div className="space-y-4">
                  <h4 className="font-bold text-primary border-r-4 border-secondary pr-2">تذاكر الطيران الدولي</h4>
                  
                  {selectedBooking.departingFlight && (
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">flight_takeoff</span>
                        رحلة الذهاب ({selectedBooking.departingFlight.airWayName})
                      </div>
                      <p className="text-slate-600">
                        {selectedBooking.departingFlight.departedAirport?.airportName} ({selectedBooking.departingFlight.departedAirport?.city?.name}) 
                        ← {selectedBooking.departingFlight.arrivalAirport?.airportName} ({selectedBooking.departingFlight.arrivalAirport?.city?.name})
                      </p>
                      <p className="text-secondary font-bold mt-1">التسعيرة: {selectedBooking.departingFlight.approximatePrice} SAR</p>
                    </div>
                  )}

                  {selectedBooking.returningFlight && (
                    <div className="p-3 bg-slate-50/50 rounded-xl border border-slate-100 text-xs">
                      <div className="font-bold text-slate-800 mb-1 flex items-center gap-1">
                        <span className="material-symbols-outlined text-sm text-secondary">flight_land</span>
                        رحلة العودة ({selectedBooking.returningFlight.airWayName})
                      </div>
                      <p className="text-slate-600">
                        {selectedBooking.returningFlight.departedAirport?.airportName} ({selectedBooking.returningFlight.departedAirport?.city?.name}) 
                        ← {selectedBooking.returningFlight.arrivalAirport?.airportName} ({selectedBooking.returningFlight.arrivalAirport?.city?.name})
                      </p>
                      <p className="text-secondary font-bold mt-1">التسعيرة: {selectedBooking.returningFlight.approximatePrice} SAR</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs font-bold text-slate-500">
                  * تم استبعاد حجز الطيران الخارجي من هذا البرنامج.
                </div>
              )}

              {/* Itinerary / Cities stays */}
              <div className="space-y-4">
                <h4 className="font-bold text-primary border-r-4 border-secondary pr-2">خط سير الرحلة والإقامة</h4>
                
                <div className="space-y-4">
                  {(() => {
                    let staysArray = [];
                    try {
                      staysArray = typeof selectedBooking.cityStays === "string" 
                        ? JSON.parse(selectedBooking.cityStays) 
                        : selectedBooking.cityStays;
                    } catch (e) {
                      console.error("Error parsing stays:", e);
                    }

                    if (!Array.isArray(staysArray)) return <p className="text-xs text-red-500">لا يمكن عرض تفاصيل المسار.</p>;

                    return staysArray.map((stay: any, idx: number) => (
                      <div key={idx} className="relative pr-6 border-r-2 border-secondary/30 pb-4 last:pb-0">
                        <div className="absolute top-1 -right-[6px] w-3 h-3 rounded-full bg-secondary shadow-sm" />
                        
                        {idx > 0 && stay.transportFromPrevious && (
                          <div className="mb-2 text-xs text-secondary-bright font-bold flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">directions_car</span>
                            المواصلات: {getTransportName(stay.transportFromPrevious)}
                          </div>
                        )}

                        <div className="font-bold text-base text-slate-800">{getCityName(stay.cityId)}</div>
                        <div className="text-xs text-slate-500 mt-1">
                          فئة الفندق المطلوبة: {hotelCategoriesMapping[stay.hotelCategory] || stay.hotelCategory}
                        </div>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setSelectedBooking(null)}
                className="bg-primary text-background px-6 py-2.5 rounded-xl font-bold hover:opacity-90 transition-all cursor-pointer"
              >
                إغلاق النافذة
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
