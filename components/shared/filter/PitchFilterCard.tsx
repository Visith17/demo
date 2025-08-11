"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence, Variants } from "framer-motion";
import {
  ChevronDown,
  ChevronUp,
  Search,
  Calendar,
  Clock,
  Timer,
  Trophy,
} from "lucide-react";

import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import SearchClubFilter from "../search/SearchClub";
import SelectPlayDateFilter from "../SelectPlayDateFilter";
import TimeInPicker from "../TimeInPicker";
import TimeIntervalFilter from "./TimeIntervalFilter";
import { SportTypeFilter } from "./SportTypeFilter";
import { SelectItem } from "@/types";

interface FilterCardProps {
  clubs: SelectItem[];
  sports: any;
}

interface FilterState {
  isSearchOpen: boolean;
  intervalHours: number | null;
}

// Animation variants
const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
      when: "afterChildren",
    },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.3,
      when: "beforeChildren",
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 },
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

// Default values
const DEFAULT_INTERVAL_HOURS = 2;
const DEFAULT_SEARCH_OPEN = true;

export default function FilterCard({ clubs, sports }: FilterCardProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // State
  const [filterState, setFilterState] = useState<FilterState>({
    isSearchOpen: DEFAULT_SEARCH_OPEN,
    intervalHours: null,
  });

  // Initialize state from URL params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isSearchOpen = params.get("isSearchOpen");
    const intervalHours = params.get("intervalHours");

    setFilterState({
      isSearchOpen: isSearchOpen === "true" ? true : DEFAULT_SEARCH_OPEN,
      intervalHours: intervalHours ? parseInt(intervalHours) : null,
    });
  }, []);

  // Sync state to URL
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    // params.set("isSearchOpen", String(filterState.isSearchOpen));
    // params.set("intervalHours", String(filterState.intervalHours));

    const newUrl = `${pathname}?${params.toString()}`;
    router.replace(newUrl, { scroll: false });
  }, [filterState, pathname, router, searchParams]);

  // Update interval hours
  const handleIntervalChange = (hours: number) => {
    setFilterState((prev) => ({
      ...prev,
      intervalHours: hours,
    }));
  };

  // Toggle search visibility
  const toggleSearch = () => {
    setFilterState((prev) => ({
      ...prev,
      isSearchOpen: !prev.isSearchOpen,
    }));
  };

  return (
    <div className="relative z-10">
      <Button
        variant="outline"
        onClick={toggleSearch}
        className="w-full mb-2 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-muted-foreground/20"
      >
        <span className="flex items-center gap-2">
          <Search className="w-4 h-4" />
          Filter Options
        </span>
        {filterState.isSearchOpen ? (
          <ChevronUp className="w-4 h-4 ml-2" />
        ) : (
          <ChevronDown className="w-4 h-4 ml-2" />
        )}
      </Button>

      <AnimatePresence>
        {filterState.isSearchOpen && (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            exit="hidden"
            layout
          >
            <Card className="overflow-hidden border-muted-foreground/20">
              <motion.div
                className="p-6 space-y-6"
                variants={containerVariants}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Club Search Section */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Search className="w-4 h-4 text-primary" />
                      Find Your Club
                    </div>
                    <SearchClubFilter
                      clubs={clubs}
                      // className="w-full"
                    />
                  </motion.div>
                  {/* Sport Type Selection */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Trophy className="w-4 h-4 text-primary" />
                      Sport Type
                    </div>
                    <SportTypeFilter sportTypeOptions={sports} />
                  </motion.div>
                  {/* Interval Selection */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Timer className="w-4 h-4 text-primary" />
                      Duration
                    </div>
                    <TimeIntervalFilter />
                  </motion.div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Date Selection Section */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Calendar className="w-4 h-4 text-primary" />
                      Play Date
                    </div>
                    <SelectPlayDateFilter className="w-full" />
                  </motion.div>

                  {/* Time Selection Section */}
                  <motion.div className="space-y-2" variants={itemVariants}>
                    <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Clock className="w-4 h-4 text-primary" />
                      Start Time
                    </div>
                    <TimeInPicker className="w-full" />
                  </motion.div>
                </div>
              </motion.div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
