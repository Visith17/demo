"use client";

import * as React from "react";
import moment from "moment";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export type Period = "AM" | "PM";
export type TimeFormat = "HH:mm:ss";

export interface TimeInPickerProps {
  className?: string;
  onChange?: (time: string) => void;
  defaultValue?: string;
  minuteInterval?: 15 | 30;
  disabled?: boolean;
}

const HOURS = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, "0")
) as string[];

const PERIODS: Period[] = ["AM", "PM"];

/**
 * TimeInPicker component for selecting time with hour, minute, and period (AM/PM)
 * Features:
 * - URL parameter synchronization
 * - Validation against current time
 * - Disabled states for past times
 * - Customizable minute intervals
 */
export function TimeInPicker({
  className,
  onChange,
  defaultValue,
  minuteInterval = 30,
  disabled = false,
}: TimeInPickerProps) {
  const router = useRouter();
  const pathname = usePathname();

  // Initialize with one hour from now
  const initialMoment = React.useMemo(() => moment().add(1, "hours"), []);
  
  const [hour, setHour] = React.useState(initialMoment.format("hh"));
  const [minute, setMinute] = React.useState("00");
  const [period, setPeriod] = React.useState<Period>(initialMoment.format("A") as Period);

  const [disabledHours, setDisabledHours] = React.useState<string[]>([]);
  const [disabledMinutes, setDisabledMinutes] = React.useState<string[]>([]);
  const [disabledPeriods, setDisabledPeriods] = React.useState<Period[]>([]);

  // Generate minutes based on interval
  const minutes = React.useMemo(() => {
    const count = 60 / minuteInterval;
    return Array.from({ length: count }, (_, i) =>
      String(i * minuteInterval).padStart(2, "0")
    );
  }, [minuteInterval]);

  // Format selected time in 24-hour format
  const timeIn = React.useMemo(() => {
    return moment(`${hour}:${minute} ${period}`, "hh:mm A").format("HH:mm:ss");
  }, [hour, minute, period]);

  // Load initial time from query or props
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const time = defaultValue || params.get("timeIn");
    
    if (time) {
      const m = moment(time, "HH:mm:ss");
      if (m.isValid()) {
        setHour(m.format("hh"));
        setMinute(m.format("mm"));
        setPeriod(m.format("A") as Period);
      }
    }
  }, [defaultValue]);

  // Update query string and trigger onChange when time changes
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    params.set("timeIn", timeIn);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onChange?.(timeIn);
  }, [timeIn, router, pathname, onChange]);

  // Handle disabled states based on current time and selected date
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playDateStr = params.get("playDate");
    const now = moment();
    
    // Parse selected date if available
    const selectedDate = playDateStr ? 
      moment(playDateStr, "YYYY-MM-DD") : null;
    
    const isTodayOrUnset = !selectedDate?.isValid() || 
      selectedDate.isSame(now, "day");

    // Reset disabled states for future dates
    if (!isTodayOrUnset) {
      setDisabledHours([]);
      setDisabledMinutes([]);
      setDisabledPeriods([]);
      return;
    }

    const nowHour = now.format("hh");
    const nowPeriod = now.format("A") as Period;

    // Disable past hours
    const newDisabledHours = HOURS.filter((h) => {
      const candidate = moment(`${h}:${minute} ${period}`, "hh:mm A");
      return candidate.isBefore(now);
    });
    setDisabledHours(newDisabledHours);

    // Disable past minutes for current hour
    if (hour === nowHour && period === nowPeriod) {
      const newDisabledMinutes = minutes.filter((m) => {
        const candidate = moment(`${hour}:${m} ${period}`, "hh:mm A");
        return candidate.isBefore(now);
      });
      setDisabledMinutes(newDisabledMinutes);
    } else {
      setDisabledMinutes([]);
    }

    // Handle PM/AM restrictions
    if (nowPeriod === "PM") {
      setDisabledPeriods(["AM"]);
      if (period === "AM") setPeriod("PM");
    } else {
      setDisabledPeriods([]);
    }
  }, [hour, minute, period, minutes]);

  const handlePeriodChange = React.useCallback((value: Period) => {
    setPeriod(value);
  }, []);

  return (
    <div className={cn(
      "flex items-center justify-between space-x-2",
      className
    )}>
      <Select 
        value={hour} 
        onValueChange={setHour}
        disabled={disabled}
      >
        <SelectTrigger className="w-[80px]" aria-label="Hour">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {HOURS.map((h) => (
            <SelectItem 
              key={h} 
              value={h} 
              disabled={disabledHours.includes(h)}
            >
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <span className="text-2xl" aria-hidden="true">:</span>

      <Select 
        value={minute} 
        onValueChange={setMinute}
        disabled={disabled}
      >
        <SelectTrigger className="w-[80px]" aria-label="Minute">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem
              key={m}
              value={m}
              disabled={disabledMinutes.includes(m)}
            >
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select 
        value={period} 
        onValueChange={handlePeriodChange}
        disabled={disabled}
      >
        <SelectTrigger className="w-[80px]" aria-label="AM/PM">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {PERIODS.map((p) => (
            <SelectItem
              key={p}
              value={p}
              disabled={disabledPeriods.includes(p)}
            >
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

export default TimeInPicker;
