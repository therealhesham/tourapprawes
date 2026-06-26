"use client";

import { useState, useEffect } from "react";
import {
  continents,
  countries,
  cities as allCities,
  hotelCategories,
  transportMethods,
} from "../data/mockData";

type CityStay = {
  cityId: string;
  hotelCategory: string;
  transportFromPrevious?: string;
};

type BookingState = {
  startDate: string;
  country: string;
  includeFlight: boolean;
  flightClass?: string;
  flightEstimate?: number;
  flightId?: string;
  flightAirway?: string;
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

  // Dynamic database states
  const [dbCountries, setDbCountries] = useState<{ id: string; name: string }[]>([]);
  const [dbCities, setDbCities] = useState<Record<string, { id: string; name: string; hasAirport: boolean }[]>>({});
  const [dbAirports, setDbAirports] = useState<{ saudiAirports: any[]; destinationAirports: any[] }>({ saudiAirports: [], destinationAirports: [] });
  const [dbFlights, setDbFlights] = useState<any[]>([]);
  const [dbReturningFlights, setDbReturningFlights] = useState<any[]>([]);
  const [dbTransports, setDbTransports] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // Form submission states
  const [showContactForm, setShowContactForm] = useState(false);
  const [clientName, setClientName] = useState("");
  const [clientPhone, setClientPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  // Transient state for the current city being added
  const [currentCity, setCurrentCity] = useState<Partial<CityStay>>({});

  useEffect(() => {
    const fetchCities = fetch("/api/admin/cities").then(res => res.json());
    const fetchAirports = fetch("/api/admin/airports").then(res => res.json());
    const fetchFlights = fetch("/api/admin/flights").then(res => res.json());
    const fetchReturningFlights = fetch("/api/admin/returning-flights").then(res => res.json());
    const fetchTransports = fetch("/api/admin/transports").then(res => res.json());

    Promise.all([fetchCities, fetchAirports, fetchFlights, fetchReturningFlights, fetchTransports])
      .then(([citiesData, airportsData, flightsData, returningFlightsData, transportsData]) => {
        if (Array.isArray(citiesData)) {
          const flattenedCountries: { id: string; name: string }[] = [];
          const citiesRecord: Record<string, { id: string; name: string; hasAirport: boolean }[]> = {};

          citiesData.forEach((dest: any) => {
            dest.countries.forEach((country: any) => {
              flattenedCountries.push({ id: country.id, name: country.name });
              
              const destinationAirports = airportsData?.destinationAirports || [];
              citiesRecord[country.id] = country.cities.map((city: any) => {
                const hasAirport = destinationAirports.some((a: any) => a.cityId === city.id);
                return {
                  id: city.id,
                  name: city.name,
                  hasAirport: hasAirport
                };
              });
            });
          });
          
          setDbCountries(flattenedCountries);
          setDbCities(citiesRecord);
        }

        if (airportsData && !airportsData.error) {
          setDbAirports(airportsData);
        }

        if (Array.isArray(flightsData)) {
          setDbFlights(flightsData);
        }

        if (Array.isArray(returningFlightsData)) {
          setDbReturningFlights(returningFlightsData);
        }

        if (Array.isArray(transportsData)) {
          setDbTransports(transportsData);
        }

        setDataLoading(false);
      })
      .catch(err => {
        console.error("Error loading dynamic wizard data:", err);
        setDataLoading(false);
      });
  }, []);

  const getSuggestedHotel = (cityId: string, categoryId: string): string => {
    // Dynamically retrieve the city from dbCities to construct hotel suggestion
    let cityName = "المدينة";
    if (state.country && dbCities[state.country]) {
      const foundCity = dbCities[state.country].find(c => c.id === cityId);
      if (foundCity) cityName = foundCity.name;
    }

    const cityNames: Record<string, string> = {
      kuala_lumpur: "جراند حياة كوالالمبور",
      langkawi: "منتجع ذا دانا لنكاوي",
      cameron_highlands: "فندق كاميرون هايلاندز ريزورت",
      male: "والدورف أستوريا المالديف",
      bangkok: "فندق ماندارين أورينتال بانكوك",
      phuket: "منتجع سري بانوا بوكيت",
      sarajevo: "فندق سويس أوتيل سراييفو",
      mostar: "فندق ميباس موستار",
      tirana: "فندق بلازا تيرانا",
      berat: "فندق كولومبو بيرات",
      tbilisi: "فندق بيلتمور تبليسي",
      batumi: "فندق راديسون بلو باتومي",
      cairo: "فندق ريتز كارلتون النيل",
      sharm: "منتجع فورسيزونز شرم الشيخ",
      alexandria: "فندق فورسيزونز سان ستيفانو",
      casablanca: "فندق فورسيزونز الدار البيضاء",
      marrakesh: "فندق المامونية",
    };

    const baseName = cityNames[cityId] || `منتجع فاخر في ${cityName}`;
    
    switch(categoryId) {
      case 'family': return baseName + " (جناح عائلي)";
      case 'honeymoon': return baseName + " (جناح شهر العسل)";
      case 'budget': return "فندق اقتصادي مميز";
      case 'luxury': return baseName + " (إقامة فاخرة VIP)";
      case 'auto':
      default:
        return baseName + " (اختيار روائس الموصى به)";
    }
  };

  const availableCities = state.country ? dbCities[state.country] || [] : [];

  // Pricing constants and calculations
  const HOTEL_RATES: Record<string, number> = {
    budget: 250,
    auto: 450,
    family: 450,
    honeymoon: 700,
    luxury: 1200,
  };

  const TRANSPORT_RATES: Record<string, number> = {
    flight: 350,
    train: 120,
    bus: 60,
    car: 250,
  };

  const totalDays = (() => {
    if (!state.startDate || !state.departureDate) return 1;
    const start = new Date(state.startDate);
    const end = new Date(state.departureDate);
    const diff = end.getTime() - start.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  })();

  const hotelCost = (() => {
    if (state.cityStays.length === 0) return 0;
    const daysPerCity = totalDays / state.cityStays.length;
    return state.cityStays.reduce((sum, stay) => {
      const rate = HOTEL_RATES[stay.hotelCategory] || 450;
      return sum + (rate * daysPerCity);
    }, 0);
  })();

  const transportCost = state.cityStays.reduce((sum, stay) => {
    if (stay.transportFromPrevious) {
      if (stay.transportFromPrevious.startsWith("db_")) {
        const transportId = stay.transportFromPrevious.replace("db_", "");
        const transport = dbTransports.find(t => t.id === transportId);
        return sum + (transport ? transport.approximatePrice : 0);
      }
      return sum + (TRANSPORT_RATES[stay.transportFromPrevious] || 0);
    }
    return sum;
  }, 0);

  const lastCityAdded = state.cityStays.length > 0
    ? availableCities.find((c) => c.id === state.cityStays[state.cityStays.length - 1].cityId)
    : null;

  const getReturningFlight = () => {
    if (state.cityStays.length === 0) return null;
    
    // 1. Get the last city
    const lastCityStay = state.cityStays[state.cityStays.length - 1];
    const lastCityId = lastCityStay.cityId;
    const countryCities = dbCities[state.country] || [];
    const lastCityObj = countryCities.find(c => c.id === lastCityId);
    if (!lastCityObj) return null;
    
    // 2. Determine departure airport for returning flight
    let departedAirportId = "";
    const airportInCity = dbAirports.destinationAirports.find(a => a.cityId === lastCityId);
    
    if (airportInCity) {
      departedAirportId = airportInCity.id;
    } else {
      // Fallback to Capital City
      const capitalNames = ["تبليسي", "تيرانا", "ماليه", "القاهرة"];
      const capitalCity = countryCities.find(c => capitalNames.includes(c.name));
      if (capitalCity) {
        const capitalAirport = dbAirports.destinationAirports.find(a => a.cityId === capitalCity.id);
        if (capitalAirport) {
          departedAirportId = capitalAirport.id;
        }
      }
      
      // If still not found, fallback to first city in country with an airport
      if (!departedAirportId) {
        const cityWithAirport = countryCities.find(c => c.hasAirport);
        if (cityWithAirport) {
          const fallbackAirport = dbAirports.destinationAirports.find(a => a.cityId === cityWithAirport.id);
          if (fallbackAirport) {
            departedAirportId = fallbackAirport.id;
          }
        }
      }
    }
    
    if (!departedAirportId) return null;
    
    // 3. Find target Saudi Airport
    let targetSaudiAirportId = "";
    if (state.includeFlight && state.flightId) {
      const outboundFlight = dbFlights.find(f => f.id === state.flightId);
      if (outboundFlight) {
        targetSaudiAirportId = outboundFlight.departedAirportId;
      }
    }
    
    if (!targetSaudiAirportId) {
      // Default to Riyadh or first available Saudi Airport
      const ruhAirport = dbAirports.saudiAirports.find(a => a.airportName.includes("خالد") || a.city?.name === "الرياض");
      targetSaudiAirportId = ruhAirport ? ruhAirport.id : (dbAirports.saudiAirports[0]?.id || "");
    }
    
    // 4. Find matching returning flight from dbReturningFlights
    const match = dbReturningFlights.find(
      rf => rf.countryId === state.country && 
            rf.departedAirportId === departedAirportId && 
            rf.arrivalAirportId === targetSaudiAirportId
    );
    
    if (!match) {
      return dbReturningFlights.find(
        rf => rf.countryId === state.country && 
              rf.departedAirportId === departedAirportId
      ) || null;
    }
    
    return match;
  };

  const returningFlight = getReturningFlight();

  const flightCost = state.includeFlight 
    ? ((state.flightEstimate || 0) + (returningFlight ? returningFlight.approximatePrice : 0)) 
    : 0;
  const totalEstimate = Math.round(flightCost + hotelCost + transportCost);

  const handleNextDestination = () => {
    if (state.country) {
      setView("FLIGHT_SELECTION");
    }
  };

  const handleNextFlight = (include: boolean, fClass?: string, estimate?: number, flightId?: string, flightAirway?: string) => {
    setState(prev => ({
      ...prev,
      includeFlight: include,
      flightClass: fClass || "",
      flightEstimate: estimate || 0,
      flightId: flightId || "",
      flightAirway: flightAirway || ""
    }));
    setView("CITY_DETAILS");
  };

  const handleNextCityDetails = () => {
    if (
      currentCity.cityId &&
      currentCity.hotelCategory
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
      <div className="mb-10 text-center px-8 sm:px-0">
        <h2 className="text-xl sm:text-2xl md:font-headline-lg md:text-headline-lg font-bold text-primary mb-2">
          {view === "SUMMARY" ? "ملخص الحجز" : "صمم رحلتك"}
        </h2>
        <p className="font-body-md text-slate-600">
          {view === "SELECT_DATE" && "حدد تاريخ الذهاب وتاريخ العودة لبدء تصميم رحلتك"}
          {view === "SELECT_DESTINATION" && "حدد وجهتك الرئيسية"}
          {view === "FLIGHT_SELECTION" && "خيارات وحجوزات الطيران"}
          {view === "CITY_DETAILS" && "اختر تفاصيل إقامتك في المدينة"}
          {view === "ADD_MORE_PROMPT" && "هل ترغب بزيارة مدن إضافية؟"}
          {view === "DEPARTURE_INFO" && "تفاصيل المغادرة والعودة"}
          {view === "SUMMARY" && "رحلة سعيدة مع روائس!"}
        </p>
      </div>

      <div className="space-y-8 animate-fade-in-up">
        {/* ─── VIEW 0: Date Range Selection (From / To) ─── */}
        {view === "SELECT_DATE" && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3 font-bold">
                  تاريخ الذهاب (من)
                </label>
                <input
                  type="date"
                  value={state.startDate}
                  min={new Date().toISOString().split("T")[0]}
                  onChange={(e) => {
                    const newStart = e.target.value;
                    setState((prev) => ({
                      ...prev,
                      startDate: newStart,
                      departureDate: prev.departureDate && prev.departureDate < newStart ? "" : prev.departureDate,
                    }));
                  }}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                />
              </div>

              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3 font-bold">
                  تاريخ العودة (إلى)
                </label>
                <input
                  type="date"
                  value={state.departureDate}
                  min={state.startDate || new Date().toISOString().split("T")[0]}
                  disabled={!state.startDate}
                  onChange={(e) => setState((prev) => ({ ...prev, departureDate: e.target.value }))}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {state.startDate && state.departureDate && state.departureDate < state.startDate && (
              <p className="text-red-500 text-sm font-bold">
                * يجب أن يكون تاريخ العودة بعد أو مساوياً لتاريخ الذهاب.
              </p>
            )}

            <div className="pt-6 flex justify-end">
              <button
                onClick={() => setView("SELECT_DESTINATION")}
                disabled={!state.startDate || !state.departureDate || state.departureDate < state.startDate}
                className="gold-shimmer bg-primary text-background px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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
              {dataLoading ? (
                <div className="flex justify-center items-center py-10">
                  <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                  {dbCountries.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setState({ ...state, country: c.id })}
                      className={`py-3 px-3 md:py-4 md:px-6 rounded-xl border transition-all duration-300 font-bold text-base md:text-lg ${state.country === c.id
                        ? "bg-secondary text-on-secondary border-secondary shadow-[0_0_15px_rgba(212,160,23,0.4)]"
                        : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5"
                        }`}
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              )}
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
                className="gold-shimmer bg-primary text-background px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                التالي
              </button>
            </div>
          </div>
        )}

        {/* ─── VIEW 1.5: Flight Selection ─── */}
        {view === "FLIGHT_SELECTION" && (() => {
          const countryFlights = dbFlights.filter((f) => f.countryId === state.country);
          return (
            <div className="space-y-6 animate-fade-in-up">
              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-4">
                  {countryFlights.length > 0 
                    ? "اختر من رحلات الطيران المتاحة لوجهتك:" 
                    : "هل ترغب في إضافة حجز طيران؟ (سعر تقديري)"}
                </label>
                
                {countryFlights.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {countryFlights.map((flight) => (
                      <button
                        key={flight.id}
                        onClick={() => handleNextFlight(
                          true,
                          `درجة أساسية (${flight.airWayName})`,
                          flight.approximatePrice,
                          flight.id,
                          flight.airWayName
                        )}
                        className="py-5 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-secondary">flight_takeoff</span>
                          <span className="font-bold text-lg text-primary">{flight.airWayName}</span>
                        </div>
                        <span className="text-slate-600 text-sm font-bold">
                          {flight.departedAirport?.airportName} ({flight.departedAirport?.city?.name}) 
                          ← {flight.arrivalAirport?.airportName} ({flight.arrivalAirport?.city?.name})
                        </span>
                        <span className="text-secondary font-black text-lg">{flight.approximatePrice} SAR</span>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => handleNextFlight(false, "", 0)}
                      className="py-5 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col justify-center items-center gap-2 cursor-pointer border-dashed"
                    >
                      <span className="font-bold text-lg text-slate-500">بدون طيران</span>
                      <span className="text-slate-400 text-sm">سأقوم بحجز الطيران الخارجي بنفسي.</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={() => handleNextFlight(true, "economy", 1800, undefined, "طيران تقديري")}
                      className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                    >
                      <span className="font-bold text-lg text-primary">نعم، طيران اقتصادي (Economy)</span>
                      <span className="text-secondary font-bold">سعر تقديري: 1,800 SAR للشخص</span>
                      <span className="text-slate-500 text-sm">شاملاً الحقائب والخدمات الأساسية.</span>
                    </button>

                    <button
                      onClick={() => handleNextFlight(true, "business", 4500, undefined, "طيران تقديري")}
                      className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                    >
                      <span className="font-bold text-lg text-primary">نعم، درجة رجال الأعمال (Business)</span>
                      <span className="text-secondary font-bold">سعر تقديري: 4,500 SAR للشخص</span>
                      <span className="text-slate-500 text-sm">شاملاً الدخول للصالة والخدمات المميزة.</span>
                    </button>

                    <button
                      onClick={() => handleNextFlight(true, "first", 9000, undefined, "طيران تقديري")}
                      className="py-6 px-6 rounded-2xl border text-right transition-all duration-300 bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 flex flex-col gap-2 cursor-pointer"
                    >
                      <span className="font-bold text-lg text-primary">نعم، الدرجة الأولى (First Class)</span>
                      <span className="text-secondary font-bold">سعر تقديري: 9,000 SAR للشخص</span>
                      <span className="text-slate-500 text-sm">أقصى درجات الرفاهية والخصوصية.</span>
                    </button>
                  </div>
                )}
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
          );
        })()}

        {/* ─── VIEW 2: City Details ─── */}
        {view === "CITY_DETAILS" && (() => {
          const previousCityId = lastCityAdded?.id;
          const targetCityId = currentCity.cityId;
          const customTransports = dbTransports.filter(
            (t) => t.cityId === previousCityId && t.arrivalCityId === targetCityId
          );

          return (
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
                    {customTransports.map((t) => (
                      <option key={t.id} value={`db_${t.id}`}>
                        {t.transportationName} ({t.approximatePrice} SAR) [موصى به]
                      </option>
                    ))}
                    {transportMethods.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} (تقديري: {TRANSPORT_RATES[m.id]} SAR)
                      </option>
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

              <div>
                <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                  فئة الفندق
                </label>
                <select
                  value={currentCity.hotelCategory || ""}
                  onChange={(e) => setCurrentCity({ ...currentCity, hotelCategory: e.target.value })}
                  className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
                >
                  <option value="">اختر فئة الفندق...</option>
                  {hotelCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
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
                  disabled={!currentCity.cityId || !currentCity.hotelCategory || (state.cityStays.length > 0 && !currentCity.transportFromPrevious)}
                  className="gold-shimmer bg-primary text-background px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  تأكيد المدينة
                </button>
              </div>
            </div>
          );
        })()}

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
                className="gold-shimmer bg-primary text-background px-10 py-4 rounded-full font-bold uppercase tracking-widest btn-glow transition-all"
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
                min={state.startDate || new Date().toISOString().split("T")[0]}
                onChange={(e) => setState({ ...state, departureDate: e.target.value })}
                className="w-full py-4 px-5 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary focus:ring-2 focus:ring-secondary/20 text-on-surface outline-none"
              />
            </div>

            {lastCityAdded && !lastCityAdded.hasAirport && (
              <div className="animate-fade-in-up p-5 bg-amber-50/50 border border-amber-200/50 rounded-2xl text-amber-800 text-right space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-600">info</span>
                  تنويه بخصوص مطار العودة
                </div>
                <p className="text-sm">
                  بما أن آخر مدينة في مسار رحلتك (<strong>{lastCityAdded.name}</strong>) لا تحتوي على مطار جوي، 
                  فقد تم تحديد رحلة العودة تلقائياً من مطار العاصمة أو أقرب مطار متاح.
                </p>
                {returningFlight && (
                  <div className="p-3 bg-white/80 rounded-xl border border-amber-100 text-xs font-bold text-slate-700 mt-2">
                    مطار العودة: {returningFlight.departedAirport?.airportName} ({returningFlight.departedAirport?.city?.name})
                  </div>
                )}
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
                disabled={!state.departureDate}
                className="gold-shimmer bg-primary text-background px-10 py-3 rounded-full font-bold uppercase tracking-widest btn-glow disabled:opacity-50 disabled:cursor-not-allowed transition-all"
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

              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mb-8 text-slate-800 border-b border-slate-200/60 pb-6">
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">الوجهة</p>
                  <p className="font-bold text-lg text-primary">{dbCountries.find(c => c.id === state.country)?.name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">تاريخ البدء</p>
                  <p className="font-bold text-lg text-primary">{state.startDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">تاريخ العودة</p>
                  <p className="font-bold text-lg text-primary">{state.departureDate}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">المدة الإجمالية</p>
                  <p className="font-bold text-lg text-primary">{totalDays} يوم / {totalDays - 1 > 0 ? totalDays - 1 : 1} ليلة</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">حجز الطيران</p>
                  <div className="font-bold text-slate-800 col-span-2 sm:col-span-1 text-sm">
                    {state.includeFlight ? (
                      <div className="space-y-1">
                        <div>
                          <span className="text-secondary font-bold">الذهاب:</span> {state.flightAirway || "طيران"} ({state.flightEstimate} SAR)
                        </div>
                        {returningFlight && (
                          <div>
                            <span className="text-secondary font-bold">العودة:</span> {returningFlight.airWayName} ({returningFlight.approximatePrice} SAR)
                          </div>
                        )}
                      </div>
                    ) : (
                      "بدون طيران"
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <p className="text-sm text-slate-500 mb-1 uppercase tracking-widest">خط سير الرحلة</p>
                {state.cityStays.map((stay, idx) => {
                  const city = availableCities.find(c => c.id === stay.cityId);
                  const hotel = hotelCategories.find(h => h.id === stay.hotelCategory);
                  
                  let transportName = "";
                  if (stay.transportFromPrevious) {
                    if (stay.transportFromPrevious.startsWith("db_")) {
                      const transportId = stay.transportFromPrevious.replace("db_", "");
                      const dbT = dbTransports.find(t => t.id === transportId);
                      transportName = dbT ? dbT.transportationName : "مواصلات مخصصة";
                    } else {
                      const staticT = transportMethods.find(t => t.id === stay.transportFromPrevious);
                      transportName = staticT ? staticT.name : "";
                    }
                  }

                  return (
                    <div key={idx} className="relative pl-6 md:pl-0 pr-6 border-r-2 border-secondary/30 pb-6 last:pb-0">
                      <div className="absolute top-0 -right-[9px] w-4 h-4 rounded-full bg-secondary shadow-[0_0_10px_rgba(212,160,23,1)]" />

                      {idx > 0 && transportName && (
                        <div className="mb-4 text-sm text-secondary-bright font-bold flex items-center gap-2">
                          <span className="material-symbols-outlined text-base">directions_car</span>
                          وسيلة النقل: {transportName}
                        </div>
                      )}

                      <h4 className="text-xl font-bold text-primary mb-2">{city?.name}</h4>
                      <div className="text-slate-700 text-sm space-y-1">
                        <p>فئة الفندق: {hotel?.name}</p>
                        <p className="text-secondary-bright mt-1">
                          الفندق المقترح: <span className="font-bold">{getSuggestedHotel(stay.cityId, stay.hotelCategory)}</span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {state.includeFlight && returningFlight && (
                <div className="mt-6 p-4 bg-secondary/10 border border-secondary/20 rounded-xl text-right">
                  <p className="text-secondary-bright font-bold flex items-center gap-2">
                    <span className="material-symbols-outlined">flight_takeoff</span>
                    تفاصيل رحلة العودة (مضافة للبرنامج):
                  </p>
                  <p className="text-sm text-slate-700 mt-1 font-bold">
                    {returningFlight.airWayName} | {returningFlight.departedAirport?.airportName} ({returningFlight.departedAirport?.city?.name})
                    ← {returningFlight.arrivalAirport?.airportName} ({returningFlight.arrivalAirport?.city?.name})
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    * {lastCityAdded && !lastCityAdded.hasAirport ? `بما أن مدينة العودة (${lastCityAdded.name}) لا تحتوي على مطار، فقد تم اختيار مطار العاصمة.` : `مغادرة من مدينة (${lastCityAdded?.name}).`}
                  </p>
                </div>
              )}

              {/* Cost Breakdown & Total */}
              <div className="mt-8 pt-6 border-t border-slate-200/60">
                <h4 className="text-lg font-bold text-primary mb-4">التكلفة التقديرية للرحلة</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-sm text-slate-700">
                  {state.includeFlight && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <span>تذاكر الطيران ({state.flightAirway}):</span>
                      <span className="font-bold text-primary">{state.flightEstimate} SAR</span>
                    </div>
                  )}
                  {hotelCost > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <span>إقامة الفنادق ({totalDays} ليالي):</span>
                      <span className="font-bold text-primary">{Math.round(hotelCost)} SAR</span>
                    </div>
                  )}
                  {transportCost > 0 && (
                    <div className="bg-white p-3 rounded-xl border border-slate-100 flex justify-between items-center shadow-sm">
                      <span>المواصلات الداخلية:</span>
                      <span className="font-bold text-primary">{transportCost} SAR</span>
                    </div>
                  )}
                </div>
                
                <div className="bg-secondary/10 p-5 rounded-2xl border border-secondary/20 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div>
                    <p className="text-sm font-bold text-slate-800 mb-1">إجمالي التكلفة التقديرية (للشخص الواحد):</p>
                    <p className="text-xs text-slate-500">* هذا السعر تقديري وقابل للتغيير حسب توفر الحجوزات والمواسم.</p>
                  </div>
                  <div className="text-2xl md:text-3xl font-black text-secondary-bright">
                    {totalEstimate.toLocaleString("en-US")} SAR
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <button
                onClick={() => setView("DEPARTURE_INFO")}
                className="text-slate-700 hover:text-secondary transition-colors font-bold uppercase cursor-pointer"
              >
                تعديل التفاصيل
              </button>
              <button
                onClick={() => setShowContactForm(true)}
                className="gold-shimmer bg-gradient-to-l from-primary to-primary/80 border border-slate-200 text-on-primary px-12 py-4 rounded-full font-bold text-lg uppercase tracking-widest btn-glow transition-all cursor-pointer"
              >
                تأكيد الحجز والدفع
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Contact Form Overlay */}
      {showContactForm && !bookingSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 md:p-8 shadow-2xl relative border border-slate-200 text-right animate-zoom-in" dir="rtl">
            <h3 className="text-xl font-bold text-primary mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">contact_phone</span>
              معلومات الاتصال للحجز
            </h3>
            <p className="text-sm text-slate-600 mb-6">
              يرجى إدخال اسمك ورقم جوالك لنقوم بحفظ مسار رحلتك والتواصل معك لتأكيد الحجوزات.
            </p>

            {bookingError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm font-bold mb-4">
                {bookingError}
              </div>
            )}

            <form
              onSubmit={async (e) => {
                e.preventDefault();
                setIsSubmitting(true);
                setBookingError("");

                try {
                  const res = await fetch("/api/booking", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      clientName,
                      clientPhone,
                      startDate: state.startDate,
                      endDate: state.departureDate,
                      departingFlightId: state.flightId || null,
                      returningFlightId: returningFlight?.id || null,
                      pricing: totalEstimate,
                      cityStays: state.cityStays,
                    }),
                  });
                  const data = await res.json();
                  if (data.error) {
                    setBookingError(data.error);
                  } else {
                    setBookingSuccess(true);
                  }
                } catch (err) {
                  setBookingError("حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً.");
                } finally {
                  setIsSubmitting(false);
                }
              }}
              className="space-y-4"
            >
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">الاسم بالكامل</label>
                <input
                  type="text"
                  required
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
                  placeholder="مثال: محمد أحمد"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">رقم الجوال</label>
                <input
                  type="tel"
                  required
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm text-left"
                  placeholder="05xxxxxxxx"
                  dir="ltr"
                />
              </div>

              <div className="pt-4 flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => setShowContactForm(false)}
                  className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all flex-1"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="gold-shimmer bg-primary text-background px-6 py-3 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 transition-all flex-1 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? "جاري الإرسال..." : "إرسال الطلب"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Booking Success Screen */}
      {bookingSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-primary/80 backdrop-blur-md">
          <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center border border-slate-200 animate-zoom-in" dir="rtl">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-500">
              <span className="material-symbols-outlined text-4xl">check_circle</span>
            </div>
            <h3 className="text-2xl font-bold text-primary mb-3">تم إرسال طلبك بنجاح!</h3>
            <p className="text-slate-600 mb-8 leading-relaxed">
              شكراً لك {clientName}. تم حفظ برنامج رحلتك المخصص بـ {totalEstimate.toLocaleString()} SAR. سيتواصل معك مستشار السفر لدينا قريباً عبر الرقم {clientPhone} لمراجعة التفاصيل وتأكيد الحجز.
            </p>
            <button
              onClick={() => {
                if (onClose) onClose();
              }}
              className="gold-shimmer bg-primary text-background w-full py-3 rounded-xl font-bold text-base cursor-pointer"
            >
              إغلاق النافذة
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
