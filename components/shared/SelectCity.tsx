// components/CitySelect.tsx
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
import { cn } from "@/lib/utils";

const CAMBODIA_CITIES = [
  { code: "PP", name: "Phnom Penh" },
  { code: "KDL", name: "Kandal" },
  { code: "PUR", name: "Pursat" },
  { code: "BTB", name: "Battambang" },
  { code: "SR", name: "Siem Reap" },
  { code: "SHV", name: "Sihanoukville" },
  { code: "KOL", name: "Koh Kong" },
  { code: "KTM", name: "Kampot" },
  { code: "KPS", name: "Kep" },
  { code: "KMT", name: "Kampong Thom" },
  { code: "KZC", name: "Kratie" },
  { code: "MMP", name: "Mondulkiri" },
  { code: "RBE", name: "Ratanakiri" },
  { code: "SVR", name: "Svay Rieng" },
  { code: "TBV", name: "Tbong Khmum" },
  
];

type SelectCityProps = {
  value?: string; // code like "PP"
  onChange: (name: string | null) => void;
};

export function SelectCity({ value, onChange }: SelectCityProps) {
  const [open, setOpen] = React.useState(false);

  const selectedCity = CAMBODIA_CITIES.find((c) => c.name === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          className="w-full justify-between"
        >
          {selectedCity?.name || "Select city..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-full p-0">
        <Command>
          <CommandInput placeholder="Search city..." />
          <CommandList>
            <CommandEmpty>No city found.</CommandEmpty>
            <CommandGroup>
              {CAMBODIA_CITIES.map((city) => (
                <CommandItem
                  key={city.code}
                  value={city.name}
                  onSelect={() => {
                    if (value === city.name) {
                      onChange(null); // deselect
                    } else {
                      onChange(city.name);
                    }
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      value === city.name ? "opacity-100" : "opacity-0"
                    )}
                  />
                  {city.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
