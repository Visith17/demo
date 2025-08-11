"use client";

import { Label } from "@/components/ui/label";
import TimeInPicker from "../TimeInPicker";
import { cn } from "@/lib/utils";

interface TimeInFilterProps {
  className?: string;
  label?: string;
}

/**
 * TimeInFilter component for selecting time
 * Provides a time picker with a label in a responsive layout
 */
export function TimeInFilter({ 
  className,
  label = "Pick Time In"
}: TimeInFilterProps) {
  const id = "time-in-picker";
  
  return (
    <div className={cn(
      "flex gap-4 col-span-2 flex-wrap",
      className
    )}>
      <div className="flex flex-col gap-1.5 w-full">
        <Label htmlFor={id}>{label}</Label>
        <TimeInPicker />
      </div>
    </div>
  );
}

export default TimeInFilter;
