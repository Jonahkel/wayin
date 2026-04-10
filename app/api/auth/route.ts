import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";

type AuthMode = "login" | "signup";

type AuthRequestBody = {
  username?: unknown;
  password?: unknown;
  mode?: unknown;
};

type AuthResponseUser = {
  id: string;
  name: string;
};

function normalizeUsername(value: unknown) {
  if (typeof value !== "string") {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue.length > 0 ? trimmedValue : undefined;
}

function toAuthResponseUser(user: {
  id: number;
  username: string;
}) : AuthResponseUser {
  return {
    id: user.id.toString(),
    name: user.username,
  };
}

export async function POST(request: Request) {
  let body: AuthRequestBody;

  try {
    body = (await request.json()) as AuthRequestBody;
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const username = normalizeUsername(body.username);
  const mode: AuthMode = body.mode === "signup" ? "signup" : "login";

  if (!username) {
    return NextResponse.json(
      { error: "Username is required" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.$transaction(async (tx) => {
      const existingUser = await tx.user.findUnique({
        where: { username },
      });

      if (mode === "login") {
        if (!existingUser) {
          return null;
        }

        return existingUser;
      }

      if (existingUser) {
        return existingUser;
      }

      return tx.user.create({
        data: {
          username,
          profileImageUrl: null,
        },
      });
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(toAuthResponseUser(user));
  } catch (error) {
    console.error("Auth request failed", error);
    return NextResponse.json(
      { error: "Failed to authenticate user" },
      { status: 500 }
    );
  }
}