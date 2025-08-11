// components/sport-feed/ClubsTab.tsx
"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/shared/ScrollArea";
import { Club } from "@/types";
import { ClubModal } from "./ClubModal";

interface ClubsTabProps {
  clubs: Club[];
}

export default function ClubsTab({ clubs }: ClubsTabProps) {
  const [search, setSearch] = React.useState("");

  const formatHour = (hour: number, minute: number = 0): string => {
    const displayHour = hour % 12 || 12;
    const ampm = hour < 12 ? "AM" : "PM";
    const paddedMinute = minute.toString().padStart(2, "0");
    return `${displayHour}:${paddedMinute} ${ampm}`;
  };
  const [selectedClub, setSelectedClub] = React.useState<Club | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const onViewClub = (club: Club) => {
    setSelectedClub(club);
    setIsModalOpen(true);
  };

  return (
    <>
      {isModalOpen && selectedClub && (
        <ClubModal
          open={isModalOpen}
          onOpenChange={setIsModalOpen}
          club={selectedClub}
          openHour={formatHour(
            selectedClub.scheduleOption.operationHours.openHour
          )}
          closeHour={formatHour(
            selectedClub.scheduleOption.operationHours.closeHour
          )}
        />
      )}
      <Input
        placeholder="Search clubs..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="mb-3"
      />
      <ScrollArea >
        {clubs
          .filter((club) =>
            club.name.toLowerCase().includes(search.toLowerCase())
          )
          .map((club, i) => {
            const timeRange = club.scheduleOption?.operationHours
              ? `${formatHour(
                  club.scheduleOption.operationHours.openHour
                )} - ${formatHour(
                  club.scheduleOption.operationHours.closeHour
                )}`
              : "N/A";

            const location =
              club.locationUrl
                ?.split("?q=")[1]
                ?.split("&")[0]
                ?.replaceAll("+", " ") ?? "Google Map";

            return (
              <motion.div
                key={club.id}
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 250 }}
              >
                <Card className="rounded-2xl border shadow-sm bg-white">
                  <CardContent className="p-2 flex flex-col">
                    <div className="flex items-center gap-1">
                      <Avatar className="w-14 h-14 border-2 border-purple-500">
                        <AvatarImage src={`/club${i}.jpg`} />
                        <AvatarFallback>CL</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <h3 className="text-base font-semibold leading-snug">
                          {club.name}
                        </h3>
                        <p className="text-xs text-muted-foreground truncate">
                          📍 {location}
                        </p>
                      </div>
                      <div className="text-xs text-yellow-600 font-medium">
                        ⭐ {club.rating?.overall_rating?.toFixed(1) ?? "-"}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1">
                      <span>Open: 🕒 {timeRange}</span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="rounded-full text-purple-600 border-purple-300 hover:bg-purple-100"
                        onClick={() => onViewClub(club)}
                      >
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
      </ScrollArea>
    </>
  );
}
