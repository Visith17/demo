"use client"

import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { useState } from "react";
import { handlePayNow, handleCancelBooking } from "@/app/api/booking";
import { toast } from "sonner";
import Image from "next/image";

type Props = {
  notificationDetails: any;
};

export default function NotificatoinDetailsPage({ notificationDetails }: Props) {

  const paymentStatus = notificationDetails.paymentStatus;
  const isPaid = paymentStatus === "paid";  
  const isCanceled = paymentStatus === "canceled";
  const hideActions = isPaid || isCanceled;

  const [isLoading, setIsLoading] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const PayNow = async () => {
    setIsAnimating(true);
    setIsLoading(true);

    await handlePayNow(notificationDetails.id).then((res) => {
      toast.success("Successfully paid.");
      setTimeout(() => {
        window.location.reload();
        console.log("Redirecting to payment...");
        setIsAnimating(false);
        setIsLoading(false);
      }, 1500);
    });
  };

  const CancelBooking = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );
    if (confirmed) {
      console.log("Booking cancelled.");

      await handleCancelBooking(notificationDetails.id).then((res) => {
        toast.error("Booking cancelled.");
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      });
    }
  };

  // Define dynamic message based on payment status
const statusMessage = (() => {
  switch (paymentStatus) {
    case "paid":
      return "your booking has been successfully paid! ✅";
    case "pending":
      return "your booking is pending. Please complete the payment to confirm. ⏳";
    case "canceled":
      return "your booking has been canceled. ❌";
    default:
      return "your booking status is unknown.";
  }
})();


  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pb-20 md:pb-2">
      <div className="bg-white shadow-lg rounded-2xl p-8 space-y-6">
        <header className="border-b pb-4">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
            📅 Booking Details
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Thank you for booking with us!
          </p>
        </header>

        <section className="space-y-4">
          <p className="text-lg text-gray-700">
            Hi{" "}
            <span className="font-semibold text-gray-900">
              {notificationDetails?.user.first_name}
            </span>
            , {statusMessage}
          </p>

          <Separator />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700">
            <div>
              <span className="font-medium">🆔 Booking ID:</span> #
              {notificationDetails?.id}
            </div>
            <div>
              <span className="font-medium">🏟️ Club:</span>{" "}
              {notificationDetails?.pitch_detail.sport_club.name}
            </div>
            <div>
              <span className="font-medium">📌 Pitch:</span> #
              {notificationDetails?.pitch_detail.name} (
              {notificationDetails?.pitch_detail.size})
            </div>
            <div>
              <span className="font-medium">📆 Play Date:</span>{" "}
              {notificationDetails?.play_date}
            </div>
            <div>
              <span className="font-medium">⏰ Time:</span>{" "}
              {notificationDetails?.time_in} – {notificationDetails?.time_out}
            </div>
            <div>
              <span className="font-medium">💰 Price:</span> $
              {notificationDetails?.paymentAmount}
            </div>
            <div>
              <span className="font-medium">💳 Status:</span>{" "}
              <span
                className={`font-semibold ${
                  paymentStatus === "paid" ? "text-green-600" : "text-red-600"
                }`}
              >
                {paymentStatus}
              </span>
            </div>
            <div>
              <span className="font-medium">🕒 Booked at:</span>{" "}
              {format(
                new Date(notificationDetails?.createdAt),
                "MMM do yyyy HH:mm:ss"
              )}
            </div>
          </div>

          {/* Show payment section only if status is not Paid or Canceled */}
          {!hideActions && (
            <div className="pt-6 space-y-4">
              <div className="flex items-center gap-4">
                <Image
                  src="https://img.icons8.com/color/48/000000/visa.png"
                  alt="Visa"
                  width={25}
                  height={25}
                  className="h-6"
                />
                <Image
                  src="https://img.icons8.com/color/48/000000/mastercard-logo.png"
                  alt="Mastercard"
                  width={25}
                  height={25}
                  className="h-6"
                />
                <Image
                  src="https://img.icons8.com/color/48/000000/amex.png"
                  alt="American Express"
                  width={25}
                  height={25}
                  className="h-6"
                />
                <Image
                  src="https://img.icons8.com/ios-filled/50/000000/apple-pay.png"
                  alt="Apple Pay"
                  width={25}
                  height={25}
                  className="h-6"
                />
                <Image
                  src="https://img.icons8.com/color/48/000000/google-pay-india.png"
                  alt="Google Pay"
                  width={25}
                  height={25}
                  className="h-6"
                />
              </div>
              <motion.div
                initial={{ scale: 1 }}
                animate={isAnimating ? { scale: 1.05 } : { scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Button
                  onClick={PayNow}
                  disabled={isLoading}
                  className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-800 hover:from-blue-700 hover:to-blue-900 text-white font-semibold py-2 px-6 rounded-xl shadow-md flex items-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin w-4 h-4" />
                      Processing...
                    </>
                  ) : (
                    <>💳 Pay Now</>
                  )}
                </Button>
              </motion.div>
              <p className="text-sm text-gray-500">
                Secure payments by Stripe. Multiple payment options supported.
              </p>
            </div>
          )}

          {/* Cancel button only if not Paid or Canceled */}
          {!hideActions && (
            <div className="pt-6">
              <Button
                onClick={CancelBooking}
                variant="destructive"
                className="w-full sm:w-auto"
              >
                ❌ Cancel Booking
              </Button>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
