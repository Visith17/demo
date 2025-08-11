import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface ClubLocation {
  name: string;
  url: string;
}

interface PitchLocationProps {
  pitch: {
    club_location?: ClubLocation | string;
  };
  className?: string;
}

/**
 * PitchLocation component displays the club's location with a map pin icon and clickable link
 */
export default function PitchLocation({ pitch, className }: PitchLocationProps) {
  // Parse location data if it's a string
  const parsedLocation = typeof pitch.club_location === 'string' 
    ? JSON.parse(pitch.club_location) 
    : pitch.club_location;
  
  const clubLocation = parsedLocation ?? {};
  const clubName = clubLocation?.name ?? "Location unavailable";
  const clubUrl = clubLocation?.url ?? "#";
  console.log(clubUrl, "clubUrl");

  return (
    <div className={cn("flex gap-2 items-center", className)}>
      <MapPin className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
      <a 
        href={clubUrl} 
        className="text-xs hover:underline truncate" 
        target="_blank"
        rel="noopener noreferrer"
        aria-label={`View location of ${clubName}`}
      >
        {clubName}
      </a>
    </div>
  );
}
