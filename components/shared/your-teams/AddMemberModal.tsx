'use client';

import * as React from 'react';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { UserPlusIcon } from 'lucide-react';
import { inviteMembers } from '@/app/api/team';
import { toast } from 'sonner';
import { useRouter } from "next/navigation";
import { SingleSelect } from "@/components/shared/SingleSelect";

const SPORT_POSITION_OPTIONS = [
    // Football / Futsal
    "Goalkeeper",
    "Defender",
    "Center-back",
    "Full-back",
    "Wing-back",
    "Sweeper",
    "Midfielder",
    "Defensive Midfielder",
    "Central Midfielder",
    "Attacking Midfielder",
    "Winger",
    "Forward",
    "Striker",
    "Second Striker",
  
    // Basketball
    "Point Guard",
    "Shooting Guard",
    "Small Forward",
    "Power Forward",
    "Center",
  
    // Volleyball
    "Outside Hitter",
    "Opposite Hitter",
    "Middle Blocker",
    "Setter",
    "Libero",
    "Defensive Specialist",
    
    // Badminton
    "Singles Player",
    "Doubles Player",
    "Mixed Doubles Player", 
  
  ].map((p) => ({ label: p, value: p }));

  const ROLE_OPTIONS = [
    "Capiten",
    "Coach",
    "Player",
  ].map((r) => ({label: r, value: r}))
  

interface AddMemberModalProps {
  teamId: number;
  triggerButton?: React.ReactNode;
  onSuccess?: (newMember: any) => void; // ✅ updated
}

export function AddMemberModal({ teamId, triggerButton, onSuccess }: AddMemberModalProps) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({
    userId: '',
    role: '',
    position: '',
    notes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelectChange = (field: keyof any, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validRoles = ROLE_OPTIONS.map((r) => r.value);
    const validPositions = SPORT_POSITION_OPTIONS.map((p) => p.value);
  
    if (!form.role || !validRoles.includes(form.role)) {
      toast.error("Please select a valid role.");
      return;
    }
  
    if (!form.position || !validPositions.includes(form.position)) {
      toast.error("Please select a valid position.");
      return;
    }
    const payload = {
      teamId,
      members: [
        {
          userId: Number(form.userId),
          role: form.role,
          position: form.position,
          notes: form.notes || '',
        },
      ],
    };
   
    try {
      // 🔁 Replace this with your actual API call
      const res = await inviteMembers(payload);
      if(res.status === 200) {
        toast.success(res.message)
        router.refresh(); // ✅ trigger refetch
        // const newMember = res.addedMembers[0]; // adjust based on your API response shape
        // console.log(newMember)
        // onSuccess?.(newMember); // ✅ pass back
      }

      setOpen(false);
      setForm({ userId: '', role: '', position: '', notes: '' });
    } catch (err) {
      console.error('Failed to invite member:', err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button variant="outline">
            <UserPlusIcon className="w-4 h-4 mr-2" />
            Invite Member
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg rounded-2xl shadow-xl">
        <DialogHeader className="text-center">
          <div className="flex flex-col items-center gap-2">
            <div className="bg-indigo-100 text-indigo-600 p-3 rounded-full">
              <UserPlusIcon className="w-6 h-6" />
            </div>
            <DialogTitle className="text-xl font-semibold text-gray-800">Invite Member</DialogTitle>
            <p className="text-sm text-gray-500">Fill in the details to invite a new teammate.</p>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-1">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              name="userId"
              type="number"
              value={form.userId}
              onChange={handleChange}
              placeholder="e.g., 15"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="role">Role</Label>
            <SingleSelect
              options={ROLE_OPTIONS}
              value={form.role}
              onChange={(v) => handleSelectChange("role", v as string)}
              placeholder="Select role..."
              searchPlaceholder="Search role..."
              noResultsMessage="No role found."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="position">Position</Label>
            <SingleSelect
              options={SPORT_POSITION_OPTIONS}
              value={form.position}
              onChange={(v) => handleSelectChange("position", v as string)}
              placeholder="Select position..."
              searchPlaceholder="Search position..."
              noResultsMessage="No position found."
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Input
              id="notes"
              name="notes"
              value={form.notes}
              onChange={handleChange}
              placeholder="e.g., Invited by coach"
            />
          </div>

          <DialogFooter className="mt-6 flex justify-end gap-2">
            <DialogClose asChild>
              <Button variant="ghost" type="button">Cancel</Button>
            </DialogClose>
            <Button type="submit" className="bg-indigo-600 text-white hover:bg-indigo-700">
              Send Invite
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
