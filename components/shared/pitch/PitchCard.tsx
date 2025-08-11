"use client";

import "@smastrom/react-rating/style.css";
import { Card } from "@/components/ui/card";
import { MotionDiv } from "@/components/shared/MotionDiv";
import { Pitch } from "@/types";
import { PitchHeader } from "./PitchHeader";
import { PitchImage } from "./PitchImage";
import { PitchDetails } from "./PitchDetails";
import BookingAction from "./BookingAction";
import { cn } from "@/lib/utils";

// Types
interface PitchCardProps {
  pitch: Pitch;
  index: number;
  className?: string;
}

// Constants
const ANIMATION_CONFIG = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  transition: {
    ease: "easeInOut",
    duration: 0.5
  }
} as const;

/**
 * PitchCard component
 * Displays a card with pitch details and booking options
 */
export default function PitchCard({ pitch, index, className }: PitchCardProps) {
  
  // Prepare rating data
  const rating = {
    overall_rating: JSON.parse(pitch.clubRating).overall_rating ?? 4.3,
    count: JSON.parse(pitch.clubRating).count ?? 136
  };

  return (
    <MotionDiv
      initial={ANIMATION_CONFIG.initial}
      animate={ANIMATION_CONFIG.animate}
      transition={{ 
        ...ANIMATION_CONFIG.transition, 
        delay: Math.min(index * 0.2, 5) // Cap maximum delay at 2 seconds
      }}
      viewport={{ amount: 0 }}
    >
      <Card 
        className={cn(
          "rounded-xl flex flex-col gap-1 p-3 text-xs",
          "hover:scale-104 transition-all cursor-pointer",
          "hover:shadow-lg hover:bg-accent/5",
          "focus-within:ring-2 focus-within:ring-primary/50",
          className
        )}
      >
        {/* <PitchHeader
          clubName={pitch.clubName}
          location={pitch.clubLocation}
          sportType={pitch.sportType}
          pitchName={pitch.pitchName}
        /> */}

        <div className="flex gap-3 items-start">
          <PitchImage 
            // src={profileImage} 
            src={"/default-pitch-image.png"}
            alt={`${pitch.clubName || 'Sports'} pitch`}
          />

          <div className="flex flex-col w-full gap-4">
            <PitchDetails
              clubName={pitch.clubName}
              location={pitch.clubLocation}
              sportType={pitch.sportType}
              pitchName={pitch.pitchName}
              price={pitch.totalPrice}
              totalHour={pitch.totalHour}
              rating={rating}
              size={pitch.pitchSize}
              playDate={pitch.playDate}
              timeIn={pitch.timeIn}
              timeOut={pitch.timeOut}
            />

            <BookingAction pitch={pitch} className="w-full" />
          </div>
        </div>
      </Card>
    </MotionDiv>
  );
}
