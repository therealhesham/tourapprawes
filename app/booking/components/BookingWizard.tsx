"use client";

import { useState, useEffect } from "react";
import {
  hotelCategories,
  transportMethods,
} from "../data/mockData";

type CityStay = {
  cityId: string;
  hotelCategory: string;
  transportFromPrevious?: string;
  nights?: number;
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

// Where an in-progress wizard is stashed when submitting requires a login first
const WIZARD_SNAPSHOT_KEY = "bookingWizardSnapshot";

export default function BookingWizard({ onClose }: { onClose?: () => void }) {
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

  const [flightConfirmed, setFlightConfirmed] = useState(false);
  const [flightChoice, setFlightChoice] = useState<"yes" | "no" | null>(null);
  const [citiesConfirmed, setCitiesConfirmed] = useState(false);

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
  const [currentCity, setCurrentCity] = useState<Partial<CityStay>>({ nights: 1 });

  // Restore an in-progress wizard stashed before a login redirect
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(WIZARD_SNAPSHOT_KEY);
      if (!saved) return;
      sessionStorage.removeItem(WIZARD_SNAPSHOT_KEY);
      const snapshot = JSON.parse(saved);
      if (snapshot.state) setState(snapshot.state);
      setFlightConfirmed(!!snapshot.flightConfirmed);
      setFlightChoice(snapshot.flightChoice ?? null);
      setCitiesConfirmed(!!snapshot.citiesConfirmed);
      setClientName(snapshot.clientName || "");
      setClientPhone(snapshot.clientPhone || "");
      setShowContactForm(true);
    } catch {
      sessionStorage.removeItem(WIZARD_SNAPSHOT_KEY);
    }
  }, []);

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

    switch (categoryId) {
      case 'budget': return "فندق اقتصادي مميز";
      case 'medium': return baseName + " (إقامة متوسطة)";
      case 'luxury': return baseName + " (إقامة فاخرة VIP)";
      default:
        return baseName + " (اختيار روائس الموصى به)";
    }
  };

  const availableCities = state.country ? dbCities[state.country] || [] : [];

  const HOTEL_RATES: Record<string, number> = {
    budget: 250,
    medium: 450,
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

  const totalNights = totalDays > 1 ? totalDays - 1 : 1;
  const nightsAllocated = state.cityStays.reduce((sum, stay) => sum + (stay.nights || 1), 0);
  const nightsRemaining = Math.max(0, totalNights - nightsAllocated);

  const hotelCost = (() => {
    if (state.cityStays.length === 0) return 0;
    return state.cityStays.reduce((sum, stay) => {
      const rate = HOTEL_RATES[stay.hotelCategory] || 450;
      return sum + (rate * (stay.nights || 1));
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

    const lastCityStay = state.cityStays[state.cityStays.length - 1];
    const lastCityId = lastCityStay.cityId;
    const countryCities = dbCities[state.country] || [];

    let departedAirportId = "";
    const airportInCity = dbAirports.destinationAirports.find(a => a.cityId === lastCityId);

    if (airportInCity) {
      departedAirportId = airportInCity.id;
    } else {
      const capitalNames = ["تبليسي", "تيرانا", "ماليه", "القاهرة"];
      const capitalCity = countryCities.find(c => capitalNames.includes(c.name));
      if (capitalCity) {
        const capitalAirport = dbAirports.destinationAirports.find(a => a.cityId === capitalCity.id);
        if (capitalAirport) {
          departedAirportId = capitalAirport.id;
        }
      }

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

    let targetSaudiAirportId = "";
    if (state.includeFlight && state.flightId) {
      const outboundFlight = dbFlights.find(f => f.id === state.flightId);
      if (outboundFlight) {
        targetSaudiAirportId = outboundFlight.departedAirportId;
      }
    }

    if (!targetSaudiAirportId) {
      const ruhAirport = dbAirports.saudiAirports.find(a => a.airportName.includes("خالد") || a.city?.name === "الرياض");
      targetSaudiAirportId = ruhAirport ? ruhAirport.id : (dbAirports.saudiAirports[0]?.id || "");
    }

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

  const handleNextFlight = (include: boolean, fClass?: string, estimate?: number, flightId?: string, flightAirway?: string) => {
    setState(prev => ({
      ...prev,
      includeFlight: include,
      flightClass: fClass || "",
      flightEstimate: estimate || 0,
      flightId: flightId || "",
      flightAirway: flightAirway || ""
    }));
    setFlightConfirmed(true);
  };

  const handleAddCity = () => {
    if (currentCity.cityId && currentCity.hotelCategory) {
      if (state.cityStays.length > 0 && !currentCity.transportFromPrevious) {
        return;
      }
      setState((prev) => ({
        ...prev,
        cityStays: [...prev.cityStays, currentCity as CityStay],
      }));
      setCurrentCity({ nights: 1 });
    }
  };

  // Conditions for cascading sections
  const isDateSectionComplete = state.startDate && state.departureDate && state.departureDate >= state.startDate;
  const isCountrySectionComplete = isDateSectionComplete && state.country !== "";
  const isFlightSectionComplete = isCountrySectionComplete && flightConfirmed;

  return (
    <div className="w-full mx-auto pb-24 relative" dir="rtl">

      {/* Page Title */}
      <div className="mb-12 text-center px-8 sm:px-0">
        <h2 className="text-3xl sm:text-4xl md:font-headline-lg md:text-headline-lg font-bold text-primary mb-4 animate-fade-in-up">
          صمم رحلتك
        </h2>
        <p className="font-body-md text-slate-600 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          ابنِ مسار رحلتك المثالي خطوة بخطوة بكل سهولة
        </p>
      </div>

      <div className="space-y-6">

        {/* ─── STEP 1: Date Range Selection ─── */}
        <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-xl animate-fade-in-up transition-all">
          <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <span className="material-symbols-outlined text-secondary">calendar_month</span>
            1. تواريخ الرحلة
          </h3>
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
            <p className="text-red-500 text-sm font-bold mt-4">
              * يجب أن يكون تاريخ العودة بعد أو مساوياً لتاريخ الذهاب.
            </p>
          )}
        </section>

        {/* ─── STEP 2: Destination ─── */}
        {isDateSectionComplete && (
          <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-xl animate-fade-in-up transition-all" style={{ animationDelay: '100ms' }}>
            <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">public</span>
              2. الوجهة السياحية
            </h3>
            {dataLoading ? (
              <div className="flex justify-center items-center py-10">
                <div className="w-8 h-8 border-4 border-secondary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {dbCountries.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => {
                      setState({ ...state, country: c.id });
                      setFlightConfirmed(false); // reset subsequent steps
                      setFlightChoice(null);
                      setCitiesConfirmed(false);
                    }}
                    className={`py-3 px-3 md:py-4 md:px-6 rounded-xl border transition-all duration-300 text-base md:text-lg ${state.country === c.id
                      ? "gold-shimmer bg-primary text-white border-primary shadow-lg ring-2 ring-secondary/50 font-black"
                      : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 font-bold"
                      }`}
                  >
                    {c.name}
                  </button>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ─── STEP 3: Flight Selection ─── */}
        {isCountrySectionComplete && (() => {
          const countryFlights = dbFlights.filter((f) => f.countryId === state.country);
          const defaultFlightEstimate = countryFlights.length > 0 ? countryFlights[0].approximatePrice : 1800;
          const defaultAirway = countryFlights.length > 0 ? countryFlights[0].airWayName : "طيران تقديري";

          return (
            <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-xl animate-fade-in-up transition-all" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">flight</span>
                3. خيارات الطيران
              </h3>

              {!flightConfirmed ? (
                <div className="space-y-6">
                  <p className="font-bold text-lg text-primary">هل ترغب بإضافة حجز طيران؟</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                    <button
                      onClick={() => {
                        setFlightChoice("yes");
                        setState(prev => ({
                          ...prev,
                          includeFlight: true,
                          flightEstimate: defaultFlightEstimate,
                          flightAirway: defaultAirway,
                          flightId: countryFlights.length > 0 ? countryFlights[0].id : "",
                        }));
                      }}
                      className={`py-4 px-4 md:px-6 rounded-xl border transition-all duration-300 text-base md:text-lg ${flightChoice === "yes"
                        ? "gold-shimmer bg-primary text-white border-primary shadow-lg ring-2 ring-secondary/50 font-black"
                        : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 font-bold"
                        }`}
                    >
                      نعم، أرغب بإضافة حجز طيران
                      <span className={`block text-sm mt-1 font-normal ${flightChoice === "yes" ? "text-white/80" : "text-slate-500"}`}>
                        سعر تقديري: {defaultFlightEstimate} SAR للشخص
                      </span>
                    </button>
                    <button
                      onClick={() => {
                        setFlightChoice("no");
                        setState(prev => ({
                          ...prev,
                          includeFlight: false,
                          flightEstimate: 0,
                          flightAirway: "",
                          flightId: "",
                        }));
                      }}
                      className={`py-4 px-4 md:px-6 rounded-xl border transition-all duration-300 text-base md:text-lg ${flightChoice === "no"
                        ? "gold-shimmer bg-primary text-white border-primary shadow-lg ring-2 ring-secondary/50 font-black"
                        : "bg-surface-container-lowest text-on-surface border-outline-variant/40 hover:border-secondary/50 hover:bg-white/5 font-bold"
                        }`}
                    >
                      لا، سأقوم بحجز الطيران بنفسي
                    </button>
                  </div>
                  <div className="flex justify-end">
                    <button
                      onClick={() => setFlightConfirmed(true)}
                      disabled={flightChoice === null}
                      className={`gold-shimmer bg-primary text-background w-full sm:w-auto px-4 sm:px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm sm:text-base btn-glow transition-all ${flightChoice === null ? "opacity-50 cursor-not-allowed" : ""}`}
                    >
                      متابعة
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex justify-between items-center bg-slate-50 border border-slate-200/60 p-4 rounded-xl">
                  <div>
                    <span className="text-slate-500 text-sm block">الخيار المحدد:</span>
                    <span className="font-bold text-primary text-lg">
                      {state.includeFlight ? `مع طيران (${state.flightEstimate} SAR)` : "بدون طيران"}
                    </span>
                  </div>
                  <button onClick={() => { setFlightConfirmed(false); setCitiesConfirmed(false); }} className="text-secondary text-sm font-bold underline">تغيير الاختيار</button>
                </div>
              )}
            </section>
          );
        })()}

        {/* ─── STEP 4: City Details & Itinerary ─── */}
        {isFlightSectionComplete && (() => {
          const previousCityId = lastCityAdded?.id;
          const targetCityId = currentCity.cityId;
          const customTransports = dbTransports.filter(
            (t) => t.cityId === previousCityId && t.arrivalCityId === targetCityId
          );

          return (
            <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-xl animate-fade-in-up transition-all" style={{ animationDelay: '100ms' }}>
              <h3 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary">location_city</span>
                4. خط السير وتفاصيل الإقامة
              </h3>

              {state.cityStays.length > 0 && (
                <div className="mb-8 p-6 bg-slate-50 border border-slate-200/60 rounded-2xl">
                  <h4 className="font-bold text-primary mb-4">المدن المضافة:</h4>
                  <ul className="space-y-4">
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
                        <li key={idx} className="relative pl-6 md:pl-0 pr-6 border-r-2 border-secondary/30 pb-4 last:pb-0">
                          <div className="absolute top-0 -right-[9px] w-4 h-4 rounded-full bg-secondary shadow-[0_0_10px_rgba(212,160,23,1)]" />
                          {idx > 0 && transportName && (
                            <div className="mb-2 text-sm text-secondary-bright font-bold flex items-center gap-2">
                              <span className="material-symbols-outlined text-base">directions_car</span>
                              {transportName}
                            </div>
                          )}
                          <div className="font-bold text-lg text-primary">{city?.name} ({stay.nights || 1} ليالي)</div>
                          <div className="text-sm text-slate-600 mt-1">الفندق المقترح: {getSuggestedHotel(stay.cityId, stay.hotelCategory)}</div>
                        </li>
                      );
                    })}
                  </ul>

                  {!citiesConfirmed && (
                    <div className="mt-6 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                      {nightsRemaining > 0 ? (
                        <span className="text-amber-600 font-bold text-sm">متبقي {nightsRemaining} ليالي لم يتم توزيعها.</span>
                      ) : <div />}
                      <button
                        onClick={() => setCitiesConfirmed(true)}
                        className="gold-shimmer bg-primary text-background w-full sm:w-auto px-4 sm:px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-sm sm:text-base btn-glow transition-all"
                      >
                        إنهاء خط السير والمتابعة للملخص
                      </button>
                    </div>
                  )}
                </div>
              )}

              {!citiesConfirmed && (
                <div className="space-y-6">
                  <h4 className="font-bold text-primary">{state.cityStays.length === 0 ? "أضف مدينتك الأولى:" : "إضافة مدينة أخرى:"}</h4>

                  {state.cityStays.length > 0 && (
                    <div>
                      <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">
                        وسيلة المواصلات من ({lastCityAdded?.name})
                      </label>
                      <select
                        value={currentCity.transportFromPrevious || ""}
                        onChange={(e) => setCurrentCity({ ...currentCity, transportFromPrevious: e.target.value })}
                        className="w-full py-4  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary outline-none"
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
                    <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">عدد الليالي</label>
                    <input
                      type="number"
                      min="1"
                      max={nightsRemaining > 0 ? nightsRemaining : undefined}
                      value={currentCity.nights || 1}
                      onChange={(e) => setCurrentCity({ ...currentCity, nights: parseInt(e.target.value) || 1 })}
                      className="w-full py-4 bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary outline-none px-4"
                    />
                    {nightsRemaining > 0 && <p className="text-xs text-slate-500 mt-1">المتبقي من إجمالي الرحلة: {nightsRemaining} ليالي</p>}
                  </div>

                  <div>
                    <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">المدينة</label>
                    <select
                      value={currentCity.cityId || ""}
                      onChange={(e) => setCurrentCity({ ...currentCity, cityId: e.target.value })}
                      className="w-full py-4  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary outline-none"
                    >
                      <option value="">اختر المدينة...</option>
                      {availableCities.filter(c => !state.cityStays.find(s => s.cityId === c.id)).map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-label-sm text-secondary uppercase tracking-widest mb-3">فئة الفندق</label>
                    <select
                      value={currentCity.hotelCategory || ""}
                      onChange={(e) => setCurrentCity({ ...currentCity, hotelCategory: e.target.value })}
                      className="w-full py-4  bg-surface-container-lowest border border-outline-variant/40 rounded-xl focus:border-secondary outline-none"
                    >
                      <option value="">اختر فئة الفندق...</option>
                      {hotelCategories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleAddCity}
                      disabled={!currentCity.cityId || !currentCity.hotelCategory || (state.cityStays.length > 0 && !currentCity.transportFromPrevious)}
                      className="border border-secondary text-secondary hover:bg-secondary/10 px-8 py-3 rounded-xl font-bold uppercase disabled:opacity-50 transition-all"
                    >
                      + إضافة المدينة
                    </button>
                  </div>
                </div>
              )}

              {citiesConfirmed && (
                <div className="flex justify-end mt-4">
                  <button onClick={() => setCitiesConfirmed(false)} className="text-secondary text-sm font-bold underline">
                    العودة لتعديل المدن
                  </button>
                </div>
              )}
            </section>
          );
        })()}

        {/* ─── STEP 5: Summary ─── */}
        {citiesConfirmed && (
          <section className="glass-panel p-6 md:p-8 rounded-3xl border border-slate-200/60 shadow-xl animate-fade-in-up transition-all" style={{ animationDelay: '200ms' }}>
            <h3 className="text-2xl font-bold text-primary mb-8 border-b border-slate-200/60 pb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-secondary">receipt_long</span>
              ملخص الحجز
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 pb-6 border-b border-slate-200/60 text-center sm:text-right">
              <div>
                <p className="text-sm text-slate-500 mb-1">الوجهة</p>
                <p className="font-bold text-lg text-primary">{dbCountries.find(c => c.id === state.country)?.name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">الذهاب</p>
                <p className="font-bold text-lg text-primary">{state.startDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">العودة</p>
                <p className="font-bold text-lg text-primary">{state.departureDate}</p>
              </div>
              <div>
                <p className="text-sm text-slate-500 mb-1">المدة الإجمالية</p>
                <p className="font-bold text-lg text-primary">{totalDays} يوم / {totalDays - 1 > 0 ? totalDays - 1 : 1} ليلة</p>
              </div>
            </div>

            {lastCityAdded && !lastCityAdded.hasAirport && (
              <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 space-y-2">
                <div className="font-bold flex items-center gap-2">
                  <span className="material-symbols-outlined text-amber-500">info</span>
                  تنويه بخصوص مطار العودة
                </div>
                <p className="text-sm">
                  بما أن مدينة العودة ({lastCityAdded.name}) لا تحتوي على مطار جوي،
                  فقد تم تحديد رحلة العودة تلقائياً من المطار المناسب.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-sm">
              {state.includeFlight && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex justify-between items-center text-slate-700">
                  <span>الطيران ({state.flightAirway}):</span>
                  <span className="font-bold text-secondary">{flightCost} SAR</span>
                </div>
              )}
              {hotelCost > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex justify-between items-center text-slate-700">
                  <span>الفنادق ({nightsAllocated} ليالي):</span>
                  <span className="font-bold text-secondary">{Math.round(hotelCost)} SAR</span>
                </div>
              )}
              {transportCost > 0 && (
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200/60 flex justify-between items-center text-slate-700">
                  <span>المواصلات الداخلية:</span>
                  <span className="font-bold text-secondary">{transportCost} SAR</span>
                </div>
              )}
            </div>

            <div className="bg-slate-50 border border-slate-200/60 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-center gap-6">
              <div>
                <p className="text-base font-bold text-primary mb-1">إجمالي التكلفة التقديرية (للشخص الواحد):</p>
                <p className="text-xs text-slate-500">* هذا السعر تقديري وقابل للتغيير حسب توفر الحجوزات والمواسم.</p>
              </div>
              <div className="text-3xl md:text-4xl font-black text-secondary">
                {totalEstimate.toLocaleString("en-US")} SAR
              </div>
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={() => setShowContactForm(true)}
                className="gold-shimmer bg-primary text-white px-12 py-4 rounded-full font-bold text-xl tracking-widest btn-glow transition-all w-full md:w-auto"
              >
                تأكيد الحجز
              </button>
            </div>
          </section>
        )}
      </div>

      {/* Contact Form Overlay (Kept as Modal to ensure focus on form) */}
      {showContactForm && !bookingSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-md">
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
                  if (res.status === 401) {
                    // Stash the wizard so it survives the login round-trip
                    sessionStorage.setItem(
                      WIZARD_SNAPSHOT_KEY,
                      JSON.stringify({ state, flightConfirmed, flightChoice, citiesConfirmed, clientName, clientPhone })
                    );
                    window.location.href = "/login?callbackUrl=" + encodeURIComponent("/booking/wizard");
                    return;
                  }
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
                <input type="text" required value={clientName} onChange={(e) => setClientName(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm" placeholder="مثال: محمد أحمد" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs text-secondary font-bold">رقم الجوال</label>
                <input type="tel" required value={clientPhone} onChange={(e) => setClientPhone(e.target.value)} className="w-full py-3 px-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm text-left" placeholder="05xxxxxxxx" dir="ltr" />
              </div>
              <div className="pt-4 flex justify-between gap-4">
                <button type="button" onClick={() => setShowContactForm(false)} className="border border-slate-200 text-slate-700 hover:bg-slate-50 px-6 py-3 rounded-xl font-bold text-sm cursor-pointer transition-all flex-1">
                  إلغاء
                </button>
                <button type="submit" disabled={isSubmitting} className="gold-shimmer bg-primary text-background px-6 py-3 rounded-xl font-bold text-sm cursor-pointer disabled:opacity-50 transition-all flex-1 flex items-center justify-center gap-2">
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
                if (typeof window !== "undefined") {
                  window.location.href = "/";
                }
              }}
              className="gold-shimmer bg-primary text-background w-full py-3 rounded-xl font-bold text-base cursor-pointer"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
