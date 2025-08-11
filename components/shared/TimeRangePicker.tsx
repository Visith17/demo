"use client";

import * as React from "react";

import { Clock } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Period } from "./time-picker-utils";
import { TimePeriodSelect } from "./period-select"
import { TimePickerInput } from "./time-picker-input";

function TimeRangesPicker() {
  const [date, setDate] = React.useState<Date | undefined>(new Date());
  const minuteRef = React.useRef<HTMLInputElement>(null);
  const hourRef = React.useRef<HTMLInputElement>(null);
  const secondRef = React.useRef<HTMLInputElement>(null);
  const [period, setPeriod] = React.useState<Period>("PM");
  const periodRef = React.useRef<HTMLButtonElement>(null);
 
  return (
    <div className="flex items-center gap-2">
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="hours"
          date={date}
          setDate={setDate}
          ref={hourRef}
          onRightFocus={() => minuteRef.current?.focus()}
        />
      </div>
      <div className="grid gap-1 text-center">
        <TimePickerInput
          picker="minutes"
          date={date}
          setDate={setDate}
          ref={minuteRef}
          onLeftFocus={() => hourRef.current?.focus()}
          onRightFocus={() => secondRef.current?.focus()}
        />
      </div>

      <div className="grid gap-1 text-center">
        <TimePeriodSelect
          period={period}
          setPeriod={setPeriod}
          date={date}
          setDate={setDate}
          ref={periodRef}
          onLeftFocus={() => secondRef.current?.focus()}
        />
      </div>

    </div>
  );
}

export default TimeRangesPicker;