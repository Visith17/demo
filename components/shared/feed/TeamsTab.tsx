// components/sport-feed/TeamsTab.tsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/shared/ScrollArea";
import { TeamModal } from "./TeamModal";
import { RequestToJoinModal } from "./RequestToJoinModal";

interface Team {
  name: string;
  sport: string;
  level: string;
}

interface TeamsTabProps {
  teams: any[];
}

export function TeamsTab({ teams }: TeamsTabProps) {
  const [search, setSearch] = React.useState("");
  const [selectedTeam, setSelectedTeam] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [teamJoinStatus, setTeamJoinStatus] = React.useState<
    Record<string, "none" | "requested" | "joined">
  >({});

  const handleJoin = (teamName: string) => {
    setSelectedTeam(teamName);
    setIsModalOpen(true);
  };

  const handleConfirmJoin = (teamName: string) => {
    setTeamJoinStatus((prev) => ({ ...prev, [teamName]: "requested" }));
  };

  const sportIconMap: Record<string, string> = {
    Football: "⚽",
    Futsal: "🥅",
    Running: "🏃",
    Basketball: "🏀",
  };

  const levelColorMap: Record<string, string> = {
    Ranked: "bg-blue-100 text-blue-700",
    Amateur: "bg-yellow-100 text-yellow-700",
    Open: "bg-green-100 text-green-700",
  };

  return (
    <>
      {isModalOpen && selectedTeam && (
        <TeamModal
          onOpenChange={setIsModalOpen}
          teamName={selectedTeam}
          onConfirmJoin={handleConfirmJoin}
        />
      )}
      <Input
        placeholder="Search teams..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <ScrollArea>
        {teams
          .filter((team) =>
            `${team.name} ${team.sport} ${team.level}`
              .toLowerCase()
              .includes(search.toLowerCase())
          )
          .map((team, i) => {
            const status = teamJoinStatus[team.name] || "none";

            return (
              <motion.div
                key={i}
                whileHover={{ scale: 1.015 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card className="rounded-2xl shadow-sm hover:shadow-md transition bg-gradient-to-r from-white to-gray-50">
                  <CardContent className="p-1 flex items-center gap-4">
                    <Avatar className="w-14 h-14 ring-2 ring-blue-500">
                      <AvatarImage src={team.logoUrl} />
                      <AvatarFallback>TM</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-base">{team.name}</h3>
                        <span className="text-xl">
                          {sportIconMap[team.sport_type.name] ?? "🎽"}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {team.sport_type.name} . {team.members.length + 1}{" "}
                        members
                      </div>
                      <Badge
                        className={`mt-1 rounded-full px-2 py-0.5 text-xs ${
                          levelColorMap[team.level] ||
                          "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {team.level}
                      </Badge>
                    </div>

                    {status === "none" && (
                      <RequestToJoinModal
                        teamId={team.id}
                        onSuccess={() => {
                          // Optional: Refresh UI or show status
                        }}
                        triggerButton={
                          <Button
                            variant="outline"
                            size="sm"
                            className="rounded-full text-blue-600 border-blue-300 hover:bg-blue-100"
                          >
                            🙋 Join
                          </Button>
                        }
                      />
                    )}
                    {status === "requested" && (
                      <Button
                        size="sm"
                        disabled
                        variant="outline"
                        className="rounded-full"
                      >
                        Requested
                      </Button>
                    )}
                    {status === "joined" && (
                      <Button
                        size="sm"
                        disabled
                        className="rounded-full bg-green-600 text-white"
                      >
                        Joined
                      </Button>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </ScrollArea>
    </>
  );
}
