export const continents = [
  { id: 'asia', name: 'آسيا' },
  { id: 'europe', name: 'أوروبا' },
  { id: 'africa', name: 'أفريقيا' },
];

export const countries: Record<string, { id: string, name: string }[]> = {
  asia: [
    { id: 'malaysia', name: 'ماليزيا' },
    { id: 'maldives', name: 'المالديف' },
    { id: 'thailand', name: 'تايلاند' },
  ],
  europe: [
    { id: 'bosnia', name: 'البوسنة' },
    { id: 'albania', name: 'ألبانيا' },
    { id: 'georgia', name: 'جورجيا' },
  ],
  africa: [
    { id: 'egypt', name: 'مصر' },
    { id: 'morocco', name: 'المغرب' },
  ]
};

export const cities: Record<string, { id: string, name: string, hasAirport: boolean }[]> = {
  malaysia: [
    { id: 'kuala_lumpur', name: 'كوالالمبور', hasAirport: true },
    { id: 'langkawi', name: 'لنكاوي', hasAirport: true },
    { id: 'cameron_highlands', name: 'مرتفعات كاميرون', hasAirport: false },
  ],
  maldives: [
    { id: 'male', name: 'ماليه', hasAirport: true },
  ],
  thailand: [
    { id: 'bangkok', name: 'بانكوك', hasAirport: true },
    { id: 'phuket', name: 'بوكيت', hasAirport: true },
  ],
  bosnia: [
    { id: 'sarajevo', name: 'سراييفو', hasAirport: true },
    { id: 'mostar', name: 'موستار', hasAirport: false },
  ],
  albania: [
    { id: 'tirana', name: 'تيرانا', hasAirport: true },
    { id: 'berat', name: 'بيرات', hasAirport: false },
  ],
  georgia: [
    { id: 'tbilisi', name: 'تبليسي', hasAirport: true },
    { id: 'batumi', name: 'باتومي', hasAirport: true },
  ],
  egypt: [
    { id: 'cairo', name: 'القاهرة', hasAirport: true },
    { id: 'sharm', name: 'شرم الشيخ', hasAirport: true },
    { id: 'alexandria', name: 'الإسكندرية', hasAirport: true },
  ],
  morocco: [
    { id: 'casablanca', name: 'الدار البيضاء', hasAirport: true },
    { id: 'marrakesh', name: 'مراكش', hasAirport: true },
  ]
};

export const hotelCategories = [
  { id: 'auto', name: 'تلقائي (السيستم يختار)' },
  { id: 'family', name: 'عائلات' },
  { id: 'honeymoon', name: 'شهر عسل' },
  { id: 'budget', name: 'اقتصادي' },
  { id: 'luxury', name: 'فاخر' },
];

export const transportMethods = [
  { id: 'flight', name: 'طيران داخلي' },
  { id: 'train', name: 'قطار' },
  { id: 'bus', name: 'حافلة' },
  { id: 'car', name: 'سيارة خاصة' },
];

export const getSuggestedHotel = (cityId: string, categoryId: string): string => {
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
  
  const baseName = cityNames[cityId] || "فندق روائس ريزورت";
  
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

export type TourPackage = {
  id: string;
  title: string;
  continent: string;
  country: string;
  duration: number;
  price: number;
  category: string;
  image: string;
  cities: string[];
};

export const mockPackages: TourPackage[] = [
  {
    id: "pkg_malaysia_1",
    title: "باقة ماليزيا العائلية المتكاملة",
    continent: "asia",
    country: "malaysia",
    duration: 8,
    price: 6500,
    category: "family",
    image: "https://images.unsplash.com/photo-1596422846543-75c6fc18a523?auto=format&fit=crop&w=800&q=80",
    cities: ["kuala_lumpur", "langkawi"]
  },
  {
    id: "pkg_maldives_1",
    title: "باقة شهر العسل الفاخرة في المالديف",
    continent: "asia",
    country: "maldives",
    duration: 5,
    price: 8900,
    category: "honeymoon",
    image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80",
    cities: ["male"]
  },
  {
    id: "pkg_bosnia_1",
    title: "رحلة البوسنة الطبيعية والريفية",
    continent: "europe",
    country: "bosnia",
    duration: 8,
    price: 5200,
    category: "budget",
    image: "https://images.unsplash.com/photo-1527004013197-933c4bb611b3?auto=format&fit=crop&w=800&q=80",
    cities: ["sarajevo", "mostar"]
  },
  {
    id: "pkg_albania_1",
    title: "باقة ألبانيا الصيفية الفاخرة",
    continent: "europe",
    country: "albania",
    duration: 10,
    price: 9500,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80",
    cities: ["tirana", "berat"]
  },
  {
    id: "pkg_egypt_1",
    title: "رحلة حضارة النيل والرفاهية",
    continent: "africa",
    country: "egypt",
    duration: 8,
    price: 4500,
    category: "family",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b31d468?auto=format&fit=crop&w=800&q=80",
    cities: ["cairo", "sharm"]
  },
  {
    id: "pkg_morocco_1",
    title: "سحر المغرب الأصيل والتاريخي",
    continent: "africa",
    country: "morocco",
    duration: 10,
    price: 7200,
    category: "luxury",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=800&q=80",
    cities: ["casablanca", "marrakesh"]
  }
];

