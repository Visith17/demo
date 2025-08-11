"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
// import { Match } from "@/types"; // Optional: Replace or inline type

interface MatchModalProps {
  match: any | null;
  onOpenChange: (open: boolean) => void;
  onConfirm: (match: any) => void;
}

export function MatchModal({
  match,
  onOpenChange,
  onConfirm,
}: MatchModalProps) {
  if (!match) return null;

  const handleConfirm = () => {
    onConfirm(match);
    onOpenChange(false);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 space-y-5 animate-in fade-in slide-in-from-bottom-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-lg font-semibold">{match.team.name}</h2>
            <span className="text-xs text-muted-foreground">
              ⚔️ vs Random Opponent • Level: {match.level}
            </span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            ✖
          </Button>
        </div>

        {/* Match Info */}
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>
            <strong>🏅 Sport:</strong> {match.preferredSport.name}
          </p>
          <p>
            <strong>📅 Date:</strong> {match.date}
          </p>
          <p>
            <strong>⏰ Time:</strong> {match.preferredTime}
          </p>
          <p>
            <strong>📍 Location:</strong> {match.preferredClub.name}
          </p>
          {match.note && (
            <p>
              <strong>📝 Note:</strong> {match.note}
            </p>
          )}
        </div>

        {/* ELO & Tags */}
        <div className="flex items-center flex-wrap gap-2 text-sm">
          <span className="font-medium text-muted-foreground">💡 Tags:</span>
          <Badge
            variant="secondary"
            className="text-xs bg-green-100 text-green-700 border border-green-300"
          >
            ELO: {match.eloScore ?? "91%"}
          </Badge>
          <Badge
            className="text-xs bg-indigo-100 text-indigo-700 border border-indigo-300"
          >
            {match.level}
          </Badge>
        </div>

        {/* Action Button */}
        <div className="flex justify-end">
          <Button
            size="sm"
            className="rounded-full bg-green-100 text-green-700 border border-green-300 hover:bg-green-200"
            onClick={handleConfirm}
          >
            Accept Match
          </Button>
        </div>
      </div>
    </div>
  );
}
