import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

const MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024;
const UPLOAD_DIRECTORY = path.join(process.cwd(), "public", "uploads", "profile-images");

type UploadProfilePictureResponse = {
	userId: string;
	profileImageUrl: string;
};

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

function getFileExtensionFromMimeType(mimeType: string) {
	switch (mimeType) {
		case "image/jpeg":
			return "jpg";
		case "image/png":
			return "png";
		case "image/webp":
			return "webp";
		case "image/gif":
			return "gif";
		case "image/avif":
			return "avif";
		default:
			return undefined;
	}
}

function buildPublicUrl(fileName: string) {
	return `/uploads/profile-images/${fileName}`;
}

export async function POST(request: Request) {
	let formData: FormData;

	try {
		formData = await request.formData();
	} catch {
		return NextResponse.json(
			{ error: "Request must be multipart/form-data" },
			{ status: 400 }
		);
	}

	const userId = parsePositiveIntegerFromUnknown(formData.get("userId"));
	const file = formData.get("file");

	if (userId === undefined) {
		return NextResponse.json(
			{ error: "userId must be a positive integer" },
			{ status: 400 }
		);
	}

	if (!(file instanceof File)) {
		return NextResponse.json(
			{ error: "file is required" },
			{ status: 400 }
		);
	}

	if (!file.type.startsWith("image/")) {
		return NextResponse.json(
			{ error: "Only image uploads are allowed" },
			{ status: 400 }
		);
	}

	if (file.size === 0) {
		return NextResponse.json(
			{ error: "Uploaded file is empty" },
			{ status: 400 }
		);
	}

	if (file.size > MAX_IMAGE_SIZE_BYTES) {
		return NextResponse.json(
			{ error: "Image must be 5MB or smaller" },
			{ status: 413 }
		);
	}

	const extension = getFileExtensionFromMimeType(file.type);

	if (!extension) {
		return NextResponse.json(
			{ error: "Unsupported image type" },
			{ status: 415 }
		);
	}

	try {
		const user = await prisma.user.findUnique({
			where: { id: userId },
			select: { id: true },
		});

		if (!user) {
			return NextResponse.json({ error: "User not found" }, { status: 404 });
		}

		const fileName = `${userId}-${randomUUID()}.${extension}`;
		const filePath = path.join(UPLOAD_DIRECTORY, fileName);
		const fileBuffer = Buffer.from(await file.arrayBuffer());

		await mkdir(UPLOAD_DIRECTORY, { recursive: true });
		await writeFile(filePath, fileBuffer);

		const profileImageUrl = buildPublicUrl(fileName);

		await prisma.user.update({
			where: { id: userId },
			data: { profileImageUrl },
		});

		const responseBody: UploadProfilePictureResponse = {
			userId: user.id.toString(),
			profileImageUrl,
		};

		return NextResponse.json(responseBody, { status: 201 });
	} catch (error) {
		console.error("Failed to upload profile picture", error);
		return NextResponse.json(
			{ error: "Failed to upload profile picture" },
			{ status: 500 }
		);
	}
}