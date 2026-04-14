"use client";

import Link from "next/link";
import { DoorOpen, UserCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export default function Navbar() {
  const { user, isLoading } = useAuth();

  return (
    <header className="flex items-center justify-between border-b px-6 py-3 shadow-sm">

      <Link href="/" className="flex items-center gap-2">
        <DoorOpen className="size-8 text-slate-700" />
        <span className="text-2xl font-semibold tracking-tight">WayIn</span>
      </Link>

      {/* Right side */}
      <div className="flex items-center gap-6">
        <Link href="/">
          <button className="text-lg font-medium hover:underline">
            Home
          </button>
        </Link>

        {/* Prevent flicker while loading */}
        {!isLoading && (
          user ? (
            <Link href="/profile">
              <UserCircle className="size-9 text-slate-700 hover:text-slate-900 cursor-pointer" />
            </Link>
          ) : (
            <Link href="/login">
              <button className="text-lg font-medium hover:underline">
                Login / Sign Up
              </button>
            </Link>
          )
        )}
      </div>
    </header>
  );
}