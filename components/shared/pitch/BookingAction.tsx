"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { bookPitch } from "@/app/api/booking";
import { fetchTimeParts } from "@/app/api/timePart";
import { APP_ROUTE } from "@/constants/route";
import { Pitch } from "@/types";
import PitchDialog from "./PitchDialog";
import { cn, formatPrice } from "@/lib/utils";

// Props
interface BookingActionProps {
  pitch: Pitch;
  className?: string;
}

// Constants
const STORAGE_KEYS = {
  redirectPitch: "redirectPitch",
  redirectPath: "redirectPath"
} as const;

const BOOKING_STATES = {
  success: { status: 200, defaultMessage: "Successfully booked!" },
  unauthorized: { status: 401, defaultMessage: "Please log in to continue booking." },
  badRequest: { status: 400, defaultMessage: "Invalid booking request. Please try again." }
} as const;

const LOADING_DELAY = 1500;

// Component
export default function BookingAction({ pitch, className }: BookingActionProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [pitchDetail, setPitchDetail] = useState<Pitch>(pitch);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isFetchingTimePart, setIsFetchingTimePart] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [timeParts, setTimeParts] = useState<number[]>([]);

  const priceLabel = `${formatPrice(pitch.totalPrice)} per ${pitch.totalHour} hour${pitch.totalHour !== 1 ? "s" : ""}`;

  // ---- Handlers ----
  const handleBookingClick = async () => {
    try {
      setIsFetchingTimePart(true);
      const payload = {
        weekPartId: pitch.weekPartId,
        timeIn: pitch.timeIn,
        timeOut: pitch.timeOut,
      };

      const response = await fetchTimeParts(payload);

      if (response.status === BOOKING_STATES.success.status) {
        setPitchDetail(pitch);
        setTimeParts(response.timePartIds ?? []);
        setIsDialogOpen(true);
      } else {
        sessionStorage.setItem(STORAGE_KEYS.redirectPitch, JSON.stringify(pitch));
        sessionStorage.setItem(STORAGE_KEYS.redirectPath, pathname);
        router.push(APP_ROUTE.LOGIN);
      }
    } catch (error) {
      console.error('[handleBookingClick] Error:', error);
      toast.error(error instanceof Error ? error.message : "Unable to fetch time slots.");
    } finally {
      setIsFetchingTimePart(false);
    }
  };

  const handleConfirmBooking = async () => {
    if (!timeParts.length) {
      toast.error("No time slots selected. Please try again.");
      return;
    }

    const payload = {
      timeIn: pitch.timeIn,
      timeOut: pitch.timeOut,
      playDate: pitch.playDate,
      pitchDetailId: pitch.pitchDetailId,
      timePartIds: timeParts,
      totalHours: pitch.totalHour,
      price: pitch.totalPrice,
    };

    try {
      setIsBooking(true);
      const response = await bookPitch(payload);
      await handleBookingResponse(response, router);
    } catch (error) {
      console.error('[handleConfirmBooking] Error:', error);
      toast.error(error instanceof Error ? error.message : "Unable to complete booking.");
      router.push(APP_ROUTE.LOGIN);
    } finally {
      setIsBooking(false);
      setIsDialogOpen(false);
      sessionStorage.removeItem(STORAGE_KEYS.redirectPitch);
    }
  };

  const handleBookingResponse = async (
    response: { status: number; message?: string; id?: number; bookingId?: number },
    router: ReturnType<typeof useRouter>
  ) => {
    const { status, message, id, bookingId } = response;

    switch (status) {
      case BOOKING_STATES.success.status:
        await new Promise((resolve) => setTimeout(resolve, LOADING_DELAY));
        toast.success(message ?? BOOKING_STATES.success.defaultMessage);
        router.push(`${APP_ROUTE.YOUR_BOOKINGS}/${id}`);
        break;
      case BOOKING_STATES.unauthorized.status:
        toast.error(message ?? BOOKING_STATES.unauthorized.defaultMessage);
        if (bookingId) router.push(`${APP_ROUTE.YOUR_BOOKINGS}/${bookingId}`);
        break;
      case BOOKING_STATES.badRequest.status:
        toast.error(message ?? BOOKING_STATES.badRequest.defaultMessage);
        router.push(APP_ROUTE.PROFILE);
        break;
      default:
        router.push(APP_ROUTE.HOME);
    }
  };

  // ---- Effects ----
  useEffect(() => {
    const savedPitch = sessionStorage.getItem(STORAGE_KEYS.redirectPitch);
    if (savedPitch) {
      try {
        const parsedPitch = JSON.parse(savedPitch);
        setPitchDetail(parsedPitch);
        setIsDialogOpen(true);
      } catch (error) {
        console.error('[useEffect] Error parsing saved pitch:', error);
        sessionStorage.removeItem(STORAGE_KEYS.redirectPitch);
        toast.error("Unable to restore your previous booking.");
      }
    }
  }, []);

  // ---- UI ----
  return (
    <div className={cn("flex items-center justify-between", className)}>
      {/* Price */}
      <div className="flex items-baseline gap-1" aria-label={`Price: ${priceLabel}`}>
        <span className="text-xl font-semibold text-primary">
          {formatPrice(pitch.totalPrice)}
        </span>
        <span className="text-sm text-muted-foreground">/{pitch.totalHour}h</span>
      </div>

      {/* Button */}
      <Button
        size="sm"
        variant="outline"
        className="min-w-[70px] rounded-2x h-8 bg-blue-90 text-blue-700 border border-blue-300 hover:bg-blue-200"
        onClick={handleBookingClick}
        disabled={isFetchingTimePart}
      >
        {isFetchingTimePart ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            <span>Loading...</span>
          </>
        ) : (
          "Book"
        )}
      </Button>

      {/* Dialog */}
      <PitchDialog
        open={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        isBooking={isBooking}
        handleOnConfirmBooking={handleConfirmBooking}
        pitch={pitchDetail}
      />
    </div>
  );
}
