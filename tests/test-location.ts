import "dotenv/config";

import { PrismaClient } from "../app/generated/prisma/client";
import { getLocation, setLocation, type SetLocationInput } from "../lib/location";

const prisma = new PrismaClient();

let passed = 0;
let failed = 0;

function check(name: string, condition: boolean, detail?: string) {
  if (condition) {
    console.log(`  ✓ ${name}`);
    passed++;
  } else {
    console.log(`  ✗ ${name}${detail ? `: ${detail}` : ""}`);
    failed++;
  }
}

async function runTests() {
  console.log("\nTesting location helpers against live API and direct DB reads...\n");

  const originalFetch = globalThis.fetch;
  let locationId: number | undefined;
  const fetchUrls: string[] = [];

  try {
    const suffix = Date.now() % 1000000;

    locationId = 910000000 + suffix;

    globalThis.fetch = (async (url: string | URL | Request, options?: RequestInit) => {
      const fetchUrl = typeof url === "string" ? url : url.toString();
      fetchUrls.push(fetchUrl);
      const resolvedUrl =
        typeof url === "string" && url.startsWith("/")
          ? `http://localhost:3000${url}`
          : url;

      return originalFetch(resolvedUrl, options);
    }) as typeof fetch;

    const input: SetLocationInput = {
      id: locationId,
      name: "Location Helper Test Venue",
      address: "789 Test Blvd",
      city: "Ann Arbor",
      state: "MI",
      zip: "48104",
      latitude: 42.281,
      longitude: -83.745,
      reviewCount: 2,
    };

    const createdByFunction = await setLocation(input);

    const createdInDb = await prisma.location.findUnique({
      where: { id: locationId },
    });

    check(
      "setLocation posts to location endpoint",
      fetchUrls.includes("/api/location"),
      `received ${fetchUrls.join(", ")}`
    );
    check("setLocation result has an id", typeof createdByFunction.id === "number");
    check("setLocation persisted location", !!createdInDb, "location was not found in database");
    check(
      "setLocation name matches DB",
      createdByFunction.name === createdInDb?.name,
      `function=${createdByFunction.name}, db=${createdInDb?.name}`
    );
    check(
      "setLocation address matches DB",
      createdByFunction.address === createdInDb?.address,
      `function=${createdByFunction.address}, db=${createdInDb?.address}`
    );
    check(
      "setLocation city matches DB",
      createdByFunction.city === createdInDb?.city,
      `function=${createdByFunction.city}, db=${createdInDb?.city}`
    );
    check(
      "setLocation state matches DB",
      createdByFunction.state === createdInDb?.state,
      `function=${createdByFunction.state}, db=${createdInDb?.state}`
    );
    check(
      "setLocation zip matches DB",
      createdByFunction.zip === createdInDb?.zip,
      `function=${createdByFunction.zip}, db=${createdInDb?.zip}`
    );
    check(
      "setLocation reviewCount matches DB",
      createdByFunction.reviewCount === createdInDb?.reviewCount,
      `function=${createdByFunction.reviewCount}, db=${createdInDb?.reviewCount}`
    );

    // getLocation reads from the API and should throw for invalid IDs.
    // Using id=0 avoids dependence on external OSM lookups in this test.
    let invalidIdErrorMessage = "";
    try {
      await getLocation(0);
    } catch (error) {
      invalidIdErrorMessage =
        error instanceof Error ? error.message : String(error);
    }

    check(
      "getLocation calls location endpoint by id",
      fetchUrls.includes("/api/location?id=0"),
      `received ${fetchUrls.join(", ")}`
    );
    check(
      "getLocation throws API validation error for id=0",
      invalidIdErrorMessage === "id must be a positive integer",
      `received ${invalidIdErrorMessage || "no error"}`
    );
  } finally {
    globalThis.fetch = originalFetch;

    if (locationId !== undefined) {
      const locationExists = await prisma.location.findUnique({ where: { id: locationId } });
      if (locationExists) {
        await prisma.location.delete({ where: { id: locationId } });
      }
    }

    await prisma.$disconnect();
  }

  console.log(`\n${"=".repeat(32)}`);
  console.log(`Results: ${passed} passed, ${failed} failed`);

  if (failed > 0) {
    process.exit(1);
  }
}

runTests().catch((error) => {
  console.error("\n✗ Unexpected error:", error instanceof Error ? error.message : error);
  process.exit(1);
});
