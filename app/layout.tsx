import "./globals.css";
import type { Metadata, Viewport } from "next";
import { Inter as FontSans } from "next/font/google";
import AppProvider from "@/contexts/AppContext";
import ReactQueryProvider from "@/components/shared/ReactQueryProvider";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";

// Font configuration
const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: 'swap', // Optimize font loading
});

// Application constants
const APP_CONFIG = {
  NAME: "KAK-TARANG",
  DESCRIPTION: "Your game. Your schedule. Take full control of when and where you play — explore nearby clubs, check real-time availability, and book instantly from any device, anytime. No calls. No waiting. Just play — your way.",
  URL: "https://kaktrang.com", // Add your actual domain
  TWITTER_HANDLE: "@kaktrang", // Add your actual Twitter handle
} as const;

// PWA Icons and Links
const PWA_ASSETS = {
  ICONS: {
    APPLE_TOUCH: "/icons/icon-192x192.png",
    FAVICON: "/favicon.ico",
  },
  MANIFEST: "/manifest.json",
} as const;

/**
 * Application metadata configuration
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-metadata
 */
export const metadata: Metadata = {
  metadataBase: new URL(APP_CONFIG.URL),
  applicationName: APP_CONFIG.NAME,
  title: {
    default: APP_CONFIG.NAME,
    template: `%s - ${APP_CONFIG.NAME}`,
  },
  description: APP_CONFIG.DESCRIPTION,
  manifest: PWA_ASSETS.MANIFEST,
  
  // PWA configuration
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: APP_CONFIG.NAME,
  },
  formatDetection: {
    telephone: false,
  },
  
  // Open Graph metadata
  openGraph: {
    type: "website",
    siteName: APP_CONFIG.NAME,
    title: {
      default: APP_CONFIG.NAME,
      template: `%s - ${APP_CONFIG.NAME}`,
    },
    description: APP_CONFIG.DESCRIPTION,
    url: APP_CONFIG.URL,
  },
  
  // Twitter metadata
  twitter: {
    card: "summary_large_image",
    title: {
      default: APP_CONFIG.NAME,
      template: `%s - ${APP_CONFIG.NAME}`,
    },
    description: APP_CONFIG.DESCRIPTION,
    creator: APP_CONFIG.TWITTER_HANDLE,
    site: APP_CONFIG.TWITTER_HANDLE,
  },
  
  // Icons
  icons: {
    icon: PWA_ASSETS.ICONS.FAVICON,
    apple: PWA_ASSETS.ICONS.APPLE_TOUCH,
  },
};

/**
 * Viewport configuration
 * @see https://nextjs.org/docs/app/api-reference/functions/generate-viewport
 */
export const viewport: Viewport = {
  themeColor: "#FFFFFF",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
};

interface RootLayoutProps {
  children: React.ReactNode;
}

/**
 * Root layout component
 * Provides base HTML structure and global providers
 */
export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html 
      lang="en" 
      className={cn("antialiased")}
      suppressHydrationWarning
    >
      <head>
        <meta name="application-name" content={APP_CONFIG.NAME} />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_CONFIG.NAME} />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href={PWA_ASSETS.ICONS.APPLE_TOUCH} />
        <link rel="shortcut icon" href={PWA_ASSETS.ICONS.FAVICON} />
      </head>
      <body
        className={cn(
          "min-h-screen bg-background font-sans",
          fontSans.variable
        )}
      >
        <ReactQueryProvider>
          <AppProvider>
            {children}
          </AppProvider>
        </ReactQueryProvider>
        <Toaster 
          position="top-center" 
          closeButton
          richColors
          expand
          visibleToasts={3}
        />
      </body>
    </html>
  );
}
