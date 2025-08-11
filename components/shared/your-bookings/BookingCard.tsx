"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { APP_ROUTE } from "@/constants/route";
import { Booking } from "@/types";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import {
  CircleCheckBig,
  Loader2,
  XCircle,
  MapPin,
  CalendarDays,
  Clock,
  MoreHorizontal,
} from "lucide-react";

import { MotionDiv } from "@/components/shared/MotionDiv";

interface BookingCardProps {
  booking: Booking;
  index: number;
  className?: string;
}

const ANIMATION_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const HOVER_VARIANTS = {
  initial: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
};

const TRANSITION_DELAY = 0.2;
const LOADING_DELAY = 1000;

function getBadge(status: Booking["status"]) {
  const base =
    "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium shadow-sm border";
  switch (status) {
    case "confirmed":
      return {
        label: "Confirmed",
        className: cn(base, "bg-green-100 text-green-700 border-green-200"),
        icon: <CircleCheckBig size={14} />,
      };
    case "pending":
      return {
        label: "Pending",
        className: cn(base, "bg-blue-100 text-blue-700 border-blue-200"),
        icon: <Loader2 size={14} className="animate-spin" />,
      };
    case "canceled":
      return {
        label: "Canceled",
        className: cn(base, "bg-red-100 text-red-700 border-red-200"),
        icon: <XCircle size={14} />,
      };
    default:
      return {
        label: status,
        className: cn(base, "bg-gray-100 text-gray-700 border-gray-200"),
        icon: <CircleCheckBig size={14} />,
      };
  }
}

export default function BookingCard({
  booking,
  index,
  className,
}: BookingCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = useCallback(async () => {
    setIsLoading(true);
    router.push(`${APP_ROUTE.YOUR_BOOKINGS}/${booking.id}`);
    await new Promise((res) => setTimeout(res, LOADING_DELAY));
    setIsLoading(false);
  }, [booking.id, router]);

  const createdAtFormatted = format(new Date(booking.createdAt), "MMM do yyyy, HH:mm a");
  const playDateFormatted = format(new Date(booking.playDate), "MMM do yyyy");
  const kickoffTimeFormatted = booking.timeIn
    ? format(new Date(`${booking.playDate}T${booking.timeIn}`), "HH:mm")
    : null;

  const badge = getBadge(booking.status);

  return (
    <MotionDiv
      variants={ANIMATION_VARIANTS}
      initial="hidden"
      animate="visible"
      transition={{
        delay: index * TRANSITION_DELAY,
        duration: TRANSITION_DELAY,
        ease: "easeInOut",
      }}
    >
      <motion.div
        variants={HOVER_VARIANTS}
        initial="initial"
        whileHover="hover"
        whileTap="tap"
      >
        <Card
          role="button"
          tabIndex={0}
          aria-label={`View booking ${booking.pitch_detail.sport_club.name} pitch ${booking.pitch_detail.name}`}
          onClick={handleClick}
          className={cn(
            "group grid grid-cols-[1fr_auto] items-center gap-2 p-4 rounded-2xl cursor-pointer transition hover:shadow-md",
            "border border-muted bg-white",
            className
          )}
          aria-busy={isLoading}
        >
          {/* Left section */}
          <div className="space-y-1.5 min-w-0">
            <h3 className="text-sm font-medium text-gray-900 truncate">
              {booking.pitch_detail.sport_club.name} #{booking.pitch_detail.name}
            </h3>

            {booking.clubLocation && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground truncate">
                <MapPin size={14} />
                <span title={booking.clubLocation} className="truncate">
                  {booking.clubLocation}
                </span>
              </div>
            )}

            {/* Play date and kickoff time */}
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1 truncate">
                <CalendarDays size={14} />
                <span>{playDateFormatted}</span>
              </div>
              {kickoffTimeFormatted && (
                <div className="flex items-center gap-1 truncate">
                  <Clock size={14} />
                  <span>{kickoffTimeFormatted}</span>
                </div>
              )}
            </div>

            <div className="text-xs text-muted-foreground truncate">
              <span className="font-medium">Created:</span>{" "}
              <time dateTime={booking.createdAt}>{createdAtFormatted}</time>
            </div>
          </div>

          {/* Right section */}
          <div className="flex flex-col items-end gap-2 min-w-[120px]">
            {/* <span className="text-base font-semibold text-gray-900 whitespace-nowrap">
              ${booking.price.toFixed(2)}
            </span> */}
            <div className={badge.className}>
              {badge.icon}
              <span>{badge.label}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="text-gray-400 hover:text-gray-600 transition"
                  aria-label="More actions"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleClick}>View Details</DropdownMenuItem>
                <DropdownMenuItem disabled>Cancel (soon)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      </motion.div>
    </MotionDiv>
  );
}
