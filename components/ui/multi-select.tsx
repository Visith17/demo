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
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Option = {
  label: string;
  value: string;
};

type MultiSelectProps = {
  selected: string[];
  options: Option[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
};

export function MultiSelect({
  selected,
  options,
  onChange,
  placeholder = "Select options",
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");

  const toggleSelect = (value: string) => {
    const newSelected = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(newSelected);
  };

  const clearAll = () => {
    onChange([]);
    setSearch("");
  };

  const selectedLabels = options.filter((opt) =>
    selected.includes(opt.value)
  );

  const filteredOptions = options.filter((opt) =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-1.5">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
          >
            <span
              className={cn(
                "truncate",
                selected.length === 0 && "text-muted-foreground"
              )}
            >
              {selected.length > 0
                ? `${selected.length} selected`
                : placeholder}
            </span>
            <ChevronsUpDown className="w-4 h-4 shrink-0 opacity-50 ml-2" />
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-full p-2">
          <Command>
            <CommandInput
              placeholder="Search..."
              value={search}
              onValueChange={setSearch}
              className="h-9"
            />
            <CommandList className="max-h-64 overflow-y-auto scrollbar-hide">
              <CommandEmpty>No options found</CommandEmpty>
              <CommandGroup>
                {filteredOptions.map((opt) => {
                  const isSelected = selected.includes(opt.value);
                  return (
                    <CommandItem
                      key={opt.value}
                      value={opt.label}
                      onSelect={() => toggleSelect(opt.value)}
                      className="cursor-pointer"
                    >
                      <Check
                        className={cn(
                          "mr-2 h-4 w-4 text-blue-600",
                          isSelected ? "opacity-100" : "opacity-0"
                        )}
                      />
                      {opt.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </CommandList>

            {selected.length > 0 && (
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
        <div className="flex flex-wrap gap-1">
          {selectedLabels.map((opt) => (
            <Badge
              key={opt.value}
              variant="outline"
              className="flex items-center gap-1"
            >
              {opt.label}
              <button
                type="button"
                onClick={() => toggleSelect(opt.value)}
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
