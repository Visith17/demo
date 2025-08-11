"use client";

import { Loader2, MapPin } from "lucide-react";
import { Rating, Star } from "@smastrom/react-rating";
import { useRef, useEffect, useId } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { PitchImage } from "./PitchImage";
import BookingTime from "@/components/shared/BookingTime";
import BookingPlayDate from "@/components/shared/BookingPlayDate";
import { Pitch } from "@/types";

// Types
interface PitchDialogProps {
  open: boolean;
  isBooking?: boolean;
  onClose: () => void;
  handleOnConfirmBooking: () => void;
  pitch: Pitch;
}

interface ClubLocation {
  name: string;
  url: string;
  rating?: number;
}

// Constants
const DIALOG_IDS = {
  title: "booking-dialog-title",
  description: "booking-dialog-description"
} as const;

// Rating styles
const ratingStyles = {
  itemShapes: Star,
  activeFillColor: "#ffb700",
  inactiveFillColor: "#fbf1a9",
};

/**
 * Get rating text based on rating value
 */
function getRatingText(rating: number): string {
  if (rating >= 4.5) return "excellent";
  if (rating >= 3.5) return "very good";
  if (rating >= 2.5) return "good";
  if (rating >= 1.5) return "fair";
  return "poor";
}

/**
 * Parse JSON string safely
 */
function safeJSONParse<T>(value: string | T, fallback: T): T {
  if (typeof value !== 'string') return value;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

export default function PitchDialog({
  open,
  isBooking = false,
  onClose,
  handleOnConfirmBooking,
  pitch,
}: PitchDialogProps) {
  const initialFocusRef = useRef<HTMLButtonElement>(null);
  const dialogTitleId = useId();
  const dialogDescriptionId = useId();

  // Parse club data
  const clubProfileImg = safeJSONParse(pitch.clubProfile, pitch.clubProfile);
  const clubLocation = safeJSONParse(
    typeof pitch.clubLocation === 'string' ? JSON.parse(pitch.clubLocation) : pitch.clubLocation,
    {} as ClubLocation
  );

  const ratingValue = clubLocation?.clubRating || 4.3;
  const ratingText = getRatingText(ratingValue);

  // Focus management
  useEffect(() => {
    if (open) {
      const timeoutId = setTimeout(() => {
        initialFocusRef.current?.focus();
      }, 0);
      return () => clearTimeout(timeoutId);
    }
  }, [open]);

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "Enter" && !isBooking) {
      handleOnConfirmBooking();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent 
        className="sm:max-w-[425px] md:max-w-[525px] max-h-[90vh] overflow-y-auto p-4 rounded-xl"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          initialFocusRef.current?.focus();
        }}
        onEscapeKeyDown={onClose}
        onPointerDownOutside={onClose}
        aria-labelledby={dialogTitleId}
        aria-describedby={dialogDescriptionId}
      >
        <DialogHeader className="mb-4">
          <DialogTitle>
            {clubLocation?.name || "Booking Details"}
          </DialogTitle>
          <DialogDescription>
            Confirm your booking details and proceed to checkout.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4">
          {/* Pitch Image */}
          <div className="flex justify-center">
            <PitchImage 
              src={"/default-pitch-image.png"} 
              alt={`${pitch?.name || 'Sports'} pitch`} 
              className="w-auto"
            />
          </div>

          <Separator className="block sm:hidden" />

          {/* Booking Details */}
          <div className="flex flex-col gap-4" role="group" aria-label="Booking details">
            <div className="flex flex-col gap-1.5">
              {/* Pitch Info */}
              <div className="flex justify-between">
                <div className="font-bold text-md" aria-label="Pitch number">
                  Pitch No <span>#{pitch.pitchName}</span>
                </div>
                <div className="font-bold" aria-label="Price per hour">
                  ${pitch.totalPrice}/{pitch.totalHour}h
                </div>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1" role="group" aria-label={`Rating: ${ratingValue} out of 5 - ${ratingText}`}>
                <span className="text-sm text-slate-400">{ratingValue}</span>
                <Rating
                  style={{ maxWidth: 70 }}
                  value={ratingValue}
                  readOnly
                  itemStyles={ratingStyles}
                />
                <span className="text-primary font-bold">{ratingText}</span>
              </div>

              {/* Motto */}
              <div className="text-sm" aria-label="Motto">
                ⚽ Stay active, stay strong — play sport!
              </div>

              {/* Location */}
              <div className="flex items-center gap-2" aria-label="Location">
                <MapPin size={16} aria-hidden="true" />
                <a
                  href={pitch.clubLocation}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 underline"
                  aria-label={`View ${pitch.clubName || 'Sports club'} on map (opens in new tab)`}
                >
                  {pitch.clubName || 'Sports club'}
                </a>
              </div>
            </div>

            {/* Date and Time */}
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <Label className="text-sm sm:text-base">
                <BookingPlayDate playDate={pitch.playDate} />
              </Label>
              <Label className="text-sm sm:text-base">
                <BookingTime
                  playDate={pitch.playDate}
                  timeIn={pitch.timeIn}
                  timeOut={pitch.timeOut}
                />
              </Label>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2">
              <Button
                type="button"
                disabled={isBooking}
                onClick={handleOnConfirmBooking}
                onKeyDown={handleKeyDown}
                ref={initialFocusRef}
                className="w-full bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
                aria-busy={isBooking}
              >
                {isBooking ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    <span>Processing...</span>
                  </>
                ) : (
                  "Confirm Booking"
                )}
              </Button>
              
              <DialogClose asChild>
                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  disabled={isBooking}
                >
                  Cancel
                </Button>
              </DialogClose>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
} 