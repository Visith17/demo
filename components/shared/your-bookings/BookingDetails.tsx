"use client";

import { useState } from "react";
import Image from "next/image";
import { format } from "date-fns";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import BookingPlayDate from "@/components/shared/BookingPlayDate";
import BookingTime from "@/components/shared/BookingTime";
import { handlePayNow, handleCancelBooking } from "@/app/api/booking";
import { useRouter } from 'next/navigation';
import { APP_ROUTE } from "@/constants/route";
import { cn } from "@/lib/utils";
import { Booking } from "@/types";

// Types
interface BookingDetailsProps {
  bookingDetails: Booking;
}

// Constants
const PAYMENT_METHODS = [
  { src: "https://img.icons8.com/color/48/000000/visa.png", alt: "Visa" },
  { src: "https://img.icons8.com/color/48/000000/mastercard-logo.png", alt: "Mastercard" },
  { src: "https://img.icons8.com/color/48/000000/amex.png", alt: "American Express" },
  { src: "https://img.icons8.com/ios-filled/50/000000/apple-pay.png", alt: "Apple Pay" },
  { src: "https://img.icons8.com/color/48/000000/google-pay-india.png", alt: "Google Pay" },
] as const;

const ANIMATION_CONFIG = {
  initial: { scale: 1 },
  animate: { scale: 1.05 },
  transition: { duration: 0.3 },
} as const;

const STATUS_MESSAGES = {
  confirmed: "Your booking has been successfully paid! ✅",
  pending: (
    <div className="text-sm text-gray-700">
      <p>Your booking is currently <span className="font-bold text-blue-500">pending</span>. Please complete the payment to confirm your reservation. ⏳</p>
      <p className="text-md text-black">
        If payment is not completed within 5 hours before the play start time,
        your booking will be automatically{" "}
        <span className="font-bold text-red-500">canceled</span>.
      </p>
    </div>
  ),
  canceled: "Your booking has been canceled. ❌",
  default: "Your booking status is unknown.",
} as const;

/**
 * PaymentMethods component displays available payment options
 */
function PaymentMethods() {
  return (
    <div className="flex flex-wrap items-center gap-4" aria-label="Available payment methods">
      {PAYMENT_METHODS.map(({ src, alt }) => (
        <Image
          key={alt}
          src={src}
          alt={alt}
          width={48}
          height={48}
          className="h-6 w-auto"
        />
      ))}
    </div>
  );
}

/**
 * ActionButtons component handles payment and cancellation actions
 */
function ActionButtons({ 
  onPayNow, 
  onCancel, 
  isLoading, 
  isCanceling 
}: {
  onPayNow: () => Promise<void>;
  onCancel: () => Promise<void>;
  isLoading: boolean;
  isCanceling: boolean;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-2 w-full">
      <motion.div
        {...ANIMATION_CONFIG}
        className="w-full sm:w-auto"
      >
        <Button
          onClick={onPayNow}
          disabled={isLoading || isCanceling}
          className={cn(
            "w-full sm:w-auto",
            "bg-gradient-to-r from-blue-600 to-blue-800",
            "hover:from-blue-700 hover:to-blue-900",
            "text-white font-semibold py-2 px-6 rounded-xl shadow-md",
            "flex items-center justify-center gap-2",
            "disabled:opacity-50 disabled:cursor-not-allowed"
          )}
          aria-label={isLoading ? "Processing payment..." : "Pay now"}
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin w-4 h-4" aria-hidden="true" />
              Processing...
            </>
          ) : (
            <>💳 Pay Now</>
          )}
        </Button>
      </motion.div>

      <Button
        onClick={onCancel}
        variant="destructive"
        disabled={isLoading || isCanceling}
        className="w-full sm:w-auto"
        aria-label={isCanceling ? "Canceling booking..." : "Cancel booking"}
      >
        {isCanceling ? (
          <>
            <Loader2 className="animate-spin w-4 h-4" aria-hidden="true" />
            Canceling...
          </>
        ) : (
          <>❌ Cancel Booking</>
        )}
      </Button>
    </div>
  );
}

/**
 * BookingDetails component displays detailed booking information
 */
