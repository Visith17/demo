"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

export default function TimePicker() {
  const router = useRouter();
  const pathname = usePathname();

  const [hour, setHour] = useState("12");
  const [minute, setMinute] = useState("00");
  const [period, setPeriod] = useState("AM");

  const hours = Array.from({ length: 12 }, (_, i) =>
    (i + 1).toString().padStart(2, "0")
  );
  const minutes = Array.from({ length: 2 }, (_, i) =>
    (i * 30).toString().padStart(2, "0")
  );
  const periods = ["AM", "PM"];
  let ct = parseInt(hour)
  let timeOut = period === 'AM'? `${ct}:${minute}:00` : `${ct +=12 }:${minute}:00`
  useEffect(() => {
    let params = new URLSearchParams(window.location.search);
    if (timeOut) {
      params.set("timeOut", timeOut)
    } else {
      params.delete("timeOut");
    }
    router.replace(`${pathname}?${params.toString()}`);
  }, [timeOut, router, pathname]);

  // Initial value of the play date
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const timeOut = params.get("timeOut") ?? "";
    
  }, [router]);
  return (
    <div className="flex items-center justify-between space-x-2">
      <Select value={hour} onValueChange={setHour}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => (
            <SelectItem key={h} value={h}>
              {h}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <span className="text-2xl">:</span>
      <Select value={minute} onValueChange={setMinute}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="Min" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => (
            <SelectItem key={m} value={m}>
              {m}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select value={period} onValueChange={setPeriod}>
        <SelectTrigger className="w-[80px]">
          <SelectValue placeholder="AM/PM" />
        </SelectTrigger>
        <SelectContent>
          {periods.map((p) => (
            <SelectItem key={p} value={p}>
              {p}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
