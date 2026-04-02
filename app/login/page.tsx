"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function LoginPage() {
  const [userNameInput, setUserNameInput] = useState("");
  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    // In a real app, you'd verify credentials with a database here
    const mockUser = {
      id: "123",
      email: "user@example.com",
      name: userNameInput,
    };

    login(mockUser); // This "saves" the user to localStorage
    router.push("/"); // Send them back to the map
  };

  return (
    <div className="flex h-screen items-center justify-center">
      <form onSubmit={handleLogin} className="w-80 space-y-4 p-6 border rounded-lg shadow-sm">
        <h1 className="text-xl font-bold text-center">Login</h1>
        <Input
          placeholder="Enter username"
          value={userNameInput}
          onChange={(e) => setUserNameInput(e.target.value)}
          required
        />
        <Button type="submit" className="w-full">Sign In</Button>
      </form>
    </div>
  );
}