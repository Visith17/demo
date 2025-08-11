"use client";

import { format, parseISO, isValid } from "date-fns";
import { Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingPlayDateProps {
  playDate: string;
  className?: string;
  showLabel?: boolean;
}

/**
 * Formats a date string into a human-readable format
 * @param dateStr The ISO date string to format
 * @returns Formatted date string or null if invalid
 */
function formatDate(dateStr: string): string | null {
  try {
    const date = parseISO(dateStr);
    if (!isValid(date)) {
      return null;
    }
    return format(date, "MMMM d, yyyy");
  } catch {
    return null;
  }
}

/**
 * BookingPlayDate component
 * Displays a formatted play date with an optional label
 */
export default function BookingPlayDate({
  playDate,
  className,
  showLabel = false,
}: BookingPlayDateProps) {
  const formattedDate = formatDate(playDate);

  if (!formattedDate) {
    return null;
  }

  return (
    <p className={cn("flex items-center gap-2 text-gray-700", className)}>
      <Calendar
        size={17}
        className="text-gray-500 shrink-0"
        aria-hidden="true"
      />
      {showLabel && <span className="font-medium">Play Date:</span>}
      <time dateTime={playDate}>{formattedDate}</time>
    </p>
  );
}
