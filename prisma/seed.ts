import { PrismaClient } from "../app/generated/prisma/client";

const prisma = new PrismaClient();

const TAGS = [
    "Wheelchair Access",
    "Menu Readability",
    "Service Animal Access",
    "Noise Levels",
    "Charging Ports",
    "Seating Availability",
    "Parking",
    "Lighting",
    "Private Spaces",
    "Fragrances/Scents",
    "Restroom",
    "Reading Necessary",
    "Terrain/Flooring"
] as const;

async function main() {
	await prisma.tag.updateMany({
		data: { isActive: false },
	});

	await prisma.$transaction(
		TAGS.map((name) =>
			prisma.tag.upsert({
				where: { name },
				update: { isActive: true },
				create: { name, isActive: true },
			})
		)
	);

	console.log(`Seeded ${TAGS.length} tags`);
}

main()
	.catch((error) => {
		console.error("Tag seed failed:", error);
		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
