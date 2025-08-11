"use client";

import * as React from "react";
import { Check, ChevronsUpDown, X } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Badge } from "@/components/ui/badge";

interface SportType {
  id: number;
  name: string;
}

const URL_PARAM_KEY = "sportTypeIds";

interface SportTypeFilterProps {
  sportTypeOptions: SportType[];
  maxSelections?: number; // Optional limit
}

export function SportTypeFilter({
  sportTypeOptions,
  maxSelections,
}: SportTypeFilterProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = React.useState(false);
  const [selectedIds, setSelectedIds] = React.useState<number[]>([]);
  const [search, setSearch] = React.useState("");

  // Load from URL on mount
  React.useEffect(() => {
    const param = searchParams.get(URL_PARAM_KEY);
    if (param) {
      const ids = param
        .split(",")
        .map((id) => parseInt(id, 10))
        .filter((id) => !isNaN(id));
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
  
    const favoriteSportsRaw = getCookieValue("favoriteSports");
  
    // Only act if URL doesn't already include the param
    if (!searchParams.get(URL_PARAM_KEY)) {
      try {
        const parsed = favoriteSportsRaw?.startsWith("j:")
          ? JSON.parse(favoriteSportsRaw.slice(2))
          : JSON.parse(favoriteSportsRaw || "null");
  
        if (Array.isArray(parsed)) {
          const validIds = parsed
            .map((id) => parseInt(id, 10))
            .filter((id) => !isNaN(id));
  
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
  
  // Update URL on change
  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (selectedIds.length > 0) {
      params.set(URL_PARAM_KEY, selectedIds.join(","));
    } else {
      params.delete(URL_PARAM_KEY);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, selectedIds, router, pathname]);

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) => {
      if (prev.includes(id)) return prev.filter((v) => v !== id);
      if (maxSelections && prev.length >= maxSelections) return prev;
      return [...prev, id];
    });
  };

  const clearAll = () => {
    setSelectedIds([]);
    setSearch("");
  };

  const selectedLabels = sportTypeOptions.filter((opt) =>
    selectedIds.includes(opt.id)
  );

  const filteredOptions = sportTypeOptions.filter((opt) =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span
              className={cn(
                "truncate",
                selectedLabels.length === 0 && "text-muted-foreground"
              )}
            >
              {selectedLabels.length > 0
                ? `${selectedLabels.length} selected`
                : "Select sport types..."}
            </span>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-2">
          <Command>
            <CommandInput
              placeholder="Search sport types..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList className="max-h-64 overflow-y-auto scrollbar-hide">
              <CommandEmpty>No sport types found.</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((opt) => {
                  const isSelected = selectedIds.includes(opt.id);
                  return (
                    <CommandItem
                      key={opt.id}
                      value={opt.name}
                      onSelect={() => toggleSelect(opt.id)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-blue-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.name}
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

      {/* Selected chips */}
      {selectedLabels.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((opt) => (
            <Badge
              key={opt.id}
              variant="outline"
              className="flex items-center gap-1"
            >
              {opt.name}
              <button
                type="button"
                onClick={() => toggleSelect(opt.id)}
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
