"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  LogOutIcon,
  LogInIcon,
  Settings,
  User,
  Bell,
  Plus,
} from "lucide-react";
import { fetchProfile } from "@/app/api/profile";
import { APP_ROUTE } from "@/constants/route";
import { logout } from "@/app/api/auth";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { profile } from "console";

export interface UserProfile {
  id: number;
  email: string;
  firstName?: string;
  lastName?: string;
  userProfile?: string;
  status?: number;
}

interface NavLink {
  label: string;
  href: string;
  onClick?: () => void;
}

const PROFILE_STORAGE_KEY = "user-profile";
const DEFAULT_AVATAR = "https://github.com/shadcn.png";
const DEFAULT_EMAIL = "guest@kaktarang.com";

/**
 * Header component with navigation and user profile
 * Features:
 * - Responsive design
 * - User authentication state
 * - Profile management
 * - Navigation links
 */
export default function Header() {
  const router = useRouter();
  const pathname = usePathname();

  const [user, setUser] = React.useState<UserProfile | null>(null);
  const [shortName, setShortName] = React.useState("G");

  const handleFetchProfile = React.useCallback(async () => {
    const profile = await fetchProfile();
    setUser(profile);
    sessionStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
  }, []);

  // Initialize user profile from cache or fetch from API
  React.useEffect(() => {
    const cache = sessionStorage.getItem(PROFILE_STORAGE_KEY);

    const updateProfile = (profile: UserProfile) => {
      setUser(profile);
      const initials =
        (profile.firstName?.[0] || "") + (profile.lastName?.[0] || "");
      setShortName(initials || "G");
    };

    if (cache) {
      try {
        const parsed = JSON.parse(cache);
        updateProfile(parsed);
      } catch (error) {
        console.error("Failed to parse cached profile:", error);
      }
    } else {
      handleFetchProfile();
    }
  }, [handleFetchProfile]);

  // Handle user logout
  const handleLogout = React.useCallback(async () => {
    setUser(null);
    sessionStorage.clear();
    await logout();
  }, []);

  // Handle home navigation
  const handleHomeClick = React.useCallback(() => {
    router.push(APP_ROUTE.HOME);
  }, [router]);

  // Navigation links configuration
  const navLinks: NavLink[] = React.useMemo(
    () => [
      {
        label: "Home",
        href: APP_ROUTE.FEED,
        onClick: () => router.push(APP_ROUTE.FEED),
      },
      {
        label: "Payments",
        href: APP_ROUTE.PAYMENT,
        onClick: () => router.push(APP_ROUTE.PAYMENT),
      },
      {
        label: "Bookings",
        href: APP_ROUTE.YOUR_BOOKINGS,
        onClick: () => router.push(APP_ROUTE.YOUR_BOOKINGS),
      },
      {
        label: "Your Team",
        href: APP_ROUTE.YOUR_TEAM,
        onClick: () => router.push(APP_ROUTE.YOUR_TEAM),
      },
    ],
    [router]
  );

  // Render navigation link
  const renderNavLink = React.useCallback(
    ({ label, href, onClick }: NavLink) => (
      <button
        key={href}
        onClick={onClick}
        className={cn(
          "transition-colors px-2 py-1.5 rounded-xl",
          pathname === href
            ? "text-primary font-medium"
            : "text-muted-foreground"
        )}
      >
        {label}
      </button>
    ),
    [pathname]
  );

  return (
    <header className="h-16 w-full px-2 md:px-4 shadow-sm bg-white z-50">
      <div className="container flex items-center justify-between h-full gap-4">
        {/* Logo */}
        <button
          onClick={handleHomeClick}
          className="flex items-center gap-2"
          aria-label="Go to home page"
        >
          <Image
            src="/kaktrang-logo.jpg"
            alt="Kak-Trang Logo"
            width={40}
            height={40}
            className="rounded-full w-auto"
            priority
          />
          <span className="text-xl font-semibold font-mono hidden md:inline">
            KAK-TARANG
          </span>
        </button>

        {/* Navigation Links - Desktop */}
        <nav
          className="hidden md:flex items-center gap-4"
          aria-label="Main navigation"
        >
          {navLinks.map(renderNavLink)}

          {/* Create Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-primary font-medium"
              >
                Create +
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => router.push(APP_ROUTE.BOOK)}>
                Book Now
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(APP_ROUTE.OPEN_MATCH)}
              >
                Open a Match
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(APP_ROUTE.REGISTER_TEAM)}
              >
                Register Team
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </nav>

        {/* App Name - Mobile */}
        <p className="text-base sm:text-lg md:text-xl lg:text-2xl font-semibold font-mono md:hidden">
          KAK-TARANG
        </p>

        {/* User Profile Menu */}
        {/* Notifications and User Profile */}
        <div className="flex items-center gap-2">
          {/* Bell Icon for Notifications */}
          <button
            onClick={() => router.push(APP_ROUTE.NOTIFICATIONS)}
            className="relative p-2 rounded-full hover:bg-accent focus:outline-none transition"
            aria-label="View notifications"
          >
            <Bell className="w-5 h-5 text-muted-foreground" />
            {/* Optional notification dot */}
            {/* 
    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
    */}
          </button>

          {/* User Profile Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-8 w-8 rounded-full p-0"
                aria-label="Open user menu"
              >
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={user?.userProfile || DEFAULT_AVATAR}
                    alt={user?.firstName || "Guest"}
                  />
                  <AvatarFallback>{shortName}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">
                    {user?.firstName || "Guest Mode"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {user?.email || DEFAULT_EMAIL}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push(APP_ROUTE.PROFILE)}>
                <User className="mr-2 h-4 w-4" aria-hidden="true" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => router.push(APP_ROUTE.PREFERENCE)}
              >
                <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
                Preferences
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleLogout}>
                {user ? (
                  <LogOutIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                ) : (
                  <LogInIcon className="mr-2 h-4 w-4" aria-hidden="true" />
                )}
                {user ? "Log out" : "Login"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
