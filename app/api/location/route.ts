import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function parsePositiveInteger(value: string | null) {
	if (!value) {
		return undefined;
	}

	const parsedValue = Number(value);
	if (Number.isInteger(parsedValue) && parsedValue > 0) {
		return parsedValue;
	}
	
	return undefined;
}

function parsePositiveIntegerFromUnknown(value: unknown) {
	if (typeof value === "number" && Number.isInteger(value) && value > 0) {
		return value;
	}

	if (typeof value === "string") {
		const parsedValue = Number(value);
		if (Number.isInteger(parsedValue) && parsedValue > 0) {
			return parsedValue;
		}
	}

	return undefined;
}

function parseNonNegativeIntegerFromUnknown(value: unknown) {
	if (typeof value === "number" && Number.isInteger(value) && value >= 0) {
		return value;
	}

	if (typeof value === "string") {
		const parsedValue = Number(value);
		if (Number.isInteger(parsedValue) && parsedValue >= 0) {
			return parsedValue;
		}
	}

	return undefined;
}

function parseRequiredString(value: unknown) {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function parseFiniteNumber(value: unknown) {
	if (typeof value === "number" && Number.isFinite(value)) {
		return value;
	}

	if (typeof value === "string") {
		const parsedValue = Number(value);
		if (Number.isFinite(parsedValue)) {
			return parsedValue;
		}
	}

	return undefined;
}

type CreateLocationRequestBody = {
	id?: unknown;
	name?: unknown;
	address?: unknown;
	city?: unknown;
	state?: unknown;
	zip?: unknown;
	latitude?: unknown;
	longitude?: unknown;
	reviewCount?: unknown;
};

type OsmLookupItem = {
	name?: string;
	display_name?: string;
	address?: {
		road?: string;
		house_number?: string;
		city?: string;
		town?: string;
		village?: string;
		state?: string;
		postcode?: string;
	};
};

function buildAddress(item: OsmLookupItem) {
	const address = item.address;
	if (!address) {
		return item.display_name ?? "";
	}

	const street = [address.house_number, address.road].filter(Boolean).join(" ");
	const locality = address.city ?? address.town ?? address.village;
	const composedAddress = [street, locality, address.state, address.postcode]
		.filter(Boolean)
		.join(", ");

	return composedAddress || item.display_name || "";
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = parsePositiveInteger(searchParams.get("id"));

	if (!id) {
		return NextResponse.json(
			{ error: "id must be a positive integer" },
			{ status: 400 }
		);
	}

	try {
		const osmResponse = await fetch(
			`https://nominatim.openstreetmap.org/lookup?osm_ids=N${id}&format=json&addressdetails=1`,
			{
				headers: {
					"User-Agent": "WayIn-App-v1",
				},
			}
		);

		const osmData = (await osmResponse.json()) as OsmLookupItem[];
		if (!osmResponse.ok || !Array.isArray(osmData) || osmData.length === 0) {
			return NextResponse.json({ error: "Location not found" }, { status: 404 });
		}

		const osmLocation = osmData[0];
		const name = osmLocation.name ?? osmLocation.display_name?.split(",")[0]?.trim();
		const address = buildAddress(osmLocation);

		if (!name || !address) {
			return NextResponse.json({ error: "Location data incomplete" }, { status: 502 });
		}

		const location = await prisma.location.findUnique({
			where: { id },
			select: {
				reviewCount: true,
			},
		});

		return NextResponse.json({
			name,
			address,
			reviewCount: location?.reviewCount ?? 0,
		});
	} catch (error) {
		console.error("Failed to fetch location", error);
		return NextResponse.json(
			{ error: "Failed to fetch location" },
			{ status: 500 }
		);
	}
}

export async function POST(request: Request) {
	let body: CreateLocationRequestBody;

	try {
		body = (await request.json()) as CreateLocationRequestBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const id = parsePositiveIntegerFromUnknown(body.id);
	const name = parseRequiredString(body.name);
	const address = parseRequiredString(body.address) ?? "";
	const city = parseRequiredString(body.city) ?? "";
	const state = parseRequiredString(body.state) ?? "";
	const zip = parseRequiredString(body.zip) ?? "";
	const latitude = parseFiniteNumber(body.latitude) ?? 0;
	const longitude = parseFiniteNumber(body.longitude) ?? 0;
	const parsedReviewCount = parseNonNegativeIntegerFromUnknown(body.reviewCount);
	const reviewCount =
		body.reviewCount === undefined || body.reviewCount === null
			? 0
			: parsedReviewCount;

	if (id === undefined) {
		return NextResponse.json(
			{ error: "id must be a positive integer" },
			{ status: 400 }
		);
	}

	if (!name) {
		return NextResponse.json(
			{ error: "name is required" },
			{ status: 400 }
		);
	}

	if (reviewCount === undefined) {
		return NextResponse.json(
			{ error: "reviewCount must be a non-negative integer" },
			{ status: 400 }
		);
	}

	try {
		const location = await prisma.location.create({
			data: {
				id,
				name,
				address,
				city,
				state,
				zip,
				latitude,
				longitude,
				reviewCount,
			},
		});

		return NextResponse.json(location, { status: 201 });
	} catch (error) {
		if (error instanceof Error && error.message.includes("Unique constraint")) {
			return NextResponse.json(
				{ error: "Location already exists" },
				{ status: 409 }
			);
		}

		console.error("Failed to create location", error);
		return NextResponse.json(
			{ error: "Failed to create location" },
			{ status: 500 }
		);
	}
}