export default function BookingDetails({ bookingDetails }: BookingDetailsProps) {
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isCanceling, setIsCanceling] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  
  const isConfirmed = bookingDetails.status === "confirmed";
  const isCanceled = bookingDetails.status === "canceled";
  const hideActions = isConfirmed || isCanceled;

  const handlePayNowClick = async () => {
    try {
      setIsAnimating(true);
      setIsLoading(true);
      
      const response = await handlePayNow(bookingDetails.id);
      
      if (response?.status === "confirmed") {
        router.push(`${APP_ROUTE.YOUR_BOOKINGS}/${bookingDetails.id}`);
        toast.success("Successfully paid.");
        router.refresh();
      } else {
        toast.error("Payment failed. Please try again.");
      }
    } catch (error) {
      toast.error("Payment failed. Please try again.");
      console.error("Payment error:", error);
    } finally {
      setTimeout(() => {
        setIsLoading(false);
        setIsAnimating(false);
      }, 2000);
    }
  };

  const handleCancelClick = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (!confirmed) return;

    try {
      setIsAnimating(true);
      setIsCanceling(true);
      
      const response = await handleCancelBooking(bookingDetails.id);
      if (response?.status === "canceled") {
        router.push(`${APP_ROUTE.YOUR_BOOKINGS}/${bookingDetails.id}`);
        toast.success("Booking cancelled successfully.");
        router.refresh();
      } else {
        toast.error("Cancellation failed. Please try again.");
      }
    } catch (error) {
      toast.error("Cancellation failed. Please try again.");
      console.error("Cancellation error:", error);
    } finally {
      setTimeout(() => {
        setIsCanceling(false);
        setIsAnimating(false);
      }, 2000);
    }
  };

  const statusMessage = STATUS_MESSAGES[bookingDetails.status as keyof typeof STATUS_MESSAGES] || STATUS_MESSAGES.default;
  const createdAtFormatted = format(new Date(bookingDetails.createdAt), "MMM do yyyy hh:mm:ss a");

  return (
    <main className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8 py-6 space-y-3">
      <div className="bg-white shadow-lg rounded-2xl p-4 space-y-3">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            📅 Booking Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thank you for booking with us!
          </p>
        </header>

        <section className="space-y-4">
          <div className="text-lg text-gray-700">
            Hi{" "}
            <span className="font-semibold text-gray-900">
              {bookingDetails.user?.firstName}
            </span>
            , {statusMessage}
          </div>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <strong>🆔 Booking ID:</strong> #{bookingDetails.id}
            </div>
            <div>
              <strong>🏟️ Club:</strong> {bookingDetails.pitch_detail.sport_club.name}
            </div>
            <div>
              <strong>📌 Pitch:</strong> #{bookingDetails.pitch_detail.name} ({bookingDetails.pitch_detail.pitchSize})
            </div>
            <BookingPlayDate playDate={bookingDetails.playDate} />
            <BookingTime
              playDate={bookingDetails.playDate}
              timeIn={bookingDetails.timeIn}
              timeOut={bookingDetails.timeOut}
            />
            <div>
              <strong>💰 Price:</strong> ${bookingDetails.price}
            </div>
            <div>
              <strong>💳 Status:</strong>{" "}
              <span
                className={cn(
                  "font-semibold",
                  isConfirmed && "text-green-600",
                  isCanceled && "text-red-600",
                  !isConfirmed && !isCanceled && "text-blue-600"
                )}
              >
                {bookingDetails.status}
              </span>
            </div>
            <div>
              <strong>🕒 Booked at:</strong>{" "}
              <time dateTime={bookingDetails.createdAt}>{createdAtFormatted}</time>
            </div>
          </div>

          {!hideActions && (
            <div className="pt-6 space-y-4">
              <PaymentMethods />
              <ActionButtons
                onPayNow={handlePayNowClick}
                onCancel={handleCancelClick}
                isLoading={isLoading}
                isCanceling={isCanceling}
              />
              <p className="text-sm text-gray-500 mt-2">
                Secure payments by Stripe. Multiple payment options supported.
              </p>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
