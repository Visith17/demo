"use client";

import React, { useState, useEffect } from "react";
import { openMatch } from "@/app/api/match";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SingleSelect } from "@/components/shared/SingleSelect";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioCard } from "@/components/ui/radio-group";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Loader2,
  CalendarIcon,
  Clock,
  MapPin,
  Search,
  Users,
} from "lucide-react";
// import { GiSoccerBall } from "react-icons/gi";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { useRouter } from 'next/navigation';
import { APP_ROUTE } from "@/constants/route";

// Generate times from 07:00 AM to 09:00 PM in 30-minute increments (12-hour format)
const TIME_OPTIONS = Array.from({ length: (19 - 6) * 2 + 1 }, (_, i) => {
  const totalMinutes = 7 * 60 + i * 30;
  const hour24 = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;

  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const ampm = hour24 < 12 ? "AM" : "PM";

  return `${hour12.toString().padStart(2, "0")}:${minute
    .toString()
    .padStart(2, "0")} ${ampm}`;
});

const DURATION_OPTIONS = [
  { label: "1h", value: 60 },
  { label: "2h", value: 120 },
  { label: "3h", value: 180 },
];

function TimePicker({
  label,
  value,
  onChange,
  disabled,
}: {
  label: string;
  value: string | null;
  onChange: (v: string) => void;
  disabled?: boolean;
}) {
  return (
    <div className="w-full">
      <Label className="mb-1 block font-medium text-gray-700">{label}</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            className="w-full justify-between"
            disabled={disabled}
          >
            {value ? (
              value
            ) : (
              <span className="text-muted-foreground">Select time</span>
            )}
            <Clock className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full max-h-60 overflow-y-auto p-2">
          {TIME_OPTIONS.map((time) => (
            <div
              key={time}
              onClick={() => onChange(time)}
              className={cn(
                "cursor-pointer px-3 py-2 rounded-md hover:bg-accent",
                time === value && "bg-accent font-semibold"
              )}
            >
              {time}
            </div>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default function FindMatchForm({ sports, clubs }: any) {
  const SPORT_OPTIONS = sports.map((s: any) => ({
    label: s.name,
    value: s.id,
  }));
  const [form, setForm] = useState({
    teamId: "",
    sportTypeId: "",
    preferredTime: "5pm",
    sportClubId: "",
    matchDate: "",
    timeStart: "",
    timeInterval: "",
    level: "casual"
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Enhanced date/time states
  const [matchDate, setMatchDate] = useState<Date>();
  const [timeStart, setTimeStart] = useState<string | null>(null);
  const [timeInterval, setTimeInterval] = useState<number | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string>("casual");
  const [teams, setTeams] = useState<any>();

  const router = useRouter();

  useEffect(() => {
    const cache = sessionStorage.getItem('user-profile')?? '';
    const jsonData = JSON.parse(cache)
    console.log(jsonData)
    const teams = jsonData.teams
  .filter((t: any) => t.team_members?.status === 'approved')
  .map((t: any) => ({
    label: t.name,
    value: t.id,
  }));

    jsonData.owned_teams.map((t:any) => (teams.push({label: t.name, value: t.id})))
    setTeams(teams);
  }, []);

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFieldChange = <T,>(field: string, value: T) => {
    switch (field) {
      case "matchDate":
        setMatchDate(value as Date)
        setForm((prev) => ({ ...prev, [field]: value as string }));
        break;
      case "timeStart":
        setTimeStart(value as string)
        setForm((prev) => ({ ...prev, [field]: value as string }));
        break;
      case "timeInterval":
        setTimeInterval(value as number)
        setForm((prev) => ({ ...prev, [field]: value as string }));
        break;
      case "level":
        setSelectedSkill(value as string)
        setForm((prev) => ({ ...prev, [field]: value as string }));
      default:
        break;
    }
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
  
    // Client-side validations
    const errors: string[] = [];
  
    if (!form.teamId) errors.push("Please select your team.");
    if (!form.sportTypeId) errors.push("Please select a sport type.");
    if (!form.sportClubId) errors.push("Please choose a preferred location.");
    if (!matchDate) errors.push("Please pick a match date.");
    if (!timeStart) errors.push("Please choose a start time.");
    if (!timeInterval) errors.push("Please select a duration.");
  
    if (errors.length > 0) {
      errors.forEach((msg) => toast.warning(msg));
      return;
    }
  
    // Proceed with form submission
    setIsSubmitting(true);
  
    try {
      const res = await openMatch(form);
      if (res.status === 200) {
        toast.success(res.message);
        router.push(`${APP_ROUTE.FEED}`);
      } else {
        toast.error("Internal server error");
      }
    } catch (error) {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };
  

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md overflow-hidden">
      <Card className="border border-gray-200">
        <CardContent className="p-6 md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Team Selector */}
              <div>
                <Label
                  htmlFor="teamId"
                  className="mb-1 block font-medium text-gray-700"
                >
                  <Users className="inline-block w-4 h-4 mr-1 text-muted-foreground" />
                  Your Team
                </Label>
                <SingleSelect
                  options={teams}
                  value={form.teamId}
                  onChange={(v) =>
                    handleSelectChange("teamId", v as string)
                  }
                  placeholder="Select team..."
                  searchPlaceholder="Search team..."
                  noResultsMessage="No team found."
                />
              </div>
              {/* Sport Type */}
              <div>
                <Label
                  htmlFor="sportTypeId"
                  className="mb-1 block font-medium text-gray-700"
                >
                  🏅 Sport Type
                </Label>
                <SingleSelect
                  options={SPORT_OPTIONS}
                  value={form.sportTypeId}
                  onChange={(v) =>
                    handleSelectChange("sportTypeId", v as string)
                  }
                  placeholder="Select sport..."
                  searchPlaceholder="Search sport..."
                  noResultsMessage="No sport found."
                />
              </div>

              {/* Preferred Location */}
              <div>
                <Label
                  htmlFor="sportClubId"
                  className="mb-1 block font-medium text-gray-700"
                >
                  <MapPin className="inline-block w-4 h-4 mr-1 text-muted-foreground" />
                  Preferred Location
                </Label>
                <SingleSelect
                  options={clubs}
                  value={form.sportClubId}
                  onChange={(v) => handleSelectChange("sportClubId", v as string)}
                  placeholder="Select club..."
                  searchPlaceholder="Search club..."
                  noResultsMessage="No club found."
                />
              </div>
            </div>

            {/* Date, Time, and Duration in a row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Match Date */}
              <div>
                <Label className="mb-1 block font-medium text-gray-700">
                  📅 Match Date
                </Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-between rounded-xl"
                      disabled={isSubmitting}
                    >
                      {matchDate ? (
                        format(matchDate, "PPP")
                      ) : (
                        <span className="text-muted-foreground">
                          Pick a date
                        </span>
                      )}
                      <CalendarIcon className="ml-2 h-4 w-4 opacity-50" />
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="p-0">
                  <Calendar
  mode="single"
  selected={matchDate}
  onSelect={(v) => handleFieldChange("matchDate", v)}
  disabled={isSubmitting}
  initialFocus
/>

                  </PopoverContent>
                </Popover>
              </div>

              {/* Start Time */}
              <TimePicker
  label="⏱ Start Time"
  value={timeStart}
  onChange={(v) => handleFieldChange("timeStart", v)}
  disabled={isSubmitting}
/>


              {/* Duration */}
              <div>
                <Label className="mb-1 block font-medium text-gray-700">
                  ⏱ Duration
                </Label>
                <Select
  value={timeInterval?.toString()}
  onValueChange={(val) => handleFieldChange("timeInterval", parseInt(val))}
  disabled={isSubmitting}
>

                  <SelectTrigger className="rounded-xl w-full">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value.toString()}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <Label className="block mb-2 font-medium text-gray-700">
                🎯 Skill Level
              </Label>
              <RadioGroup
                value={selectedSkill}
                onValueChange={(val) => handleFieldChange("level", val)}
                direction="horizontal"
                className="mt-4"
              >
                <RadioCard
                  value="casual"
                  label="Casual"
                  // icon={<MapPin />}
                  description="Just getting started"
                />
                <RadioCard
                  value="intermediate"
                  label="Intermediate"
                  // icon={<MapPin />}
                  description="Some experience"
                />
                <RadioCard
                  value="advanced"
                  label="Advanced"
                  // icon={<MapPin />}
                  description="Competitive level"
                />
              </RadioGroup>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full mt-4 bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200 h-12"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Finding Match...
                </>
              ) : (
                <>
                  <Search className="mr-2 h-5 w-5" />
                  Find Match
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
