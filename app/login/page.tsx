"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { DoorOpen } from "lucide-react";

type AuthUser = {
  id: string;
  name: string;
};

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const { login, user, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get("redirect");

  useEffect(() => {
    if (!isLoading && user) {
      router.push(redirect || "/");
    }
  }, [user, isLoading, router, redirect]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const trimmedUsername = username.trim();

    if (!trimmedUsername) {
      setError("Enter a username to continue.");
      return;
    }

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: trimmedUsername,
          password,
          mode: isLogin ? "login" : "signup",
        }),
      });

      const result = (await response.json()) as
        | AuthUser
        | { error: string };

      if (!response.ok) {
        setError(
          "error" in result && typeof result.error === "string"
            ? result.error
            : "Unable to authenticate."
        );
        return;
      }

      login(result as AuthUser);
      router.push(redirect || "/");
    } catch {
      setError("Unable to reach the authentication service.");
    }
  };

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900">
      
      {/* Navbar */}
      <header className="flex items-center justify-between border-b px-6 py-3 shadow-sm">
        <div className="flex items-center gap-2">
          <DoorOpen className="size-8 text-slate-700" />
          <span className="text-2xl font-semibold tracking-tight">
            WayIn
          </span>
        </div>

        <div className="flex items-center gap-6">
          <Link href="/">
            <button className="text-lg font-medium hover:underline">
              Home
            </button>
          </Link>
        </div>
      </header>

      {/* Auth Card */}
      <main className="flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl border bg-white p-8 shadow-md">
          
          {/* Toggle */}
          <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`w-1/2 rounded-md py-2 text-sm font-medium ${
                isLogin ? "bg-white shadow" : "text-slate-500"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`w-1/2 rounded-md py-2 text-sm font-medium ${
                !isLogin ? "bg-white shadow" : "text-slate-500"
              }`}
            >
              Sign Up
            </button>
          </div>

          <h1 className="mb-6 text-center text-2xl font-bold">
            {isLogin ? "Welcome Back" : "Create an Account"}
          </h1>

          {error ? (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-1 block text-sm font-medium">
                Username
              </label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                required
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                required
              />
            </div>

            <Button type="submit" className="w-full text-lg py-5">
              {isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>
        </div>
      </main>
    </div>
  );
}