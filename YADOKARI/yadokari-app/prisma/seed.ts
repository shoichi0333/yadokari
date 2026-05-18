import { PrismaClient } from "@prisma/client";
import { PROPERTIES } from "../lib/data/properties";

const prisma = new PrismaClient();

async function main() {
  await prisma.property.deleteMany();

  let count = 0;

  for (const property of PROPERTIES) {
    await prisma.property.create({
      data: {
        id: property.id,
        title: property.title,
        address: property.address,
        prefecture: property.prefecture,
        city: property.city,
        nearestStation: property.nearestStation,
        minutesToStation: property.minutesToStation,
        lat: property.lat,
        lng: property.lng,
        rent: property.rent,
        layout: property.layout,
        areaSqm: property.areaSqm,
        ageYears: property.ageYears,
        floor: property.floor,
        buildingFloors: property.buildingFloors,
        zoning: property.zoning,
        isTokkuArea: property.isTokkuArea,
        minpakuType:
          property.minpakuType == null ? null : String(property.minpakuType),
        maxDays: property.maxDays,
        images: property.images,
        features: property.features,
        description: property.description,
        sourceUrl: property.sourceUrl,
        isActive: true,
      },
    });

    count += 1;
  }

  console.log(`Seeded ${count} properties.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
