"use client";

import { useEffect } from "react"; // Added useEffect
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, User, LogOut } from "lucide-react";

export default function ProfilePage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  // Handle the redirect inside useEffect to avoid the "update during render" error
  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  // While checking auth status or if user is missing, show a loading state
  // This prevents the page from trying to render user data that isn't there
  if (isLoading || !user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-2xl mx-auto mb-6">
        <Button 
          variant="ghost" 
          onClick={() => router.back()} 
          className="gap-2 mb-4"
        >
          <ArrowLeft className="size-4" />
          Back
        </Button>
      </div>

      <main className="max-w-2xl mx-auto">
        <Card className="shadow-lg border-border">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
              <User className="size-8 text-primary" />
            </div>
            <div>
              <CardTitle className="text-2xl font-bold">User Profile</CardTitle>
              <p className="text-sm text-muted-foreground">Manage your account settings</p>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-6">
            <div className="space-y-1">
              <label className="text-sm font-medium text-muted-foreground">
                Username
              </label>
              <div className="p-3 rounded-md bg-muted/50 border border-border">
                <p className="text-lg font-semibold text-foreground">
                  {user.name || "N/A"} 
                </p>
              </div>
            </div>

            <hr className="border-border" />

            <div className="flex justify-end">
              <Button 
                variant="destructive" 
                onClick={() => {
                  if (logout) logout();
                  // No need to router.push here manually if your useEffect handles the !user case
                }}
                className="gap-2"
              >
                <LogOut className="size-4" />
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}