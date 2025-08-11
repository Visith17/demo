"use client";

import { Rating, Star } from "@smastrom/react-rating";
import { User } from "lucide-react";
import BookingTime from "@/components/shared/BookingTime";
import BookingPlayDate from "@/components/shared/BookingPlayDate";
import { cn } from "@/lib/utils";

const sportIconMap: Record<string, string> = {
  Soccor: "⚽",
  Futsal: "🥅",
  Running: "🏃",
  Basketball: "🏀",
};

// Types
interface PitchRating {
  overall_rating: number;
  count: number;
}

interface PitchDetailsProps {
  location: string;
  clubName: string;
  sportType: string;
  pitchName: string;
  price: any;
  totalHour: number;
  rating: any;
  size: string;
  playDate: string;
  timeIn: string;
  timeOut: string;
  className?: string;
}

// Constants
const RATING_STYLES = {
  itemShapes: Star,
  activeFillColor: "#ffb700",
  inactiveFillColor: "#fbf1a9",
} as const;

const RATING_THRESHOLDS = [
  { min: 4.5, text: "Excellent" },
  { min: 3.5, text: "Very Good" },
  { min: 2.5, text: "Good" },
  { min: 1.5, text: "Fair" },
  { min: 0, text: "Poor" },
] as const;

/**
 * Get rating text based on rating value
 */
function getRatingText(rating: number): string {
  return (
    RATING_THRESHOLDS.find((threshold) => rating >= threshold.min)?.text ??
    "Poor"
  );
}

/**
 * RatingDisplay component for showing pitch rating
 */
function RatingDisplay({ rating }: { rating: PitchRating }) {
  const ratingText = getRatingText(rating.overall_rating);
  const ratingLabel = `Rating: ${rating.overall_rating} out of 5 - ${ratingText} (${rating.count} reviews)`;

  return (
    <div
      className="flex gap-2 items-center"
      role="group"
      aria-label={ratingLabel}
    >
      {/* <span className="text-sm text-slate-400">
        {rating.overall_rating.toFixed(1)}  
      </span> */}
      <Rating
        style={{ maxWidth: 70 }}
        value={rating.overall_rating}
        readOnly
        itemStyles={RATING_STYLES}
      />
      <span className="text-primary font-medium">({rating.count})</span>
    </div>
  );
}

/**
 * CapacityDisplay component for showing pitch capacity
 */
function CapacityDisplay({ size }: { size: string }) {
  const capacityLabel = `Capacity: ${size} players`;

  return (
    <div
      className="flex gap-2 items-center text-gray-700"
      aria-label={capacityLabel}
    >
      <User size={20} className="text-gray-500" aria-hidden="true" />
      <span className="font-medium">{size}</span>
    </div>
  );
}

/**
 * PitchDetails component
 * Displays rating, capacity, date, and time information for a pitch
 */
export function PitchDetails({
  clubName,
  location,
  sportType,
  pitchName,
  price,
  totalHour,
  rating,
  size,
  playDate,
  timeIn,
  timeOut,
  className,
}: PitchDetailsProps) {
  return (
    <div className={cn("space-y-1", className)}>
      {/* Rating and Capacity */}
      <div className="flex justify-between items-center">
        <div>{clubName}</div>
        <div>
          {/* ${price}/{totalHour}h */}
          <span className="text-xl">{sportIconMap[sportType] ?? "🎽"}</span>
          <span> {sportType} #{pitchName} </span>
        </div>
        {/* <RatingDisplay rating={rating} /> */}
        {/* <CapacityDisplay size={size} /> */}
      </div>
      {/* Play Time */}
      <div
        className="flex gap-2 items-center text-gray-700"
        aria-label={`Play time: ${timeIn} to ${timeOut}`}
      >
        {/* <BookingTime 
            playDate={playDate} 
            timeIn={timeIn} 
            timeOut={timeOut}
          /> */}
      </div>
      {/* Date and Time */}
      <div className="space-y-2">
        {/* Play Date */}
        <div
          className="flex gap-2 justify-between items-center text-gray-700"
          aria-label={`Play date: ${playDate}`}
        >
          <BookingPlayDate playDate={playDate} />
          <BookingTime playDate={playDate} timeIn={timeIn} timeOut={timeOut} />
        </div>
      </div>
    </div>
  );
}
