"use client";

import React from "react";
import { Club } from "@/types";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter, usePathname, useSearchParams } from "next/navigation";

interface ClubModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  club: Club;
  openHour: string;
  closeHour: string;
}

export function ClubModal({
  open,
  onOpenChange,
  club,
  openHour,
  closeHour,
}: ClubModalProps) {
  
  const URL_PARAM_KEY = 'sportClubIds';
  const router = useRouter();
  const searchParams = useSearchParams();

  const setParam = React.useCallback((clubId: number) => {
    const getCookieValue = (name: string): string | null => {
      const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
      return match ? decodeURIComponent(match[2]) : null;
    };

    const raw = getCookieValue('favoriteClubs');
    const parsed: number[] = raw?.startsWith('j:')
      ? JSON.parse(raw.slice(2))
      : JSON.parse(raw || '[]');

    const updated = Array.isArray(parsed)
      ? Array.from(new Set([...parsed, clubId]))
      : [clubId];
    
    const params = new URLSearchParams(searchParams.toString());
    params.set(URL_PARAM_KEY, updated.join(','));

    router.replace(`/?${params.toString()}`, { scroll: false });
  }, [router, searchParams]);

  if (!open || !club) return null;

  const locationText =
    club.locationUrl?.split("?q=")[1]?.split("&")[0]?.replaceAll("+", " ") ??
    "Google Map";

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold">{club.name}</h2>
            <span className="text-xs text-muted-foreground">
              ⭐ {club.rating?.overall_rating?.toFixed(1) ?? "-"}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            ✖
          </Button>
        </div>

        {/* Club Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>📍 Location:</strong>{" "}
            <a
              href={club.locationUrl}
              className="text-blue-600 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {locationText}
            </a>
          </p>
          <div className="flex items-center flex-wrap gap-2 text-sm">
            <span className="font-medium text-muted-foreground">🏷️ Type:</span>
            {club.sport_types.map((s) => (
              <Badge
                key={s.id}
                variant="secondary"
                className="text-xs bg-purple-100 text-purple-700 border border-purple-300"
              >
                {s.name}
              </Badge>
            ))}
          </div>

          <p>
            <strong>🕒 Hours:</strong> {openHour} - {closeHour}
          </p>
          <p>
            <strong>📞 Phone:</strong> {club.owner?.phone ?? "N/A"}
          </p>
        </div>

        {/* Placeholder for Available Pitches */}
        <div>
          <h3 className="text-sm font-semibold mb-2">🏟️ Available Pitches </h3> 
          <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
            <li>Main Pitch – Full Size</li>
            <li>Practice Ground – Half Size</li>
            <li>Mini Pitch – 5v5</li>
            <li>Total Pitches – { club.pitch_details.length }</li>
          </ul>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-full bg-purple-100 text-purple-700 border border-purple-300 hover:bg-purple-200"
            onClick={() => setParam(club.id)}
          >
            Book Now
          </Button>
        </div>
      </div>
    </div>
  );
}
