"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Icon from "@/components/Icon";

const destinationsByCountry: Record<string, { value: string; label: string }[]> = {
  id: [
    { value: "bali", label: "بالي" },
    { value: "jakarta", label: "جاكرتا" },
    { value: "lombok", label: "لومبوك" },
  ],
  mv: [
    { value: "male", label: "ماليه" },
    { value: "maafushi", label: "مافوشي" },
  ],
  eg: [
    { value: "elgouna", label: "الجونة" },
    { value: "sharm", label: "شرم الشيخ" },
    { value: "cairo", label: "القاهرة" },
    { value: "hurghada", label: "الغردقة" },
  ],
  tr: [
    { value: "istanbul", label: "إسطنبول" },
    { value: "antalya", label: "أنطاليا" },
    { value: "cappadocia", label: "كابادوكيا" },
  ],
  my: [
    { value: "kuala", label: "كوالالمبور" },
    { value: "langkawi", label: "لنكاوي" },
    { value: "penang", label: "بينانج" },
  ]
};

function NewPackageForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("id");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Form States
  const [name, setName] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState("");
  const [originalPricing, setOriginalPricing] = useState("");
  const [days, setDays] = useState("");
  const [image, setImage] = useState("/images/bali.png");
  const [popular, setPopular] = useState(false);
  const [rating, setRating] = useState("5");
  const [reviews, setReviews] = useState("0");
  const [includesText, setIncludesText] = useState("");
  const [countryCode, setCountryCode] = useState("id");
  const [destinationCode, setDestinationCode] = useState("bali");

  // Flights & Itinerary States
  const [departingFlightId, setDepartingFlightId] = useState("");
  const [returningFlightId, setReturningFlightId] = useState("");
  const [formCityStays, setFormCityStays] = useState<any[]>([]);

  // Transient state for adding cities
  const [cityToAdd, setCityToAdd] = useState("");
  const [hotelCategoryToAdd, setHotelCategoryToAdd] = useState("auto");
  const [transitMethodToAdd, setTransitMethodToAdd] = useState("car");

  // Supporting Lists
  const [dbCountries, setDbCountries] = useState<{ id: string; name: string }[]>([]);
  const [dbCities, setDbCities] = useState<Record<string, { id: string; name: string }[]>>({});
  const [flightsList, setFlightsList] = useState<any[]>([]);
  const [returningFlightsList, setReturningFlightsList] = useState<any[]>([]);
  const [transportsList, setTransportsList] = useState<any[]>([]);

  // Features check list state
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>(["flight", "hotel"]);

  const featureOptions = [
    { value: "flight", label: "طيران (flight)" },
    { value: "hotel", label: "فندق (hotel)" },
    { value: "restaurant", label: "مطعم/إفطار (restaurant)" },
    { value: "directions_car", label: "سيارة خاصة (directions_car)" },
    { value: "sailing", label: "إبحار/قارب (sailing)" },
  ];

  const loadSupportingData = async () => {
    try {
      const fetchCities = fetch("/api/admin/cities").then(res => res.json());
      const fetchFlights = fetch("/api/admin/flights").then(res => res.json());
      const fetchReturningFlights = fetch("/api/admin/returning-flights").then(res => res.json());
      const fetchTransports = fetch("/api/admin/transports").then(res => res.json());

      const [citiesData, flightsData, returningFlightsData, transportsData] = await Promise.all([
        fetchCities,
        fetchFlights,
        fetchReturningFlights,
        fetchTransports
      ]);

      if (Array.isArray(citiesData)) {
        const flattenedCountries: { id: string; name: string }[] = [];
        const citiesRecord: Record<string, { id: string; name: string }[]> = {};

        citiesData.forEach((dest: any) => {
          dest.countries.forEach((country: any) => {
            flattenedCountries.push({ id: country.id, name: country.name });
            citiesRecord[country.id] = country.cities.map((city: any) => ({
              id: city.id,
              name: city.name,
            }));
          });
        });

        setDbCountries(flattenedCountries);
        setDbCities(citiesRecord);
      }

      if (Array.isArray(flightsData)) setFlightsList(flightsData);
      if (Array.isArray(returningFlightsData)) setReturningFlightsList(returningFlightsData);
      if (Array.isArray(transportsData)) setTransportsList(transportsData);
    } catch (err) {
      console.error("Error loading packages support data:", err);
    }
  };

  useEffect(() => {
    loadSupportingData();
  }, []);

  useEffect(() => {
    if (editId) {
      fetch("/api/admin/packages")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const pkg = data.find((p: any) => p.id === editId);
            if (pkg) {
              setName(pkg.name || "");
              setTitle(pkg.title || "");
              setDescription(pkg.description || "");
              setPricing(pkg.pricing !== undefined ? String(pkg.pricing) : "");
              setOriginalPricing(pkg.originalPricing !== undefined && pkg.originalPricing !== null ? String(pkg.originalPricing) : "");
              setDays(pkg.days || "");
              setImage(pkg.image || "/images/bali.png");
              setPopular(pkg.popular || false);
              setRating(pkg.rating !== undefined ? String(pkg.rating) : "5");
              setReviews(pkg.reviews !== undefined ? String(pkg.reviews) : "0");
              setIncludesText(pkg.includesText || "");
              setCountryCode(pkg.countryCode || "id");
              setDestinationCode(pkg.destinationCode || "");
              setDepartingFlightId(pkg.departingFlightId || "");
              setReturningFlightId(pkg.returningFlightId || "");

              // Parse features safely
              let parsedFeatures: string[] = ["flight", "hotel"];
              if (pkg.features) {
                if (Array.isArray(pkg.features)) {
                  parsedFeatures = pkg.features;
                } else if (typeof pkg.features === "string") {
                  try {
                    parsedFeatures = JSON.parse(pkg.features);
                  } catch (e) {
                    console.error("Error parsing features:", e);
                  }
                }
              }
              setSelectedFeatures(parsedFeatures);

              // Parse cityStays safely
              let parsedCityStays: any[] = [];
              if (pkg.cityStays) {
                if (Array.isArray(pkg.cityStays)) {
                  parsedCityStays = pkg.cityStays;
                } else if (typeof pkg.cityStays === "string") {
                  try {
                    parsedCityStays = JSON.parse(pkg.cityStays);
                  } catch (e) {
                    console.error("Error parsing cityStays:", e);
                  }
                }
              }
              setFormCityStays(parsedCityStays);
            }
          }
        })
        .catch(err => console.error("Error loading package data for edit:", err));
    }
  }, [editId]);

  const getCountryDbId = () => {
    const codeToNameMap: Record<string, string> = {
      id: "إندونيسيا",
      mv: "المالديف",
      eg: "مصر",
      tr: "تركيا",
      my: "ماليزيا",
    };
    const targetName = codeToNameMap[countryCode || ""] || "";
    const found = dbCountries.find(c => c.name === targetName);
    return found ? found.id : "";
  };

  const handleFeatureToggle = (val: string) => {
    if (selectedFeatures.includes(val)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== val));
    } else {
      setSelectedFeatures([...selectedFeatures, val]);
    }
  };

  const handleAddCityStay = () => {
    if (!cityToAdd) return;
    const newStay: any = {
      cityId: cityToAdd,
      hotelCategory: hotelCategoryToAdd,
    };
    if (formCityStays.length > 0) {
      newStay.transportFromPrevious = transitMethodToAdd;
    }
    setFormCityStays([...formCityStays, newStay]);
    setCityToAdd("");
    setHotelCategoryToAdd("auto");
    setTransitMethodToAdd("car");
  };

  const handleRemoveCityStay = (index: number) => {
    const updated = formCityStays.filter((_, i) => i !== index);
    if (updated.length > 0 && updated[0].transportFromPrevious) {
      delete updated[0].transportFromPrevious;
    }
    setFormCityStays(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !title || !description || !pricing || !days || !includesText) {
      setError("يرجى ملء جميع الحقول المطلوبة.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const payload: any = {
      name,
      title,
      description,
      pricing: Number(pricing),
      originalPricing: originalPricing ? Number(originalPricing) : null,
      days,
      image,
      popular,
      rating: Number(rating),
      reviews: Number(reviews),
      features: selectedFeatures,
      includesText,
      countryCode,
      destinationCode: destinationCode || null,
      departingFlightId: departingFlightId || null,
      returningFlightId: returningFlightId || null,
      cityStays: formCityStays,
    };

    if (editId) {
      payload.id = editId;
    }

    try {
      const res = await fetch("/api/admin/packages", {
        method: editId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.error) {
        setError(data.error);
      } else {
        setMessage(editId ? "تم تعديل الباقة بنجاح." : "تم إضافة الباقة بنجاح.");
        setTimeout(() => {
          router.push("/admin/packages");
        }, 1500);
      }
    } catch (err) {
      setError("حدث خطأ أثناء حفظ التغييرات.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 text-right pb-10" dir="rtl">
      {/* Header with back navigation */}
      <div className="flex justify-between items-center border-b border-slate-100 pb-4">
        <div>
          <h2 className="text-3xl font-extrabold text-primary mb-2 border-r-4 border-secondary pr-3">
            {editId ? "تعديل الباقة السياحية" : "إضافة باقة جديدة"}
          </h2>
          <p className="text-slate-600">
            {editId ? "قم بتعديل تفاصيل الباقة وحفظ التعديلات في قاعدة البيانات" : "قم بتعبئة بيانات الباقة لتظهر للعملاء في واجهة الحجز"}
          </p>
        </div>
        <Link
          href="/admin/packages"
          className="py-2.5 px-5 bg-slate-150 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-2 cursor-pointer text-sm"
        >
          <Icon name="arrow_back" className="text-lg" />
          العودة للقائمة
        </Link>
      </div>

      {message && <div className="p-4 bg-green-50 border border-green-200 text-green-700 rounded-xl font-bold text-center mb-4">{message}</div>}
      {error && <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-xl font-bold text-center mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Core details card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-md space-y-5">
          <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2">تفاصيل الباقة العامة</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Country */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">البلد</label>
              <select
                value={countryCode || ""}
                onChange={(e) => {
                  const newCountry = e.target.value;
                  setCountryCode(newCountry);
                  const defaultDest = destinationsByCountry[newCountry]?.[0]?.value || "";
                  setDestinationCode(defaultDest);
                }}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="id">إندونيسيا</option>
                <option value="mv">المالديف</option>
                <option value="eg">مصر</option>
                <option value="tr">تركيا</option>
                <option value="my">ماليزيا</option>
              </select>
            </div>

            {/* Destination Selector */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">المدينة/رمز الوجهة</label>
              <select
                value={destinationCode || ""}
                onChange={(e) => setDestinationCode(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="">-- اختر الوجهة --</option>
                {(destinationsByCountry[countryCode || ""] || []).map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label} ({opt.value})
                  </option>
                ))}
              </select>
            </div>

            {/* Name */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">اسم الباقة (الوجهة والبلد)</label>
              <input
                type="text"
                required
                placeholder="مثال: جزيرة بالي، إندونيسيا"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>

            {/* Title */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">عنوان الباقة/البرنامج</label>
              <input
                type="text"
                required
                placeholder="مثال: سحر الطبيعة الاستوائية"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>

            {/* Pricing */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">السعر الحالي (ر.س)</label>
              <input
                type="number"
                required
                placeholder="مثال: 6500"
                value={pricing}
                onChange={(e) => setPricing(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>

            {/* Original Pricing */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">السعر الأصلي (ر.س - اختياري)</label>
              <input
                type="number"
                placeholder="لإظهار خصم (مثال: 7200)"
                value={originalPricing}
                onChange={(e) => setOriginalPricing(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>

            {/* Duration */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">المدة بالأيام والليالي</label>
              <input
                type="text"
                required
                placeholder="مثال: 7 أيام / 6 ليالي"
                value={days}
                onChange={(e) => setDays(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>

            {/* Cover Image */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">صورة الغلاف</label>
              <select
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="/images/bali.png">بالي (bali.png)</option>
                <option value="/images/maldives.png">المالديف (maldives.png)</option>
                <option value="/images/elgouna.png">الجونة (elgouna.png)</option>
                <option value="/images/turkey.png">تركيا (turkey.png)</option>
                <option value="/images/malaysia.png">ماليزيا (malaysia.png)</option>
              </select>
            </div>

            {/* Rating */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">التقييم (النجوم)</label>
              <select
                value={rating}
                onChange={(e) => setRating(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="5">5 نجوم</option>
                <option value="4">4 نجوم</option>
                <option value="3">3 نجوم</option>
              </select>
            </div>

            {/* Reviews count */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">عدد التقييمات/المراجعات</label>
              <input
                type="number"
                placeholder="مثال: 120"
                value={reviews}
                onChange={(e) => setReviews(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-secondary font-bold">نص الميزات المشمولة (بالتفصيل)</label>
            <input
              type="text"
              required
              placeholder="مثال: طيران، فندق 5 نجوم، إفطار، تنقلات"
              value={includesText}
              onChange={(e) => setIncludesText(e.target.value)}
              className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs text-secondary font-bold">وصف البرنامج السياحي بالتفصيل</label>
            <textarea
              required
              rows={4}
              placeholder="اكتب وصفاً جذاباً للبرنامج السياحي..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm leading-relaxed"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
            {/* Features options checkboxes */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">الميزات المشمولة (بالأيقونة)</label>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs">
                {featureOptions.map((opt) => (
                  <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={selectedFeatures.includes(opt.value)}
                      onChange={() => handleFeatureToggle(opt.value)}
                      className="rounded text-secondary focus:ring-secondary cursor-pointer"
                    />
                    <span>{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Popular checkbox */}
            <div className="flex items-center gap-2 bg-slate-50 p-4 rounded-xl border border-slate-100">
              <input
                type="checkbox"
                id="popular-check"
                checked={popular}
                onChange={(e) => setPopular(e.target.checked)}
                className="rounded text-secondary focus:ring-secondary w-4 h-4 cursor-pointer"
              />
              <label htmlFor="popular-check" className="text-xs font-bold text-slate-700 cursor-pointer">
                تمييز الباقة كـ "الأكثر طلباً" (رائج)
              </label>
            </div>
          </div>
        </div>

        {/* Flights & Itinerary card */}
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/60 shadow-md space-y-5">
          <h3 className="text-lg font-bold text-primary border-b border-slate-100 pb-2 flex items-center gap-1">
            <Icon name="flight" className="text-secondary" />
            إعدادات الطيران الدولي والمسار الداخلي
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Departing Flight */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">طيران الذهاب الدولي</label>
              <select
                value={departingFlightId}
                onChange={(e) => setDepartingFlightId(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="">بدون طيران</option>
                {flightsList
                  .filter(f => f.countryId === getCountryDbId())
                  .map(f => (
                    <option key={f.id} value={f.id}>
                      {f.airWayName} - {f.departedAirport?.airportName} إلى {f.arrivalAirport?.airportName} ({f.approximatePrice} ر.س)
                    </option>
                  ))
                }
              </select>
            </div>

            {/* Returning Flight */}
            <div className="flex flex-col gap-2">
              <label className="text-xs text-secondary font-bold">طيران العودة الدولي</label>
              <select
                value={returningFlightId}
                onChange={(e) => setReturningFlightId(e.target.value)}
                className="w-full py-2.5  bg-slate-50 border border-slate-200 rounded-xl focus:border-secondary outline-none text-sm cursor-pointer"
              >
                <option value="">بدون طيران</option>
                {returningFlightsList
                  .filter(f => f.countryId === getCountryDbId())
                  .map(f => (
                    <option key={f.id} value={f.id}>
                      {f.airWayName} - {f.departedAirport?.airportName} إلى {f.arrivalAirport?.airportName} ({f.approximatePrice} ر.س)
                    </option>
                  ))
                }
              </select>
            </div>
          </div>

          {/* Itinerary stays builder */}
          <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200/60">
            <span className="text-sm font-bold text-slate-700 block">إضافة وتعديل المدن في المسار (الترانزيت والمواصلات الداخلية)</span>

            <div className="bg-white p-4 rounded-xl border border-slate-200 grid grid-cols-1 md:grid-cols-4 gap-4 items-end text-xs">
              <div className="flex flex-col gap-1.5 col-span-1">
                <span className="font-bold text-slate-500">اختر المدينة:</span>
                <select
                  value={cityToAdd}
                  onChange={(e) => setCityToAdd(e.target.value)}
                  className="py-2  bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
                >
                  <option value="">-- اختر --</option>
                  {(dbCities[getCountryDbId()] || []).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-1">
                <span className="font-bold text-slate-500">فئة الفنادق:</span>
                <select
                  value={hotelCategoryToAdd}
                  onChange={(e) => setHotelCategoryToAdd(e.target.value)}
                  className="py-2  bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none cursor-pointer"
                >
                  <option value="auto">تلقائي</option>
                  <option value="family">عائلي</option>
                  <option value="honeymoon">شهر عسل</option>
                  <option value="budget">اقتصادي</option>
                  <option value="luxury">فاخر VIP</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 col-span-1">
                <span className="font-bold text-slate-550 block">المواصلات من المدينة السابقة:</span>
                <select
                  value={transitMethodToAdd}
                  onChange={(e) => setTransitMethodToAdd(e.target.value)}
                  disabled={formCityStays.length === 0}
                  className="py-2  bg-slate-50 border border-slate-200 rounded-lg text-xs outline-none cursor-pointer disabled:opacity-60"
                >
                  <option value="flight">طيران داخلي</option>
                  <option value="train">قطار</option>
                  <option value="bus">باص</option>
                  <option value="car">سيارة خاصة</option>
                  {transportsList.map(t => (
                    <option key={t.id} value={`db_${t.id}`}>{t.transportationName}</option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleAddCityStay}
                disabled={!cityToAdd}
                className="py-2 bg-secondary text-background font-bold rounded-lg hover:opacity-90 transition-all text-xs cursor-pointer shadow-sm disabled:opacity-65"
              >
                + إضافة للمسار
              </button>
            </div>

            {/* Render stays list */}
            <div className="space-y-2 mt-4">
              {formCityStays.length === 0 ? (
                <p className="text-xs text-slate-500 text-center py-4 bg-white rounded-xl border border-dashed border-slate-200">
                  لم يتم إضافة أي مدن للمسار بعد.
                </p>
              ) : (
                formCityStays.map((stay, idx) => (
                  <div key={idx} className="flex justify-between items-center bg-white p-3.5 rounded-xl border border-slate-100 text-xs shadow-sm">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold">{idx + 1}</span>
                      <div>
                        <span className="font-bold text-primary text-sm">
                          {(dbCities[getCountryDbId()] || []).find(c => c.id === stay.cityId)?.name || stay.cityId}
                        </span>
                        <span className="text-[10px] text-slate-400 mr-3 bg-slate-50 px-2 py-0.5 rounded border border-slate-200/60">
                          الفنادق: {stay.hotelCategory === "auto" ? "تلقائي" : stay.hotelCategory === "family" ? "عائلي" : stay.hotelCategory === "honeymoon" ? "شهر عسل" : stay.hotelCategory === "budget" ? "اقتصادي" : "فاخر"}
                        </span>
                        {stay.transportFromPrevious && (
                          <span className="text-[10px] text-secondary-bright mr-2 font-bold bg-secondary/10 px-2 py-0.5 rounded">
                            المواصلات: {
                              stay.transportFromPrevious.startsWith("db_")
                                ? transportsList.find(t => t.id === stay.transportFromPrevious.replace("db_", ""))?.transportationName || "مخصصة"
                                : stay.transportFromPrevious === "flight" ? "طيران داخلي" : stay.transportFromPrevious === "train" ? "قطار" : stay.transportFromPrevious === "bus" ? "باص" : "سيارة خاصة"
                            }
                          </span>
                        )}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveCityStay(idx)}
                      className="text-red-500 hover:text-red-700 cursor-pointer p-1 hover:bg-red-50 rounded"
                    >
                      <Icon name="delete" className="text-sm" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-grow py-3.5 bg-primary text-background font-bold rounded-xl hover:opacity-95 shadow-md btn-glow transition-all cursor-pointer text-center text-sm"
          >
            {loading ? "جاري الحفظ..." : editId ? "حفظ التغييرات" : "إضافة الباقة السياحية"}
          </button>
          <Link
            href="/admin/packages"
            className="py-3.5 px-8 bg-slate-100 border border-slate-200 text-slate-700 font-bold rounded-xl hover:bg-slate-200 transition-all cursor-pointer text-center text-sm"
          >
            إلغاء
          </Link>
        </div>
      </form>
    </div>
  );
}

export default function NewPackagePage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-slate-500 font-medium">جاري تحميل البيانات...</div>}>
      <NewPackageForm />
    </Suspense>
  );
}
