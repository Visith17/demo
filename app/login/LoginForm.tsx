// app/login/LoginForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { AlertCircle } from "lucide-react";
import GoogleLoginWrapper from "./GoogleLoginWrapper";
import TelegramLoginButton from "@v9v/ts-react-telegram-login";
import Link from "next/link";
import type { TelegramUser } from "@v9v/ts-react-telegram-login";
import type { CredentialResponse } from "@react-oauth/google";

interface LoginFormData {
  email: string;
  password: string;
}

const ENV = {
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  API_URL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
};

const ERROR_MESSAGES = {
  MISSING_CREDENTIALS: "Email and password are required.",
  INVALID_EMAIL: "Please enter a valid email address.",
  LOGIN_FAILED: "Login failed. Please try again.",
  INVALID_CREDENTIALS: "Invalid credentials.",
  GOOGLE_LOGIN_FAILED: "Google login failed.",
  TELEGRAM_LOGIN_FAILED: "Telegram login failed.",
};

export default function LoginForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginFormData>({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [configError, setConfigError] = useState("");

  useEffect(() => {
    if (!ENV.API_URL) {
      setConfigError("API URL is not configured.");
    }
  }, []);

  const validate = () => {
    if (!formData.email || !formData.password) {
      setError(ERROR_MESSAGES.MISSING_CREDENTIALS);
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setError(ERROR_MESSAGES.INVALID_EMAIL);
      return false;
    }
    return true;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const res = await fetch(`${ENV.API_URL}/api/auth/signin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(ERROR_MESSAGES.INVALID_CREDENTIALS);
      router.push(sessionStorage.getItem("redirectPath") || "/");
    } catch (err) {
      setError(err instanceof Error ? err.message : ERROR_MESSAGES.LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async (resp: CredentialResponse) => {
    if (!resp.credential) {
      setError(ERROR_MESSAGES.GOOGLE_LOGIN_FAILED);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`${ENV.API_URL}/api/auth/g-sign-in`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: resp.credential }),
      });
      if (!res.ok) throw new Error();
      router.push("/feed");
    } catch {
      setError(ERROR_MESSAGES.GOOGLE_LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  const handleTelegram = async (user: TelegramUser) => {
    try {
      setLoading(true);
      const res = await fetch(`${ENV.API_URL}/api/auth/telegram-signin`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(user),
      });
      if (!res.ok) throw new Error();
      router.push("/feed");
    } catch {
      setError(ERROR_MESSAGES.TELEGRAM_LOGIN_FAILED);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {configError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{configError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} disabled={loading} />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between">
            <Label htmlFor="password">Password</Label>
            <Link href="/forget-password" className="text-sm text-muted-foreground hover:underline">Forgot password?</Link>
          </div>
          <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} disabled={loading} />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Logging in..." : "Login"}
        </Button>
      </form>

      <div className="relative">
        <Separator className="my-8" />
        <div className="absolute inset-0 flex justify-center items-center">
          <span className="bg-background px-2 text-sm text-muted-foreground">Or continue with</span>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <GoogleLoginWrapper onSuccess={handleGoogle} onError={() => setError(ERROR_MESSAGES.GOOGLE_LOGIN_FAILED)} />
        <TelegramLoginButton botName="kaktrangbot" dataOnAuth={handleTelegram} />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        <button type="button" onClick={() => router.push("/feed")} disabled={loading} className="hover:underline">
          Continue as guest
        </button>
      </div>
    </>
  );
}
