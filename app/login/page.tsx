// app/login/page.tsx
import Image from "next/image";
import Link from "next/link";
import { Suspense } from "react";
import LoginForm from "./LoginForm"; // Client Component
// import FooterSection from "./FooterSection"; // Client Component
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Separator } from "@/components/ui/separator";

const SOCIAL_LINKS = [
  { href: "https://twitter.com", label: "Twitter" },
  { href: "https://linkedin.com", label: "LinkedIn" },
  { href: "https://github.com", label: "GitHub" },
] as const;
export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col justify-between bg-background">
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-[400px] space-y-8">
          <div className="flex flex-col items-center space-y-4">
            <Image
              src="/login-main-logo.png"
              alt="KAK-TARANG Logo"
              width={180}
              height={120}
              className="object-contain dark:brightness-[0.2] dark:grayscale w-auto"
              priority
            />
          </div>
          <Suspense fallback={<div>Loading form...</div>}>
            <LoginForm />
          </Suspense>
        </div>
      </main>

      <footer className="w-full border-t border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} KAK-TARANG, LLC. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {SOCIAL_LINKS.map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="text-muted-foreground hover:text-foreground"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
