import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

function parseOsmId(value: string | null) {
	if (!value) {
		return undefined;
	}

	const trimmedValue = value.trim();
	if (/^[NWR]\d+$/i.test(trimmedValue)) {
		return trimmedValue.toUpperCase();
	}

	return undefined;
}

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
	const id = parseOsmId(searchParams.get("id"));

	if (!id) {
		return NextResponse.json(
			{ error: "id must be a valid OSM id (e.g. R3990210)" },
			{ status: 400 }
		);
	}

	try {
		const osmResponse = await fetch(
			`https://nominatim.openstreetmap.org/lookup?osm_ids=${id}&format=json&addressdetails=1`,
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

		const location = await prisma.location.findFirst({
			where: {
				name,
				address,
			},
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
