"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "next/navigation";

export interface City {
  code: string;
  name: string;
}

export interface CityFilterProps {
  className?: string;
  label?: string;
  cities?: City[];
  defaultValue?: string;
  onChange?: (cityCode: string | null) => void;
  searchPlaceholder?: string;
  emptyMessage?: string;
}

const DEFAULT_CITIES: City[] = [
  { code: "PP", name: "Phnom Penh" },
  { code: "SHV", name: "Sihanoukville" },
  { code: "SR", name: "Siem Reap" },
  { code: "BTB", name: "Battambang" },
  { code: "KTM", name: "Kampot" },
  { code: "KPS", name: "Kep" },
  { code: "KDL", name: "Kandal" },
  { code: "PVH", name: "Preah Vihear" },
] as const;

/**
 * CityFilter component for selecting Cambodian cities
 * Features:
 * - URL parameter synchronization
 * - Searchable dropdown with fuzzy matching
 * - Keyboard navigation
 * - Clear selection support
 * - Customizable city list
 */
export function CityFilter({
  className,
  label = "City",
  cities = DEFAULT_CITIES,
  defaultValue,
  onChange,
  searchPlaceholder = "Search city...",
  emptyMessage = "No city found.",
}: CityFilterProps) {
  const [open, setOpen] = React.useState(false);
  const [value, setValue] = React.useState("");
  const [selectedCityCode, setSelectedCityCode] = React.useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();

  // Memoize the city lookup for better performance
  const cityMap = React.useMemo(
    () => new Map(cities.map(city => [city.code, city])),
    [cities]
  );

  // Update URL and trigger onChange when selectedCityCode changes
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (selectedCityCode) {
      params.set("city", selectedCityCode);
    } else {
      params.delete("city");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    onChange?.(selectedCityCode);
  }, [selectedCityCode, router, pathname, onChange]);

  // Initialize from URL or default value on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const cityParam = params.get("city") || defaultValue;
    
    if (cityParam && cityMap.has(cityParam)) {
      const city = cityMap.get(cityParam);
      setValue(city?.name || "");
      setSelectedCityCode(city?.code || null);
    }
  }, [defaultValue, cityMap]);

  const handleSelect = React.useCallback((currentValue: string) => {
    const selected = cities.find((c) => c.name === currentValue);
    setOpen(false);
    
    if (selected?.code === selectedCityCode) {
      // Clear selection if same city clicked
      setValue("");
      setSelectedCityCode(null);
    } else {
      setValue(selected?.name || "");
      setSelectedCityCode(selected?.code || null);
    }
  }, [cities, selectedCityCode]);

  return (
    <div className={cn("flex flex-col gap-1.5 w-full md:max-w-xs", className)}>
      <Label htmlFor="city-filter">{label}</Label>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id="city-filter"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label={label}
            className="w-full justify-between"
          >
            {value || "Select city..."}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput 
              placeholder={searchPlaceholder}
              aria-label={`Search ${label.toLowerCase()}`}
            />
            <CommandList>
              <CommandEmpty>{emptyMessage}</CommandEmpty>
              <CommandGroup>
                {cities.map((city) => (
                  <CommandItem
                    key={city.code}
                    value={city.name}
                    onSelect={handleSelect}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        city.name === value ? "opacity-100" : "opacity-0"
                      )}
                      aria-hidden="true"
                    />
                    {city.name}
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}

export default CityFilter;
