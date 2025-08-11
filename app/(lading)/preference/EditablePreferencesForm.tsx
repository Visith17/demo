"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Bell, SunMoon, Flag, Pencil } from "lucide-react";
import { toast } from "sonner";
// Add at the top of the file
import { MultiSelect } from "@/components/ui/multi-select"; // Replace with your actual multi-select component path
import { SingleSelect } from "@/components/shared/SingleSelect";
import apiService from "@/lib/client-api";

export type Preferences = {
  sportTypeIds: any; // changed from string to string[]
  sportClubIds: any;
  notifications: string;
  theme: string;
  language: string;
  favoriteTime: string;
};

const lANGUAGE_OPTIONS = [
  "English",
  "Khmer",
  // Add more as needed
].map((lang) => ({ label: lang, value: lang }));

const MODE_OPTIONS = [
  "light",
  "dark",
  "system",
  // Add more as needed
].map((mode) => ({ label: mode, value: mode }));

const FAVORITE_TIMES_OPTIONS = [
  "this weekend",
  "next weekend",
  "next Saturday at 5pm",
  "next Sunday at 5pm",
  "Friday this week at 6:30pm",
  "this Saturday",
  "this Sunday",
  "next Friday",
  "next Saturday",
  "next Sunday",
  "today",
  "tomorrow",
  "in 3 days",
  "in 1 week",
  "in 2 weeks",
  "next hour",
  "this Monday",
  "this Tuesday",
  "this Wednesday",
  "this Thursday",
  "this Friday",
  "next Monday",
  "next Tuesday",
  "next Wednesday",
  "next Thursday",
  "tomorrow at 7am",
  "tomorrow at 5pm",
  "Monday next week at noon",
  "in 3 days at 2pm",
  "in 1 week at 5pm",
  "July 20th",
  "August 1st",
  "August 1st at 6pm",
  "December 25",
  "January 1st at 10am",
  "1st of next month",
].map((time) => ({ label: time, value: time }));

