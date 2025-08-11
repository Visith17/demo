"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ScrollText, Plus, DollarSign, User2Icon } from "lucide-react";
import { CalendarPlus, Users, ClipboardList } from "lucide-react";
import { APP_ROUTE } from "@/constants/route";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
}

interface NavButtonProps extends NavItem {
  active: boolean;
  onClick: () => void;
}

interface NavLinkProps extends NavItem {
  active: boolean;
  href: string;
}

interface MobileNavProps {
  className?: string;
}

function PlusMenuButton() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          className={cn(
            "relative -top-6 z-10 flex h-14 w-14 items-center justify-center rounded-full",
            "bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
          )}
          aria-label="More Actions"
        >
          <Plus className="h-7 w-7" />
        </button>
      </PopoverTrigger>

      <PopoverContent side="top" align="center" className="w-48 p-2 rounded-xl shadow-xl">
        <div className="flex flex-col gap-2">
          <Button
            variant="ghost"
            className="justify-start gap-2 text-sm"
            onClick={() => {
              window.location.href = APP_ROUTE.BOOK_NOW;
            }}
          >
            <CalendarPlus className="h-4 w-4" />
            Book Now
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 text-sm"
            onClick={() => {
              window.location.href = APP_ROUTE.OPEN_MATCH;
            }}
          >
            <Users className="h-4 w-4" />
            Open a Match
          </Button>
          <Button
            variant="ghost"
            className="justify-start gap-2 text-sm"
            onClick={() => {
              window.location.href = APP_ROUTE.REGISTER_TEAM;
            }}
          >
            <ClipboardList className="h-4 w-4" />
            Register Team
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}


/**
 * HomeIcon component for the navigation
 * Custom SVG icon following Lucide icon style
 */
function HomeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

/**
 * NavButton component for clickable navigation items
 */
function NavButton({ label, icon, onClick, active }: NavButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-xs font-medium",
        "text-muted-foreground hover:text-primary focus:text-primary",
        "border-t-2 pt-1 transition-colors duration-200",
        "focus:outline-none focus:ring-primary focus:ring-offset-2",
        active ? "border-primary text-primary" : "border-transparent"
      )}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

/**
 * NavLink component for link-based navigation items
 */
function NavLink({ label, icon, href, active }: NavLinkProps) {
  return (
    <Link
      href={href}
      prefetch={false}
      className={cn(
        "flex flex-col items-center justify-center gap-1 text-xs font-medium",
        "text-muted-foreground hover:text-primary focus:text-primary",
        "border-t-2 pt-1 transition-colors duration-200",
        "focus:outline-none focus:ring-primary focus:ring-offset-2",
        active ? "border-primary text-primary" : "border-transparent"
      )}
      aria-label={label}
      aria-current={active ? "page" : undefined}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}

/**
 * MobileNav component for bottom navigation on mobile devices
 * Features:
 * - Responsive design
 * - URL parameter synchronization
 * - Accessible navigation
 * - Smooth transitions
 */
export default function MobileNav({ className }: MobileNavProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Sync search parameter on home page
  React.useEffect(() => {
    if (pathname === "/") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("isSearchOpen") !== "true") {
        params.set("isSearchOpen", "true");
        router.replace(`/?${params.toString()}`, { scroll: false });
      }
    }
  }, [pathname, router]);

  // Handle home navigation with search parameter
  const handleHomeClick = React.useCallback(() => {
    const params = new URLSearchParams();
    // params.set("isSearchOpen", "true");
    router.push(`/feed?${params.toString()}`);
  }, [router]);

  // Navigation items configuration
  const navItems: NavItem[] = React.useMemo(
    () => [
      {
        label: "Home",
        icon: <HomeIcon className="h-6 w-6" />,
        onClick: handleHomeClick,
        // href: APP_ROUTE.HOME
      },
      {
        label: "Payments",
        icon: <DollarSign className="h-6 w-6" aria-hidden="true" />,
        href: APP_ROUTE.PAYMENT,
      },
      {
        label: "Bookings",
        icon: <ScrollText className="h-6 w-6" aria-hidden="true" />,
        href: APP_ROUTE.YOUR_BOOKINGS,
      },
      {
        label: "Your Team",
        icon: <User2Icon className="h-6 w-6" aria-hidden="true" />,
        href: APP_ROUTE.YOUR_TEAM,
      },
    ],
    [handleHomeClick]
  );

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex h-20 w-full items-center justify-around",
        "bg-background shadow-[0_-2px_4px_rgba(0,0,0,0.1)]",
        "safe-area-bottom md:hidden",
        className
      )}
      aria-label="Mobile navigation"
    >
      <NavButton
        key={navItems[0].label}
        {...navItems[0]}
        onClick={navItems[0].onClick!}
        active={pathname === "/feed"}
      />

      <NavLink
        key={navItems[1].label}
        {...navItems[1]}
        href={navItems[1].href!}
        active={pathname === navItems[1].href}
      />
      {/* Plus button in the center */}
    
      <PlusMenuButton />
    
      <NavLink
        key={navItems[2].label}
        {...navItems[2]}
        href={navItems[2].href!}
        active={pathname === navItems[2].href}
      />
      <NavLink
        key={navItems[3].label}
        {...navItems[3]}
        href={navItems[3].href!}
        active={pathname === navItems[3].href}
      />
    </nav>
  );
}
