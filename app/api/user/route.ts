import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type UserSettingsResponse = {
  id: string;
  username: string;
  profileImageUrl: string | null;
  isPrivate: boolean;
};

type UpdateUserSettingsBody = {
  id?: unknown;
  username?: unknown;
  profileImageUrl?: unknown;
  isPrivate?: unknown;
};

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

function normalizeUsername(value: unknown) {
	if (typeof value !== "string") {
		return undefined;
	}

	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function normalizeProfileImageUrl(value: unknown) {
	if (value === null) {
		return null;
	}

	if (typeof value !== "string") {
		return undefined;
	}

	const trimmedValue = value.trim();
	return trimmedValue.length > 0 ? trimmedValue : null;
}

function parseBoolean(value: unknown) {
	if (typeof value === "boolean") {
		return value;
	}

	if (typeof value === "string") {
		if (value === "true") {
			return true;
		}

		if (value === "false") {
			return false;
		}
	}

	return undefined;
}

function toUserSettingsResponse(user: {
	id: number;
	username: string;
	profileImageUrl: string | null;
	isPrivate: boolean;
}): UserSettingsResponse {
	return {
		id: user.id.toString(),
		username: user.username,
		profileImageUrl: user.profileImageUrl,
		isPrivate: user.isPrivate,
	};
}

export async function GET(request: Request) {
	const { searchParams } = new URL(request.url);
	const id = parsePositiveInteger(searchParams.get("id"));

	if (id === undefined) {
		return NextResponse.json(
			{ error: "id must be a positive integer" },
			{ status: 400 }
		);
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id },
			select: {
				id: true,
				username: true,
				profileImageUrl: true,
				isPrivate: true,
			},
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(toUserSettingsResponse(user));
	} catch (error) {
		console.error("Failed to fetch user settings", error);
		return NextResponse.json(
			{ error: "Failed to fetch user settings" },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: Request) {
	let body: UpdateUserSettingsBody;

	try {
		body = (await request.json()) as UpdateUserSettingsBody;
	} catch {
		return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
	}

	const id = parsePositiveIntegerFromUnknown(body.id);
	const username = normalizeUsername(body.username);
	const profileImageUrl = normalizeProfileImageUrl(body.profileImageUrl);
	const isPrivate = parseBoolean(body.isPrivate);

	if (id === undefined) {
		return NextResponse.json(
			{ error: "id must be a positive integer" },
			{ status: 400 }
		);
	}

	if (
		body.username !== undefined &&
		(typeof body.username !== "string" || username === undefined)
	) {
		return NextResponse.json(
			{ error: "username must be a non-empty string" },
			{ status: 400 }
		);
	}

	if (
		profileImageUrl === undefined &&
		body.profileImageUrl !== undefined &&
		typeof body.profileImageUrl !== "string"
		&& body.profileImageUrl !== null
	) {
		return NextResponse.json(
			{ error: "profileImageUrl must be a string or null" },
			{ status: 400 }
		);
	}

	if (isPrivate === undefined && body.isPrivate !== undefined) {
		return NextResponse.json(
			{ error: "isPrivate must be a boolean" },
			{ status: 400 }
		);
	}

	if (
		username === undefined &&
		profileImageUrl === undefined &&
		isPrivate === undefined
	) {
		return NextResponse.json(
			{ error: "At least one user setting must be provided" },
			{ status: 400 }
		);
	}

	try {
		const updatedUser = await prisma.$transaction(async (tx) => {
			const existingUser = await tx.user.findUnique({
				where: { id },
			});

			if (!existingUser) {
				return null;
			}

			if (username && username !== existingUser.username) {
				const conflictingUser = await tx.user.findUnique({
					where: { username },
					select: { id: true },
				});

				if (conflictingUser && conflictingUser.id !== id) {
					throw new Error("USERNAME_TAKEN");
				}
			}

			return tx.user.update({
				where: { id },
				data: {
					...(username !== undefined ? { username } : {}),
					...(profileImageUrl !== undefined
						? { profileImageUrl }
						: {}),
					...(isPrivate !== undefined ? { isPrivate } : {}),
				},
				select: {
					id: true,
					username: true,
					profileImageUrl: true,
					isPrivate: true,
				},
			});
		});

		if (!updatedUser) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		return NextResponse.json(toUserSettingsResponse(updatedUser));
	} catch (error) {
		if (error instanceof Error && error.message === "USERNAME_TAKEN") {
			return NextResponse.json(
				{ error: "Username is already taken" },
				{ status: 409 }
			);
		}

		console.error("Failed to update user settings", error);
		return NextResponse.json(
			{ error: "Failed to update user settings" },
			{ status: 500 }
		);
	}
}