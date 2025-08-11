"use client";

import * as React from "react";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Calendar as CalendarIcon } from "lucide-react";
import { SelectSingleEventHandler } from "react-day-picker";
import { cn } from "@/lib/utils";
import { format } from "date-fns";

type Props = {
  date: Date | undefined;
  fill?: boolean;
  open: boolean;
  minDate: Date;
  setOpen: (open: boolean) => void;
  setDate: SelectSingleEventHandler;
};

export function DatePicker({ setDate, date, fill, open, setOpen, minDate }: Props) { 
  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          onClick={() => setOpen(!open)}
          variant={"outline"}
          className={cn(
            "w-[280px] justify-start text-left font-normal",
            !date && "text-muted-foreground",
            fill && "w-full"
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {date ? format(date, "PPP") : <span>Pick a date</span>}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <Calendar
          mode="single"
          selected={date}
          onSelect={setDate}
          disabled={{ before: minDate }}
        />
      </PopoverContent>
    </Popover>
  );
}

export default DatePicker;
