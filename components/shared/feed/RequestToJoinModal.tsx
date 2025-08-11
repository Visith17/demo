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
import { toast } from "sonner";
import { requestJoinTeam } from "@/app/api/team";
import { SingleSelect } from "@/components/shared/SingleSelect";

const SPORT_POSITION_OPTIONS = [
  "Goalkeeper", "Defender", "Center-back", "Full-back", "Wing-back", "Sweeper",
  "Midfielder", "Defensive Midfielder", "Central Midfielder", "Attacking Midfielder",
  "Winger", "Forward", "Striker", "Second Striker",
  "Point Guard", "Shooting Guard", "Small Forward", "Power Forward", "Center",
  "Outside Hitter", "Opposite Hitter", "Middle Blocker", "Setter", "Libero", "Defensive Specialist",
  "Singles Player", "Doubles Player", "Mixed Doubles Player",
].map((p) => ({ label: p, value: p }));

const ROLE_OPTIONS = ["Captain", "Coach", "Player"].map((r) => ({ label: r, value: r }));

interface RequestJoinPayload {
  teamId: number;
  role: string;
  position: string;
  notes: string;
}

export function RequestToJoinModal({
  teamId,
  onSuccess,
  triggerButton,
}: {
  teamId: number;
  onSuccess?: () => void;
  triggerButton: React.ReactNode;
}) {
  const [form, setForm] = React.useState<RequestJoinPayload>({
    teamId,
    role: "",
    position: "",
    notes: "",
  });

  const [open, setOpen] = React.useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { id, value } = e.target;
    setForm((prev) => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (field: keyof RequestJoinPayload, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validRoles = ROLE_OPTIONS.map((r) => r.value);
    const validPositions = SPORT_POSITION_OPTIONS.map((p) => p.value);

    if (!validRoles.includes(form.role)) {
      toast.error("Please select a valid role.");
      return;
    }

    if (!validPositions.includes(form.position)) {
      toast.error("Please select a valid position.");
      return;
    }

    try {
      const res = await requestJoinTeam(form);

      if (res.status === 200) {
        toast.success("Request sent successfully!");
        onSuccess?.();
        setOpen(false);
      } else {
        toast.error(res.message || "Request failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{triggerButton}</DialogTrigger>

      <DialogContent className="max-w-md rounded-xl shadow-xl p-6 space-y-6 animate-in fade-in slide-in-from-bottom-4">
        <form onSubmit={handleSubmit} className="space-y-5">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold">
              📨 Request to Join Team
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Please fill in the details to send your join request.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2">
            <Label htmlFor="role">🎖️ Role</Label>
            <SingleSelect
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(v) => handleSelectChange("role", v as string)}
              placeholder="Select role..."
              searchPlaceholder="Search role..."
              noResultsMessage="No role found."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="position">📌 Preferred Position</Label>
            <SingleSelect
              options={SPORT_POSITION_OPTIONS}
              value={form.position}
              onChange={(v) => handleSelectChange("position", v as string)}
              placeholder="Select position..."
              searchPlaceholder="Search position..."
              noResultsMessage="No position found."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">📝 Notes (optional)</Label>
            <Textarea
              id="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="Tell the team why you want to join..."
              rows={3}
            />
          </div>

          <DialogFooter className="mt-2 flex justify-end gap-2">
            <DialogClose asChild>
              <Button type="button" variant="ghost">
                Cancel
              </Button>
            </DialogClose>
            <Button
              type="submit"
              className="bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
            >
              Send Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
