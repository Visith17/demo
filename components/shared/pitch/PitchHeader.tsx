import { MapPin } from "lucide-react";
import { cn } from "@/lib/utils";


interface PitchHeaderProps {
  clubName: string;
  location: string;
  sportType: string;
  pitchName: string;
  className?: string;
}

/**
 * PitchHeader component
 * Displays the location, sport type, and pitch number in a header format
 */
export function PitchHeader({ 
  clubName,
  location, 
  sportType, 
  pitchName,
  className 
}: PitchHeaderProps) {
  
  // const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;
  // const locationName = parsedLocation.name || 'Location unavailable';
  // const locationUrl = parsedLocation || '#';
  const pitchLabel = `${sportType} #${pitchName}`;
  
  return (
    <div className={cn(
      "flex items-center justify-between gap-4 text-sm",
      className
    )}>
      {/* Location */}
      <div className="flex items-center gap-2 min-w-0">
        <MapPin 
          size={16}
          className="text-primary shrink-0" 
          aria-hidden="true"
        />
        <a
          href={location}
          className={cn(
            "font-medium hover:text-primary truncate",
            "transition-colors duration-200",
            "focus-visible:outline-none focus-visible:ring-2",
            "focus-visible:ring-primary focus-visible:ring-offset-2",
            location === '#' && "pointer-events-none text-muted-foreground"
          )}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`View ${location} on map (opens in new tab)`}
        >
          {clubName}
        </a>
      </div>

      {/* Pitch Info */}
      <div 
        className="font-medium text-right shrink-0"
        aria-label={`Pitch type: ${pitchLabel}`}
      >
        <span className="text-primary">{sportType}</span>
        <span className="text-muted-foreground"> #{pitchName}</span>
      </div>
    </div>
  );
}
