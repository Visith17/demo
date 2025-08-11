"use client";

import { format, parseISO, isValid } from "date-fns";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingTimeProps {
  playDate: string;
  timeIn: string;
  timeOut: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Formats a time string with its date into a human-readable format
 * @param dateStr The ISO date string
 * @param timeStr The time string (HH:mm)
 * @returns Formatted time string or null if invalid
 */
function formatTime(dateStr: string, timeStr: string): string | null {
  try {
    const datetime = parseISO(`${dateStr}T${timeStr}`);
    if (!isValid(datetime)) {
      return null;
    }
    return format(datetime, "h:mm a");
  } catch {
    return null;
  }
}

/**
 * BookingTime component
 * Displays formatted start and end times for a booking
 */
export default function BookingTime({ 
  playDate, 
  timeIn, 
  timeOut,
  className,
  showLabel = false 
}: BookingTimeProps) {
  const startTime = formatTime(playDate, timeIn);
  const endTime = formatTime(playDate, timeOut);

  if (!startTime || !endTime) {
    return null;
  }

  const timeRange = `${startTime} – ${endTime}`;
  const isoStartTime = `${playDate}T${timeIn}`;
  const isoEndTime = `${playDate}T${timeOut}`;

  return (
    <p className={cn("flex items-center gap-2 text-gray-700", className)}>
      <Clock 
        size={16} 
        className="text-gray-500 shrink-0"
        aria-hidden="true"
      />
      {showLabel && (
        <span className="font-medium">
          Time:
        </span>
      )}
      <span>
        <time dateTime={isoStartTime}>{startTime}</time>
        {/* {" – "}  */}
        {/* <time dateTime={isoEndTime}>{endTime}</time> */}
      </span>
    </p>
  );
}
