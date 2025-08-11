"use client";

import * as React from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronsUpDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { SelectItem } from "@/types";
import { cn } from "@/lib/utils";

interface SearchClubFilterProps {
  clubs: SelectItem[]; // clubs with { id, label, value }
  label?: string;
  placeholder?: string;
  className?: string;
}

const URL_PARAM_KEY = "sportClubIds";

export function SearchClubFilter({
  clubs,
  label = "",
  placeholder = "Select clubs...",
  className,
}: SearchClubFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // Initialize from URL
  React.useEffect(() => {
    const param = searchParams.get(URL_PARAM_KEY);
    if (param) {
      const ids = param.split(",").filter(Boolean);
      setSelectedIds(ids);
    }
    
  }, [searchParams]);

  React.useEffect(() => {
    const getCookieValue = (name: string): string | null => {
      const match = document.cookie.match(
        new RegExp("(^| )" + name + "=([^;]+)")
      );
      return match ? decodeURIComponent(match[2]) : null;
    };
  
    const favoriteClubsRaw = getCookieValue("favoriteClubs");
  
    // Only act if URL doesn't already include the param
    if (!searchParams.get(URL_PARAM_KEY)) {
      try {
        const parsed = favoriteClubsRaw?.startsWith("j:")
          ? JSON.parse(favoriteClubsRaw.slice(2))
          : JSON.parse(favoriteClubsRaw || "null");
  
        if (Array.isArray(parsed)) {
          const validIds = parsed
            .map((id) => String(id));
  
          if (validIds.length > 0) {
            // 1. Update state
            setSelectedIds(validIds);
            
            // 2. Update URL
            const params = new URLSearchParams(searchParams.toString());
            params.set(URL_PARAM_KEY, validIds.join(","));
            
            setTimeout(() => {
              router.push(`${pathname}?${params.toString()}`, { scroll: false });
            }, 500)
            
          }
        }
      } catch (err) {
        console.error("Invalid favoriteSports cookie:", err);
      }
    }
  }, [searchParams, pathname, router]);
  // Update URL
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedIds.length > 0) {
      params.set(URL_PARAM_KEY, selectedIds.join(","));
    } else {
      params.delete(URL_PARAM_KEY);
    }
    
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, selectedIds, router, pathname]);

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((v) => v !== id) : [...prev, id]
    );
  };

  const clearAll = () => {
    setSelectedIds([]);
    setSearch("");
  };

  const selectedLabels = clubs.filter((club) =>
    selectedIds.includes(club.id.toString())
  );

  const filteredOptions = clubs.filter((club) =>
    club.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && <Label>{label}</Label>}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-between">
            <span
              className={cn(
                "truncate",
                selectedLabels.length === 0 && "text-muted-foreground"
              )}
            >
              {selectedLabels.length > 0
                ? `${selectedLabels.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-2">
          <Command>
            <CommandInput
              placeholder="Search clubs..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList className="max-h-64 overflow-y-auto scrollbar-hide">
              <CommandEmpty>No clubs found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((club) => {
                  const isSelected = selectedIds.includes(club.id.toString());
                  return (
                    <CommandItem
                      key={club.id}
                      value={club.label}
                      onSelect={() => toggleSelect(club.id.toString())}
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-blue-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {club.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {selectedIds.length > 0 && (
              <div className="mt-2 text-right">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={clearAll}
                >
                  Clear all
                </Button>
              </div>
            )}
          </Command>
        </PopoverContent>
      </Popover>

      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-1">
          {selectedLabels.map((club) => (
            <Badge key={club.id} variant="outline" className="flex items-center gap-1">
              {club.label}
              <button
                type="button"
                onClick={() => toggleSelect(club.id.toString())}
                className="ml-1"
              >
                <X className="h-3 w-3 text-muted-foreground" />
              </button>
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}

export default SearchClubFilter;
