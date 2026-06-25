const { PrismaClient } = require('@prisma/client')
const { PrismaMariaDb } = require('@prisma/adapter-mariadb')
require('dotenv').config()

const connectionString = process.env.DATABASE_URL;
const cleanConnectionString = connectionString.startsWith("mysql://")
  ? connectionString.replace("mysql://", "mariadb://")
  : connectionString;

const adapter = new PrismaMariaDb(cleanConnectionString);
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log('Start seeding data...')

  // Clear existing data (optional but good for clean seed)
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

  console.log('Seeding finished successfully.')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
