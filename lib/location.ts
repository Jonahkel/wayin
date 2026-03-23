export type LocationResponse = {
  name: string;
  address: string;
  reviewCount: number;
};

export type SetLocationInput = {
  id: number;
  name: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  latitude?: number;
  longitude?: number;
  reviewCount?: number;
};

export type SetLocationResponse = {
  id: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  reviewCount: number;
};

export async function getLocation(id: number): Promise<LocationResponse> {
  const response = await fetch(`/api/location?id=${id}`);
  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to fetch location";

    throw new Error(message);
  }

  return payload as LocationResponse;
}

export async function setLocation(
  input: SetLocationInput
): Promise<SetLocationResponse> {
  const response = await fetch("/api/location", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  const payload = (await response.json()) as unknown;

  if (!response.ok) {
    const message =
      typeof payload === "object" &&
      payload !== null &&
      "error" in payload &&
      typeof payload.error === "string"
        ? payload.error
        : "Failed to set location";

    throw new Error(message);
  }

  return payload as SetLocationResponse;
}
