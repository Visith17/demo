"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export interface TimeIntervalOption {
  value: number;
  label: string;
}

export interface TimeIntervalFilterProps {
  className?: string;
  label?: string;
  intervals?: TimeIntervalOption[];
  defaultValue?: number;
  onChange?: (value: number | null) => void;
}

const DEFAULT_INTERVALS: TimeIntervalOption[] = [
  { value: 1, label: "1 hour" },
  { value: 2, label: "2 hours" },
  { value: 3, label: "3 hours" },
];

/**
 * TimeIntervalFilter component for selecting duration in hours
 * Features:
 * - URL parameter synchronization
 * - Searchable dropdown
 * - Keyboard navigation
 * - Clear selection support
 */
export function TimeIntervalFilter({
  className,
  label = "",
  intervals = DEFAULT_INTERVALS,
  defaultValue,
  onChange,
}: TimeIntervalFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [selectedInterval, setSelectedInterval] = React.useState<number | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Memoize the interval lookup for better performance
  const intervalMap = React.useMemo(
    () => new Map(intervals.map(i => [i.value, i])),
    [intervals]
  );

  // Sync selection with URL search params
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedInterval !== null) {
      params.set("intervalHours", selectedInterval.toString());
    } else {
      params.delete("intervalHours");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onChange?.(selectedInterval);
  }, [selectedInterval, router, pathname, onChange]);

  // Initialize from URL or default value on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const intervalParam = params.get("intervalHours");
    const intervalNum = intervalParam ? parseInt(intervalParam, 10) : defaultValue ?? null;

    if (intervalNum && intervalMap.has(intervalNum)) {
      const option = intervalMap.get(intervalNum);
      setValue(option?.label || "");
      setSelectedInterval(intervalNum);
    } else {
      setValue("");
      setSelectedInterval(null);
    }
  }, [defaultValue, intervalMap]);

  const handleSelect = React.useCallback((currentValue: string) => {
    setOpen(false);
    
    // Find the selected option
    const option = intervals.find(opt => opt.label === currentValue);
    
    if (currentValue === value) {
      // Clear selection if same option clicked
      setValue("");
      setSelectedInterval(null);
    } else if (option) {
      setValue(currentValue);
      setSelectedInterval(option.value);
    }
  }, [intervals, value]);

  return (
    <div className={cn("flex flex-col gap-1.5")}>
      {/* <Label htmlFor="timeIntervalFilter">{label}</Label> */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="timeIntervalFilter"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="w-full justify-between"
          >
            {value || "Select time interval..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder="Search intervals..."
              aria-label="Search time intervals"
            />
            <CommandList>
              <CommandEmpty>No time intervals found.</CommandEmpty>
              <CommandGroup>
                {intervals.map((option) => (
                  <CommandItem
                    key={option.value}
                    value={option.label}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === option.label ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                    {option.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default TimeIntervalFilter;
