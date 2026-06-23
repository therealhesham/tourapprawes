"use client";

import { useState } from "react";
import {
  continents,
  countries,
  cities as allCities,
  hotelCategories,
  transportMethods,
  getSuggestedHotel,
} from "../data/mockData";

type CityStay = {
  cityId: string;
  hotelCategory: string;
  arrivalDate: string;
  transportFromPrevious?: string;
};

type BookingState = {
  startDate: string;
  country: string;
  includeFlight: boolean;
  flightClass?: string;
  flightEstimate?: number;
  cityStays: CityStay[];
  departureDate: string;
  departureAirport: string;
};

type View =
  | "SELECT_DATE"
  | "SELECT_DESTINATION"
  | "FLIGHT_SELECTION"
  | "CITY_DETAILS"
  | "ADD_MORE_PROMPT"
  | "DEPARTURE_INFO"
  | "SUMMARY";

export default function BookingWizard({ onClose }: { onClose?: () => void }) {
  const [view, setView] = useState<View>("SELECT_DATE");
  const [state, setState] = useState<BookingState>({
    startDate: "",
    country: "",
    includeFlight: false,
    flightClass: "",
    flightEstimate: 0,
    cityStays: [],
    departureDate: "",
    departureAirport: "",
  });

  // Transient state for the current city being added
  const [currentCity, setCurrentCity] = useState<Partial<CityStay>>({});

  const flatCountries = Object.values(countries).flat();
  const availableCities = state.country ? allCities[state.country] : [];

  const lastCityAdded = state.cityStays.length > 0
    ? allCities[state.country]?.find((c) => c.id === state.cityStays[state.cityStays.length - 1].cityId)
    : null;

  const handleNextDestination = () => {
    if (state.country) {
      setView("FLIGHT_SELECTION");
    }
  };

  const handleNextFlight = (include: boolean, fClass?: string, estimate?: number) => {
    setState(prev => ({
      ...prev,
      includeFlight: include,
      flightClass: fClass || "",
      flightEstimate: estimate || 0
    }));
    setView("CITY_DETAILS");
  };

  const handleNextCityDetails = () => {
    if (
      currentCity.cityId &&
      currentCity.hotelCategory &&
      currentCity.arrivalDate
    ) {
      if (state.cityStays.length > 0 && !currentCity.transportFromPrevious) {
        return; // require transport if not first city
      }
      setState((prev) => ({
        ...prev,
        cityStays: [...prev.cityStays, currentCity as CityStay],
      }));
      setCurrentCity({});
      setView("ADD_MORE_PROMPT");
    }
  };

  const handleAddAnother = (add: boolean) => {
    if (add) {
      setView("CITY_DETAILS");
    } else {
      setView("DEPARTURE_INFO");
    }
  };

  const handleFinish = () => {
    if (state.departureDate) {
      if (lastCityAdded && !lastCityAdded.hasAirport && !state.departureAirport) {
        return; // require departure airport
      }
      setView("SUMMARY");
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-6 md:p-10 glass-panel rounded-3xl border border-slate-200/60 shadow-2xl relative overflow-hidden" dir="rtl">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-secondary-bright via-secondary to-secondary-bright/50" />

      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 left-6 text-slate-400 hover:text-primary transition-colors p-2 rounded-full hover:bg-slate-100 z-30"
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      )}

      {/* Progress Tracker / Title */}
      <div className="mb-10 text-center">
        <h2 className="font-headline-lg text-headline-lg text-primary mb-2">
          {view === "SUMMARY" ? "ملخص الحجز" : "صمم رحلتك"}
        </h2>
        <p className="font-body-md text-slate-600">
          {view === "SELECT_DATE" && "اختر تاريخ بدء الرحلة"}
          {view === "SELECT_DESTINATION" && "حدد وجهتك الرئيسية"}
          {view === "FLIGHT_SELECTION" && "خيارات وحجوزات الطيران"}
          {view === "CITY_DETAILS" && "اختر تفاصيل إقامتك في المدينة"}
          {view === "ADD_MORE_PROMPT" && "هل ترغب بزيارة مدن إضافية؟"}
          {view === "DEPARTURE_INFO" && "تفاصيل المغادرة والعودة"}
          {view === "SUMMARY" && "رحلة سعيدة مع روائس!"}
        </p>
      </div>

      <div className="space-y-8 animate-fade-in-up">
        {/* ─── VIEW 0: Start Date ─── */}
        {view === "SELECT_DATE" && (
          <div className="space-y-6">
            <div>
              <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                تاريخ بدء الرحلة
              </label>
              <input
                type="date"
                value={state.startDate}
                onChange={(e) => setState({ ...state, startDate: e.target.value })}
                className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
              />
            </div>
            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setView("SELECT_DESTINATION")}
                disabled={!state.startDate}
                className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 1: Destination ─── */}
        {view === "SELECT_DESTINATION" && (
          <div className="space-y-6">
            <div>
              <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                اختر الدولة
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {flatCountries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setState({ ...state, country: c.id })}
                    className={`py-4 px-6 rounded-xl border transition-all duration-300 font-bold text-lg ${state.country === c.id
                      ? "bg-secondary text-on-secondary border-secondary shadow-[0_0_15px_rgba(212,160,23,0.4)]"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5"
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setView("SELECT_DATE")}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold uppercase transition-all"
              >
                رجوع
              </button>
              <button
                onClick={handleNextDestination}
                disabled={!state.country}
                className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 1.5: Flight Selection ─── */}
        {view === "FLIGHT_SELECTION" && (
          <div className="space-y-6 animate-fade-in-up">
            <div>
              <label className="block font-label-sm text-secondary uppercase tracking-widest mb-4">
                هل ترغب في إضافة حجز طيران؟ (سعر تقديري)
              </label>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => handleNextFlight(true, "economy", 1800)}
                  className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                >
                  <span className="font-bold text-lg text-primary">نعم، طيران اقتصادي (Economy)</span>
                  <span className="text-secondary font-bold">سعر تقديري: 1,800 SAR للشخص</span>
                  <span className="text-slate-500 text-sm">شاملاً الحقائب والخدمات الأساسية.</span>
                </button>

                <button
                  onClick={() => handleNextFlight(true, "business", 4500)}
                  className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                >
                  <span className="font-bold text-lg text-primary">نعم، درجة رجال الأعمال (Business)</span>
                  <span className="text-secondary font-bold">سعر تقديري: 4,500 SAR للشخص</span>
                  <span className="text-slate-500 text-sm">شاملاً الدخول للصالة والخدمات المميزة.</span>
                </button>

                <button
                  onClick={() => handleNextFlight(true, "first", 9000)}
                  className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                >
                  <span className="font-bold text-lg text-primary">نعم، الدرجة الأولى (First Class)</span>
                  <span className="text-secondary font-bold">سعر تقديري: 9,000 SAR للشخص</span>
                  <span className="text-slate-500 text-sm">أقصى درجات الرفاهية والخصوصية.</span>
                </button>
              </div>
            </div>

            <div className="pt-6 flex justify-between border-t border-slate-100">
              <button
                onClick={() => setView("SELECT_DESTINATION")}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold uppercase transition-all"
              >
                رجوع
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 2: City Details ─── */}
        {view === "CITY_DETAILS" && (
          <div className="space-y-6">
            {state.cityStays.length > 0 && (
              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                  وسيلة المواصلات من ({lastCityAdded?.name})
                </label>
                <select
                  value={currentCity.transportFromPrevious || ""}
                  onChange={(e) => setCurrentCity({ ...currentCity, transportFromPrevious: e.target.value })}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                >
                  <option value="">اختر وسيلة المواصلات...</option>
                  {transportMethods.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                المدينة
              </label>
              <select
                value={currentCity.cityId || ""}
                onChange={(e) => setCurrentCity({ ...currentCity, cityId: e.target.value })}
                className="w-full py-4  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
              >
                <option value="">اختر المدينة...</option>
                {availableCities.filter(c => !state.cityStays.find(s => s.cityId === c.id)).map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                  فئة الفندق
                </label>
                <select
                  value={currentCity.hotelCategory || ""}
                  onChange={(e) => setCurrentCity({ ...currentCity, hotelCategory: e.target.value })}
                  className="w-full py-4  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                >
                  <option value="">اختر فئة الفندق...</option>
                  {hotelCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                  تاريخ الوصول
                </label>
                <input
                  type="date"
                  value={currentCity.arrivalDate || ""}
                  onChange={(e) => setCurrentCity({ ...currentCity, arrivalDate: e.target.value })}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                />
              </div>
            </div>

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => state.cityStays.length === 0 ? setView("FLIGHT_SELECTION") : setView("ADD_MORE_PROMPT")}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold uppercase transition-all"
              >
                رجوع
              </button>
              <button
                onClick={handleNextCityDetails}
                disabled={!currentCity.cityId || !currentCity.hotelCategory || !currentCity.arrivalDate || (state.cityStays.length > 0 && !currentCity.transportFromPrevious)}
                className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                تأكيد المدينة
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 3: Add More Prompt ─── */}
        {view === "ADD_MORE_PROMPT" && (
          <div className="text-center space-y-8">
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200/60 inline-block text-right">
              <p className="text-primary font-bold mb-4">مسار رحلتك الحالي:</p>
              <ul className="space-y-3">
                {state.cityStays.map((stay, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-slate-800">
                    <span className="material-symbols-outlined text-secondary">location_on</span>
                    {availableCities.find(c => c.id === stay.cityId)?.name}
                    <span className="text-slate-500 text-sm ml-2">
                      ({stay.arrivalDate})
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                onClick={() => handleAddAnother(true)}
                className="border border-secondary/50 text-secondary hover:bg-secondary/10 px-10 py-4 rounded-full font-bold uppercase tracking-widest transition-all"
              >
                + إضافة مدينة أخرى
              </button>
              <button
                onClick={() => handleAddAnother(false)}
                className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-4 rounded-full font-bold uppercase tracking-widest btn-glow transition-all"
              >
                إنهاء مسار الرحلة
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 4: Departure Info ─── */}
        {view === "DEPARTURE_INFO" && (
          <div className="space-y-6">
            <div>
              <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                تاريخ المغادرة (العودة)
              </label>
              <input
                type="date"
                value={state.departureDate}
                onChange={(e) => setState({ ...state, departureDate: e.target.value })}
                className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
              />
            </div>

            {lastCityAdded && !lastCityAdded.hasAirport && (
              <div className="animate-fade-in-up">
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                  مطار المغادرة
                </label>
                <p className="text-sm text-secondary-bright/80 mb-3 font-bold">
                  * آخر مدينة اخترتها ({lastCityAdded.name}) لا يوجد بها مطار. يرجى تحديد المطار الذي ستغادر منه:
                </p>
                <select
                  value={state.departureAirport}
                  onChange={(e) => setState({ ...state, departureAirport: e.target.value })}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                >
                  <option value="">اختر مطار المغادرة...</option>
                  {availableCities.filter(c => c.hasAirport).map((c) => (
                    <option key={c.id} value={c.id}>مطار {c.name}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="pt-6 flex justify-between">
              <button
                onClick={() => setView("ADD_MORE_PROMPT")}
                className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-8 py-3 rounded-full font-bold uppercase transition-all"
              >
                رجوع
              </button>
              <button
                onClick={handleFinish}
                disabled={!state.departureDate || !!(lastCityAdded && !lastCityAdded.hasAirport && !state.departureAirport)}
                className="gold-shimmer bg-gradient-to-l from-secondary to-secondary-bright text-on-secondary px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                مراجعة الحجز
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 5: Summary ─── */}
        {view === "SUMMARY" && (
          <div className="space-y-8">
            <div className="bg-slate-50 p-6 md:p-8 rounded-2xl border border-slate-200/60">
              <h3 className="text-xl font-bold text-primary mb-6 border-b border-slate-200/60 pb-4">
                تفاصيل الرحلة
              </h3>

              <div className="grid grid-cols-4 gap-4 mb-8 text-slate-800">
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">الوجهة</p>
                  <p className="font-bold text-lg">{flatCountries.find(c => c.id === state.country)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">تاريخ البدء</p>
                  <p className="font-bold text-lg">{state.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">تاريخ العودة</p>
                  <p className="font-bold text-lg">{state.departureDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">حجز الطيران</p>
                  <p className="font-bold text-lg">
                    {state.includeFlight ? (
                      <span>
                        {state.flightClass === "economy" && "اقتصادي"}
                        {state.flightClass === "business" && "رجال أعمال"}
                        {state.flightClass === "first" && "درجة أولى"}
                        <span className="text-secondary block text-xs mt-0.5">({state.flightEstimate} SAR تقديري)</span>
                      </span>
                    ) : (
                      "بدون طيران"
                    )}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">خط سير الرحلة</p>
                {state.cityStays.map((stay, idx) => {
                  const city = availableCities.find(c => c.id === stay.cityId);
                  const hotel = hotelCategories.find(h => h.id === stay.hotelCategory);
                  const transport = transportMethods.find(t => t.id === stay.transportFromPrevious);

                  return (
                    <div key={idx} className="relative pl-6 md:pl-0 pr-6 border-r-2 border-secondary/30 pb-6 last:pb-0">
                      <div className="absolute top-0 -right-[9px] w-4 h-4 rounded-full bg-secondary shadow-[0_0_10px_rgba(212,160,23,1)]" />

                      {idx > 0 && transport && (
                        <div className="mb-4 text-sm text-secondary-bright font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">directions_car</span>
                          وسيلة النقل: {transport.name}
                        </div>
                      )}

                      <h4 className="text-xl font-bold text-primary mb-2">{city?.name}</h4>
                      <div className="grid grid-cols-2 gap-2 text-slate-700 text-sm">
                        <p>تاريخ الوصول: {stay.arrivalDate}</p>
                        <p>فئة الفندق: {hotel?.name}</p>
                        <p className="col-span-2 text-secondary-bright mt-1">
                          الفندق المقترح: <span className="font-bold">{getSuggestedHotel(stay.cityId, stay.hotelCategory)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {state.departureAirport && (
                <div className="mt-8 p-4 bg-secondary/10 border border-secondary/20 rounded-xl">
                  <p className="text-secondary-bright font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">flight_takeoff</span>
                    العودة ستكون من مطار: {availableCities.find(c => c.id === state.departureAirport)?.name}
                  </p>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setView("DEPARTURE_INFO")}
                className="text-slate-700 hover:text-secondary transition-colors font-bold uppercase"
              >
                تعديل التفاصيل
              </button>
              <button
                onClick={() => {
                  alert("تم إرسال طلب الحجز بنجاح!");
                  if (onClose) onClose();
                }}
                className="gold-shimmer bg-gradient-to-l from-primary to-primary/80 border border-slate-200 text-on-primary px-12 py-4 rounded-full font-bold text-lg uppercase tracking-widest btn-glow transition-all"
              >
                تأكيد الحجز والدفع
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
