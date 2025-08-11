"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Separator } from "@/components/ui/separator";

type FooterLink = {
  href: string;
  label: string;
};

type FooterSectionProps = {
  title: string;
  links: FooterLink[];
};

const FooterSection = ({ title, links }: FooterSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="space-y-3">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="md:hidden w-full flex items-center justify-between font-semibold text-sm py-2"
      >
        <span>{title}</span>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </button>
      <h3 className="hidden md:block font-semibold text-sm">{title}</h3>
      <ul className={`space-y-2 text-sm text-muted-foreground ${isExpanded ? 'block' : 'hidden'} md:block`}>
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="hover:underline">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <FooterSection
            title="Company"
            links={[
              { href: "/about", label: "About Us" },
              { href: "/contact", label: "Contact" },
              { href: "/careers", label: "Careers" }
            ]}
          />
          <FooterSection
            title="Legal"
            links={[
              { href: "/privacy", label: "Privacy Policy" },
              { href: "/terms", label: "Terms of Service" },
              { href: "/security", label: "Security" }
            ]}
          />
          <FooterSection
            title="Support"
            links={[
              { href: "/help", label: "Help Center" },
              { href: "/faq", label: "FAQ" },
              { href: "/status", label: "System Status" }
            ]}
          />
        </div>
        
        <Separator className="my-6" />
        
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} KAK-TARANG, LLC. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link href="https://twitter.com" className="text-muted-foreground hover:text-foreground">
              Twitter
            </Link>
            <Link href="https://linkedin.com" className="text-muted-foreground hover:text-foreground">
              LinkedIn
            </Link>
            <Link href="https://github.com" className="text-muted-foreground hover:text-foreground">
              GitHub
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
} 