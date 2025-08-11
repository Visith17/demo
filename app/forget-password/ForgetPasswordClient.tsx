"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { GoogleLogin, GoogleOAuthProvider } from "@react-oauth/google";
import TelegramLoginButton, { TelegramUser } from "@v9v/ts-react-telegram-login";

import { reset_password, loginWithGoogle, loginWithTelegram } from "@/app/api/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";

const COOLDOWN_KEY = "resetCooldownExpiresAt";

export default function ForgetPasswordClient() {
  const NEXT_PUBLIC_GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID!;
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [isHuman, setIsHuman] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const checkCooldown = () => {
      const stored = localStorage.getItem(COOLDOWN_KEY);
      if (stored) {
        const expiresAt = parseInt(stored, 10);
        const remaining = Math.max(0, Math.floor((expiresAt - Date.now()) / 1000));
        setCooldown(remaining);
      }
    };

    checkCooldown();
    const interval = setInterval(checkCooldown, 1000);
    return () => clearInterval(interval);
  }, []);

  const triggerCooldown = (seconds: number) => {
    const expiresAt = Date.now() + seconds * 1000;
    localStorage.setItem(COOLDOWN_KEY, expiresAt.toString());
    setCooldown(seconds);
  };

  const validateEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleOnSubmit = async () => {
    if (cooldown > 0) {
      toast.warning(`Please wait ${cooldown}s before trying again.`);
      return;
    }

    if (!validateEmail(email)) {
      toast.error("Invalid email format");
      return;
    }

    if (!isHuman) {
      toast.error("Please verify you're human");
      return;
    }

    try {
      setIsLoading(true);
      const res = await reset_password(email);
      if (res.status === 200) {
        toast.success("Check your inbox for the password reset link.");
        triggerCooldown(60);
        setTimeout(() => {
          router.push("/login");
        }, 2500);
      } else {
        toast.error(res.message || "Something went wrong.");
      }
    } catch (e) {
      console.error(e);
      toast.error("Request failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = async (credentialResponse: any) => {
    try {
      const res = await loginWithGoogle(credentialResponse.credential);
      if (res.status === 200) {
        sessionStorage.setItem("user", JSON.stringify(res));
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      toast.error("Google login failed.");
    }
  };

  const handleLoginWithTelegram = async (user: TelegramUser) => {
    try {
      const res = await loginWithTelegram(user);
      if (res) {
        sessionStorage.setItem("user", JSON.stringify(res));
        router.push("/");
      }
    } catch (e) {
      console.error(e);
      toast.error("Telegram login failed.");
    }
  };

  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="m@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="humanCheck"
          checked={isHuman}
          onChange={(e) => setIsHuman(e.target.checked)}
        />
        <label htmlFor="humanCheck" className="text-sm">
          I am not a robot
        </label>
      </div>

      <Button
        onClick={handleOnSubmit}
        className="w-full bg-black hover:bg-black/80"
        disabled={isLoading || cooldown > 0}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          <span className="text-xs">
            {cooldown > 0 ? `Retry in ${cooldown}s` : "Submit"}
          </span>
        )}
      </Button>

      <Separator />

      <div className="gap-2 flex flex-col justify-center items-center">
        <GoogleOAuthProvider clientId={NEXT_PUBLIC_GOOGLE_CLIENT_ID}>
          <GoogleLogin
            onSuccess={handleLoginWithGoogle}
            onError={() => toast.error("Google login failed")}
          />
        </GoogleOAuthProvider>

        <TelegramLoginButton
          dataOnAuth={handleLoginWithTelegram}
          botName="kaktrangbot"
        />
      </div>

      <div className="mt-4 text-center text-sm">
        Continue as guest?{" "}
        <Link href="/" className="underline">
          Guest Mode
        </Link>
      </div>
    </div>
  );
}
