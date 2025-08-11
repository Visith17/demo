"use client";
import React from "react";
import { Button } from "@/components/ui/button";

interface TeamModalProps {
  onOpenChange: (open: boolean) => void;
  teamName: string;
  onConfirmJoin: (teamName: string) => void;
}
export function TeamModal({
  onOpenChange,
  teamName,
  onConfirmJoin,
}: TeamModalProps) {
  const confirmJoin = () => {
    onConfirmJoin(teamName); // call parent’s setter
    onOpenChange(false); // close modal
  };
  if (!teamName) return null;

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 space-y-4">
        <h3 className="text-lg font-semibold">Join {teamName}?</h3>
        <p className="text-sm text-muted-foreground">
          You’re requesting to join <strong>{teamName}</strong>. The team
          captain will review your request.
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={confirmJoin}
            className="bg-blue-600 text-white hover:bg-blue-700"
          >
            Confirm
          </Button>
        </div>
      </div>
    </div>
  );
}
