const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
const crypto = require('crypto')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL;
let cleanConnectionString = connectionString.startsWith("mysql://")
  ? connectionString.replace("mysql://", "mariadb://")
  : connectionString;

if (cleanConnectionString) {
  cleanConnectionString += cleanConnectionString.includes("?")
    ? "&connectTimeout=15000&acquireTimeout=20000"
    : "?connectTimeout=15000&acquireTimeout=20000";
}

const adapter = new PrismaMariaDb(cleanConnectionString);
const prisma = new PrismaClient({ adapter })

// Same "salt:hash" scrypt format verified by lib/auth.ts
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.scryptSync(password, salt, 64).toString('hex')
  return `${salt}:${hash}`
}

async function seedAdmin() {
  const username = process.env.ADMIN_USER || 'admin'
  const password = process.env.ADMIN_PASS || 'admin123'
  await prisma.admin.upsert({
    where: { username },
    update: { passwordHash: hashPassword(password) },
    create: { username, passwordHash: hashPassword(password), name: 'Administrator' },
  })
  console.log(`Admin user "${username}" seeded.`)
}

async function main() {
  console.log('Start seeding data...')

  await seedAdmin()

  // Clear existing data (optional but good for clean seed)
  await prisma.companyPackage.deleteMany()
  await prisma.returningFlight.deleteMany()
  await prisma.flight.deleteMany()
  await prisma.internalTransport.deleteMany()
  await prisma.destinationAirport.deleteMany()
  await prisma.saudiAirport.deleteMany()
  await prisma.city.deleteMany()
  await prisma.country.deleteMany()
  await prisma.destination.deleteMany()

  // Destinations
  const europe = await prisma.destination.create({
    data: { destination: 'أوروبا' }
  })

  const asia = await prisma.destination.create({
    data: { destination: 'آسيا' }
  })

  const africa = await prisma.destination.create({
    data: { destination: 'أفريقيا' }
  })

  const middleEast = await prisma.destination.create({
    data: { destination: 'الشرق الأوسط' }
  })

  // Countries
  const georgia = await prisma.country.create({
    data: { name: 'جورجيا', destinationId: europe.id }
  })

  const albania = await prisma.country.create({
    data: { name: 'ألبانيا', destinationId: europe.id }
  })

  const maldives = await prisma.country.create({
    data: { name: 'المالديف', destinationId: asia.id }
  })

  const egypt = await prisma.country.create({
    data: { name: 'مصر', destinationId: africa.id }
  })

  const saudi = await prisma.country.create({
    data: { name: 'السعودية', destinationId: middleEast.id }
  })

  // Cities
  const tbilisi = await prisma.city.create({
    data: { name: 'تبليسي', countryId: georgia.id }
  })
  const batumi = await prisma.city.create({
    data: { name: 'باتومي', countryId: georgia.id }
  })
  const borjomi = await prisma.city.create({
    data: { name: 'بورجومي', countryId: georgia.id } // No airport (fallback to Tbilisi)
  })

  const tirana = await prisma.city.create({
    data: { name: 'تيرانا', countryId: albania.id }
  })
  const berat = await prisma.city.create({
    data: { name: 'بيرات', countryId: albania.id } // No airport (fallback to Tirana)
  })

  const male = await prisma.city.create({
    data: { name: 'ماليه', countryId: maldives.id }
  })

  const cairo = await prisma.city.create({
    data: { name: 'القاهرة', countryId: egypt.id }
  })
  const sharm = await prisma.city.create({
    data: { name: 'شرم الشيخ', countryId: egypt.id }
  })
  const alexandria = await prisma.city.create({
    data: { name: 'الإسماعيلية', countryId: egypt.id } // No airport (fallback to Cairo)
  })

  const riyadh = await prisma.city.create({
    data: { name: 'الرياض', countryId: saudi.id }
  })

  const jeddah = await prisma.city.create({
    data: { name: 'جدة', countryId: saudi.id }
  })

  // Saudi Airports
  const ruh = await prisma.saudiAirport.create({
    data: { airportName: 'مطار الملك خالد الدولي', cityId: riyadh.id }
  })

  const jed = await prisma.saudiAirport.create({
    data: { airportName: 'مطار الملك عبدالعزيز الدولي', cityId: jeddah.id }
  })

  // Destination Airports
  const tbs = await prisma.destinationAirport.create({
    data: { airportName: 'مطار تبليسي الدولي', cityId: tbilisi.id }
  })

  const bus = await prisma.destinationAirport.create({
    data: { airportName: 'مطار باتومي الدولي', cityId: batumi.id }
  })

  const tia = await prisma.destinationAirport.create({
    data: { airportName: 'مطار تيرانا الدولي', cityId: tirana.id }
  })

  const mle = await prisma.destinationAirport.create({
    data: { airportName: 'مطار فيلانا الدولي', cityId: male.id }
  })

  const cai = await prisma.destinationAirport.create({
    data: { airportName: 'مطار القاهرة الدولي', cityId: cairo.id }
  })

  const ssh = await prisma.destinationAirport.create({
    data: { airportName: 'مطار شرم الشيخ الدولي', cityId: sharm.id }
  })

  // Flights
  await prisma.flight.createMany({
    data: [
      {
        countryId: georgia.id,
        approximatePrice: 1500,
        airWayName: 'طيران ناس',
        arrivalAirportId: tbs.id,
        departedAirportId: ruh.id,
      },
      {
        countryId: albania.id,
        approximatePrice: 2000,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: tia.id,
        departedAirportId: jed.id,
      },
      {
        countryId: maldives.id,
        approximatePrice: 3500,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: mle.id,
        departedAirportId: ruh.id,
      },
      {
        countryId: egypt.id,
        approximatePrice: 800,
        airWayName: 'مصر للطيران',
        arrivalAirportId: cai.id,
        departedAirportId: ruh.id,
      }
    ]
  })

  // Returning Flights
  await prisma.returningFlight.createMany({
    data: [
      // Georgia
      {
        countryId: georgia.id,
        approximatePrice: 1400,
        airWayName: 'طيران ناس',
        arrivalAirportId: ruh.id,
        departedAirportId: tbs.id,
      },
      {
        countryId: georgia.id,
        approximatePrice: 1600,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: tbs.id,
      },
      {
        countryId: georgia.id,
        approximatePrice: 1500,
        airWayName: 'طيران ناس',
        arrivalAirportId: ruh.id,
        departedAirportId: bus.id,
      },
      {
        countryId: georgia.id,
        approximatePrice: 1700,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: bus.id,
      },
      // Albania
      {
        countryId: albania.id,
        approximatePrice: 1900,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: tia.id,
      },
      {
        countryId: albania.id,
        approximatePrice: 1850,
        airWayName: 'طيران ناس',
        arrivalAirportId: ruh.id,
        departedAirportId: tia.id,
      },
      // Maldives
      {
        countryId: maldives.id,
        approximatePrice: 3200,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: ruh.id,
        departedAirportId: mle.id,
      },
      {
        countryId: maldives.id,
        approximatePrice: 3300,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: mle.id,
      },
      // Egypt
      {
        countryId: egypt.id,
        approximatePrice: 750,
        airWayName: 'مصر للطيران',
        arrivalAirportId: ruh.id,
        departedAirportId: cai.id,
      },
      {
        countryId: egypt.id,
        approximatePrice: 850,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: cai.id,
      },
      {
        countryId: egypt.id,
        approximatePrice: 900,
        airWayName: 'طيران ناس',
        arrivalAirportId: ruh.id,
        departedAirportId: ssh.id,
      },
      {
        countryId: egypt.id,
        approximatePrice: 950,
        airWayName: 'الخطوط السعودية',
        arrivalAirportId: jed.id,
        departedAirportId: ssh.id,
      }
    ]
  })

  // Internal Transport
  await prisma.internalTransport.createMany({
    data: [
      {
        transportationName: 'قطار تبليسي - باتومي',
        approximatePrice: 100,
        cityId: tbilisi.id, // departure
        arrivalCityId: batumi.id
      },
      {
        transportationName: 'طيران داخلي القاهرة - شرم',
        approximatePrice: 300,
        cityId: cairo.id, // departure
        arrivalCityId: sharm.id
      }
    ]
  })

  // Prepared Packages (الباقات الجاهزة)
  await prisma.companyPackage.createMany({
    data: [
      {
        name: "جزيرة بالي، إندونيسيا",
        title: "سحر الطبيعة الاستوائية",
        description: "استمتع بجمال الغابات الاستوائية والشواطئ الساحرة في منتجعات بالي الفاخرة مع جولات سياحية لا تُنسى.",
        pricing: 6500,
        originalPricing: 7200,
        days: "7 أيام / 6 ليالي",
        image: "/images/bali.png",
        popular: true,
        rating: 5,
        reviews: 124,
        features: JSON.stringify(["flight", "hotel", "restaurant", "directions_car"]),
        includesText: "طيران، فندق 5 نجوم، إفطار، تنقلات",
        countryCode: "id",
        destinationCode: "bali",
      },
      {
        name: "جزر المالديف",
        title: "عطلة الأحلام فوق الماء",
        description: "عش تجربة لا تُنسى في الفيلات المائية وسط المياه الفيروزية الصافية والرمال البيضاء للمالديف الاستوائية.",
        pricing: 12900,
        originalPricing: null,
        days: "5 أيام / 4 ليالي",
        image: "/images/maldives.png",
        popular: false,
        rating: 5,
        reviews: 89,
        features: JSON.stringify(["flight", "hotel", "restaurant", "sailing"]),
        includesText: "طيران، فيلا مائية، إقامة شاملة، قارب سريع",
        countryCode: "mv",
        destinationCode: "male",
      },
      {
        name: "الجونة، مصر",
        title: "رفاهية البحر الأحمر",
        description: "اكتشف روعة البحر الأحمر واستمتع بالأنشطة البحرية الممتعة واليخوت الفاخرة في الجونة.",
        pricing: 3200,
        originalPricing: 3800,
        days: "4 أيام / 3 ليالي",
        image: "/images/elgouna.png",
        popular: false,
        rating: 4,
        reviews: 210,
        features: JSON.stringify(["hotel", "restaurant", "directions_car"]),
        includesText: "فندق 5 نجوم، إفطار، تنقلات",
        countryCode: "eg",
        destinationCode: "elgouna",
      },
      {
        name: "إسطنبول و كابادوكيا، تركيا",
        title: "روعة الشرق والغرب",
        description: "رحلة تجمع بين عراقة إسطنبول وجمال المناطيد الهوائية في كابادوكيا مع جولات تاريخية رائعة.",
        pricing: 4800,
        originalPricing: 5300,
        days: "8 أيام / 7 ليالي",
        image: "/images/turkey.png",
        popular: true,
        rating: 5,
        reviews: 145,
        features: JSON.stringify(["flight", "hotel", "restaurant", "directions_car"]),
        includesText: "طيران، فنادق 4 نجوم، إفطار، جولة المنطاد، تنقلات",
        countryCode: "tr",
        destinationCode: "istanbul",
      },
      {
        name: "كوالالمبور ولنكاوي، ماليزيا",
        title: "مغامرة آسيوية عائلية",
        description: "استمتع بصحب كوالالمبور المعاصرة وهدوء شواطئ لنكاوي الساحرة في رحلة عائلية متكاملة.",
        pricing: 5900,
        originalPricing: 6400,
        days: "9 أيام / 8 ليالي",
        image: "/images/malaysia.png",
        popular: false,
        rating: 4,
        reviews: 95,
        features: JSON.stringify(["flight", "hotel", "restaurant", "directions_car"]),
        includesText: "طيران داخلي ودولي، فنادق عائلية، إفطار، تنقلات",
        countryCode: "my",
        destinationCode: "kuala",
      }
    ]
  })

  console.log('Seeding finished successfully.')
}

// `node prisma/seed.js` runs the full seed (wipes and recreates all data);
// `node prisma/seed.js --admin-only` seeds/updates only the admin account
const run = process.argv.includes('--admin-only') ? seedAdmin : main

run()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
