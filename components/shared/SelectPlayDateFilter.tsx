"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import DatePicker from "@/components/shared/DatePicker";
import { Label } from "@/components/ui/label";
import { SelectSingleEventHandler } from "react-day-picker";
import { cn } from "@/lib/utils";
import moment from "moment";

type Props = {
  label?: string;
  className?: string;
  fill?: boolean;
};

export default function SelectPlayDateFilter({
  label,
  className,
  fill = true,
}: Props) {
  const [date, setDate] = useState<Date | undefined>();
  const [open, setOpen] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  const handleOnSelectDate = (value: any) => {
    setDate(value);
    setOpen(false);
  };

  useEffect(() => {
    let params = new URLSearchParams(window.location.search);

    if (date) {
      const formattedDate = moment(date).format("YYYY-MM-DD");
      params.set("playDate", formattedDate);
    } else {
      params.delete("playDate");
    }

    router.replace(`${pathname}?${params.toString()}`);
  }, [date, pathname, router]);

  // Initial value of the play date
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const playDate = params.get("playDate") ?? "";
    
    if (playDate) {
      setDate(new Date(playDate));
    }
  }, [router]);

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {/* <Label>{label ?? "Pick a date"}</Label> */}
      <DatePicker
        setDate={handleOnSelectDate as SelectSingleEventHandler}
        open={open}
        date={date}
        setOpen={setOpen}
        fill={fill}
        minDate={tomorrow}
      />
    </div>
  );
}
