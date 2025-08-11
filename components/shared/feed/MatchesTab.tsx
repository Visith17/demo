"use client";
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/shared/ScrollArea";
import { MatchModal } from "./MatchModal";
import { CalendarIcon, ClockIcon, MapPinIcon, ZapIcon } from "lucide-react";
import { format, isToday, parse } from "date-fns";

interface Match {
  team: string;
  sport: string;
  level: string;
  location: string;
  date: string;
  time: string;
  index: number;
}

interface MatchesTabProps {
  matches: any[];
  accepted: Record<number, boolean>;
}

export function MatchesTab({ matches, accepted }: MatchesTabProps) {
  const [search, setSearch] = React.useState("");
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [selectedMatch, setSelectedMatch] = React.useState<Match | null>(null);

  const handleAccept = (match: any) => {
    setIsModalOpen(true);
    setSelectedMatch(match);
  };

  const handleConfirm = (match: any) => {
    accepted[match.index] = true;
  };

  const levelColorMap: Record<string, string> = {
    Ranked: "bg-blue-100 text-blue-700",
    Amateur: "bg-yellow-100 text-yellow-700",
    Open: "bg-green-100 text-green-700",
  };

  const groupByToday = (matches: any[]) => {
    const today: any[] = [];
    const upcoming: any[] = [];

    matches.forEach((match) => {
      const matchDate = parse("26-07-2025", "yyyy-MM-dd", new Date());
      if (isToday(matchDate)) {
        today.push(match);
      } else {
        upcoming.push(match);
      }
    });

    return { today, upcoming };
  };

  const { today, upcoming } = groupByToday(
    matches.filter((match) =>
      `${match.team.name} ${match.preferredSport.name} ${match.preferredClub.name} ${match.level}`
        .toLowerCase()
        .includes(search.toLowerCase())
    )
  );

  const renderSection = (title: string, sectionMatches: any[]) => (
    <>
      {sectionMatches.length > 0 && (
        <div className="mb-2 mt-4 text-sm font-semibold text-muted-foreground">
          {title}
        </div>
      )}
      {sectionMatches.map((match, i) => {
        const isAccepted = accepted[match.index] === true;
        return (
          <motion.div
            key={i}
            whileHover={{ scale: 1.015 }}
            transition={{ type: "spring", stiffness: 250 }}
          >
            <Card className="rounded-2xl shadow-sm hover:shadow-md transition bg-gradient-to-r from-white to-gray-50">
              <CardContent className="p-2 flex items-center gap-4">
                <Avatar className="w-14 h-14 ring-2 ring-green-500">
                  <AvatarImage src="https://www.freepnglogos.com/uploads/sport-png/escudo-sport-clube-recife-png-quero-imagem-26.png" />
                  <AvatarFallback>TM</AvatarFallback>
                </Avatar>

                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-semibold text-base max-w-[120px] sm:max-w-[180px] md:max-w-[240px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      {match.team.name}
                    </h3>
                    {/* <ZapIcon className="w-4 h-4 text-yellow-500" /> */}
                    <div className="text-sm text-muted-foreground">
                      {match.preferredSport.name}
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mt-1 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      {format(new Date(), "MMM d")}
                    </span>
                    <span className="flex items-center gap-1">
                      <ClockIcon className="w-3.5 h-3.5" />
                      {match.preferredTime}
                    </span>
                    <Badge
                      className={`rounded-full px-2 py-0.5 ${
                        levelColorMap[match.level] ||
                        "bg-indigo-100 text-indigo-700"
                      }`}
                    >
                      {match.level}
                    </Badge>
                    <span className="flex items-center gap-1 font-medium text-gray-700">
                      ELO:{" "}
                      <span className="text-green-700 font-semibold ml-1">
                        {match.eloScore ?? "91%"}
                      </span>
                    </span>
                    <span className="text-sm text-muted-foreground max-w-[120px] sm:max-w-[180px] md:max-w-[240px] truncate whitespace-nowrap overflow-hidden text-ellipsis">
                      {match.preferredClub.name}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                {!isAccepted ? (
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full text-green-600 border-green-300 hover:bg-green-100 whitespace-nowrap"
                    onClick={() => handleAccept(match)}
                  >
                    Accept
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    disabled
                    className="rounded-full bg-green-600 text-white"
                  >
                    Accepted
                  </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </>
  );

  return (
    <>
      {isModalOpen && selectedMatch && (
        <MatchModal
          onOpenChange={setIsModalOpen}
          match={selectedMatch}
          onConfirm={handleConfirm}
        />
      )}

      <div className="max-w-3xl mx-auto px-1 py-1">
        <Input
          placeholder="Search matches..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className=""
        />
        <ScrollArea>
          {renderSection("Today's Matches", today)}
          {renderSection("Upcoming Matches", upcoming)}
        </ScrollArea>
      </div>
    </>
  );
}