export function EditablePreferencesForm({
  initialValues,
  sportTypes,
  clubs,
}: {
  initialValues: Preferences;
  sportTypes: any;
  clubs: any;
}) {
  const [editing, setEditing] = useState(false);
  const [formValues, setFormValues] = useState(initialValues);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [selectedClubIds, setSelectedClubIds] = useState<string[]>([]);

  // Update URL when selectedClubIds changes
  useEffect(() => {
    setSelectedClubIds(initialValues.sportClubIds);
    const params = new URLSearchParams(searchParams?.toString() ?? "");
    if (selectedClubIds.length > 0) {
      params.set("sportClubIds", selectedClubIds.join(","));
    } else {
      params.delete("sportClubIds");
    }

    // router.replace(`/?${params.toString()}`);
  }, [selectedClubIds, router, pathname, searchParams]);

  // Initialize from URL params on mount
  useEffect(() => {
    const urlValue = searchParams?.get("sportClubIds");
    if (urlValue) {
      const ids = urlValue.split(",");
      setSelectedClubIds(ids);
    }
  }, [searchParams]);

  const handleChange = (field: keyof Preferences, value: any) => {
    if (field === "sportClubIds") {
      // Find the selected clubs
      const selectedClubs = clubs.filter((club: any) =>
        value.includes(club.value)
      );
      const selectedClubIds = selectedClubs.map((club: any) =>
        club.id.toString()
      );
      setFormValues((prev) => ({
        ...prev,
        [field]: selectedClubIds,
      }));
    } else if (field === "sportTypeIds") {
      // Find the selected sporttypeids
      const selectedSports = sportTypes.filter((sport: any) =>
        value.includes(sport.value)
      );
      const selectedSportIds = selectedSports.map((sport: any) =>
        sport.id.toString()
      );

      setFormValues((prev) => ({
        ...prev,
        [field]: selectedSportIds,
      }));
    } else {
      setFormValues((prev) => ({
        ...prev,
        [field]: value,
      }));
    }
  };

  const handleSubmit = () => {
    startTransition(async () => {
      try {
        await apiService.put("/api/preference", {
          ...formValues,
          sportClubIds: formValues.sportClubIds,
        });

        toast.success("Preferences updated");
        setEditing(false);
      } catch (e) {
        toast.error("Failed to update preferences");
        console.error(e);
      }
    });
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm border border-slate-200 dark:bg-slate-900/80 dark:border-slate-700 rounded-2xl shadow-xl">
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-muted pb-4 px-6 pt-6">
        <div className="flex items-center gap-6 justify-center">
          <h2 className="text-xl font-semibold tracking-tight flex items-center gap-2">
            🌟{" "}
            <span className="text-gray-800 dark:text-white">Preferences</span>
          </h2>

          <div className="flex gap-2 flex-wrap justify-center">
            {editing ? (
              <>
                <Button size="sm" className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200" onClick={handleSubmit} disabled={isPending}>
                  Save
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="text-red-500 hover:text-red-600"
                  onClick={() => setEditing(false)}
                >
                  Cancel
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                variant="ghost"
                className="text-blue-600 hover:bg-blue-50 hover:text-blue-700 transition"
                onClick={() => setEditing(true)}
              >
                <Pencil className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="grid sm:grid-cols-2 md:grid-cols-2 gap-6 px-6 py-6">
        <PreferenceItem
          icon={<Heart className="w-4 h-4 text-pink-500" />}
          label="Favorite Sports"
          value={formValues.sportTypeIds}
          editable={editing}
          isMulti
          options={sportTypes}
          onChange={(val) => handleChange("sportTypeIds", val)}
        />
        <PreferenceItem
          icon={<Heart className="w-4 h-4 text-pink-500" />}
          label="Favorite Clubs"
          value={formValues.sportClubIds}
          editable={editing}
          isMulti
          options={clubs}
          onChange={(val) => handleChange("sportClubIds", val)}
        />
        <PreferenceItem
          icon={<Bell className="w-4 h-4 text-yellow-500" />}
          label="Notifications"
          value={formValues.notifications}
          editable={editing}
          onChange={(val) => handleChange("notifications", val)}
        />
        <PreferenceItem
          icon={<SunMoon className="w-4 h-4 text-purple-500" />}
          label="Theme"
          value={formValues.theme}
          editable={editing}
          isSingle
          options={MODE_OPTIONS}
          onChange={(val) => handleChange("theme", val)}
        />
        <PreferenceItem
          icon={<Flag className="w-4 h-4 text-indigo-500" />}
          label="Language"
          value={formValues.language}
          editable={editing}
          isSingle
          options={lANGUAGE_OPTIONS}
          onChange={(val) => handleChange("language", val)}
        />
        <PreferenceItem
          icon={<Heart className="w-4 h-4 text-indigo-500" />}
          label="Favorite Time"
          value={formValues.favoriteTime}
          editable={editing}
          isSingle
          options={FAVORITE_TIMES_OPTIONS}
          onChange={(val) => handleChange("favoriteTime", val)}
        />
      </CardContent>
    </Card>
  );
}

function PreferenceItem({
  icon,
  label,
  value,
  editable,
  isMulti = false,
  isSingle = false,
  options = [],
  onChange,
}: {
  icon?: React.ReactNode;
  label: string;
  value: string | string[];
  editable?: boolean;
  isMulti?: boolean;
  isSingle?: boolean;

  options?: { label: string; value: string }[];
  onChange?: (val: any) => void;
}) {
  const displayValue = isMulti
    ? options
        .filter((opt) => (value as string[]).includes(opt.value))
        .map((opt) => opt.label)
        .join(", ")
    : value;

  return (
    <div className="flex flex-col gap-1">
      <label className="flex items-center gap-2 text-muted-foreground font-medium">
        {icon}
        {label}
      </label>
      {editable ? (
        isMulti ? (
          <MultiSelect
            selected={value as string[]}
            options={options}
            onChange={(vals) => onChange?.(vals)}
          />
        ) : isSingle ? (
          <SingleSelect
            options={options}
            value={value as string}
            onChange={(vals) => onChange?.(vals)}
            placeholder="Select..."
            searchPlaceholder="Search..."
            noResultsMessage="No item found."
          />
        ) : (
          <Input
            value={value as string}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full"
          />
        )
      ) : (
        <div className="text-base text-gray-900">{displayValue}</div>
      )}
    </div>
  );
}
