// app/not-found.tsx
export const dynamic = 'force-dynamic';

import Link from 'next/link';
import { Ghost } from 'lucide-react'; // Optional: modern icon

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 text-center">
      <div className="max-w-md">
        <Ghost className="w-16 h-16 text-muted-foreground mb-6" />
        <h1 className="text-5xl font-bold text-foreground mb-4">Page not found</h1>
        <p className="text-muted-foreground mb-6">
          Sorry, the page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link
          href="/feed"
          className="inline-block bg-primary text-white px-6 py-2 rounded-lg text-sm font-medium shadow hover:bg-primary/90 transition"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
