"use client";

import React from "react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { SingleSelect } from "@/components/shared/SingleSelect";
import { toast } from "sonner";
import { fetchSportFilter } from "@/app/api/sport";
import { updateTeam } from "@/app/api/team";

const CITY_OPTIONS = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampot",
  "Takeo",
  "Kampong Cham",
].map((c) => ({ label: c, value: c }));

interface TeamInfo {
  id?: number;
  name: string;
  sportTypeId: string;
  logoUrl: string;
  description: string;
  city: string;
}

export function UpdateTeamModal({
  team,
  onSuccess,
  triggerButton,
}: {
  team: TeamInfo;
  onSuccess?: (updated: TeamInfo) => void;
  triggerButton: React.ReactNode;
}) {
  const [form, setForm] = React.useState<TeamInfo>({
    name: team.name || "",
    sportTypeId: team.sportTypeId || "",
    logoUrl: team.logoUrl || "",
    description: team.description || "",
    city: team.city || "",
  });
  const [sports, setSports] = React.useState<any>([]);
  const [open, setOpen] = React.useState(false);

  const handleFetchSports = React.useCallback(async () => {
    const sports: any = await fetchSportFilter();
    const SPORT_OPTIONS = sports.map((s: any) => ({
      label: s.name,
      value: s.id,
    }));
    setSports(SPORT_OPTIONS);
  }, []);
  React.useEffect(() => {
    handleFetchSports();
  }, [handleFetchSports]);
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof TeamInfo, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateTeam({ ...form, teamId: team.id });

      if (res.status === 200) {
        toast.success("Team updated successfully");
        onSuccess?.(form);
        setOpen(false);
      } else {
        toast.error("Failed to update team");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>
      <DialogContent className="max-w-xl rounded-2xl shadow-xl p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <DialogHeader>
            <DialogTitle className="text-2xl font-semibold">
              🛠️ Update Team Info
            </DialogTitle>
            <DialogDescription>
              Fill in the form below to update your team’s basic info.
            </DialogDescription>
          </DialogHeader>

          {/* Logo Preview */}
          <div className="flex items-center gap-4">
            <Avatar className="w-16 h-16">
              <AvatarImage src={form.logoUrl} alt="Team Logo" />
              <AvatarFallback>🏆</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Label htmlFor="logoUrl">Team Logo URL</Label>
              <Input
                id="logoUrl"
                placeholder="https://example.com/logo.png"
                value={form.logoUrl}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Name */}
          <div>
            <Label htmlFor="name">Team Name</Label>
            <Input
              id="name"
              placeholder="Enter your team name"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          {/* Sport Type ID */}
          <div>
            <Label htmlFor="sportTypeId">Sport Type ID</Label>
            <SingleSelect
              options={sports}
              value={form.sportTypeId}
              onChange={(v) => handleSelectChange("sportTypeId", v as string)}
              placeholder="Select sport..."
              searchPlaceholder="Search sport..."
              noResultsMessage="No sport found."
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="city">City</Label>
            <SingleSelect
              options={CITY_OPTIONS}
              value={form.city}
              onChange={(v) => handleSelectChange("city", v as string)}
              placeholder="Select city..."
              searchPlaceholder="Search city..."
              noResultsMessage="No city found."
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              rows={4}
              placeholder="Write something about your team"
              value={form.description}
              onChange={handleChange}
            />
          </div>

          {/* Actions */}
          <DialogFooter className="mt-2 gap-2 sm:justify-end">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-indigo-600 text-white hover:bg-indigo-700"
            >
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
