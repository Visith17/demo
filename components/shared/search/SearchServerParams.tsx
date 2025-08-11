"use client";

import { useEffect, useRef, useState, useTransition, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { useDebounce } from "@/lib/hooks/useDebounce";
import { X } from "lucide-react";

type Props = {
  label?: string;
  placeholder?: string;
  queryKey?: string;
};

const SearchServerParams = ({
  label,
  placeholder = "Search",
  queryKey = "search",
}: Props) => {
  const router = useRouter();
  const pathname = usePathname();

  const inputRef = useRef<HTMLInputElement>(null);
  const [inputValue, setInputValue] = useState("");
  const debouncedValue = useDebounce(inputValue, 300);
  const [isPending, startTransition] = useTransition();

  const updateSearchParams = useCallback(
    (value: string) => {
      const params = new URLSearchParams(window.location.search); // <-- live read
      value ? params.set(queryKey, value) : params.delete(queryKey);
  
      startTransition(() => {
        router.push(`${pathname}?${params.toString()}`, { scroll: false });
       
      });
    },
    [router, pathname, queryKey] // ❌ REMOVE searchParams
  );
  

  useEffect(() => {
    const initial = new URLSearchParams(window.location.search).get(queryKey) ?? "";
    setInputValue(initial);
  }, [queryKey]); // ✅ remove searchParams

  useEffect(() => {
    const onPopState = () => {
      const latestValue = new URLSearchParams(window.location.search).get(queryKey) ?? "";
      setInputValue(latestValue);
    };
  
    window.addEventListener("popstate", onPopState);
    return () => window.removeEventListener("popstate", onPopState);
  }, [queryKey]);
  

  useEffect(() => {
    updateSearchParams(debouncedValue);
  }, [debouncedValue, updateSearchParams]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const clearInput = () => {
    setInputValue("");
  };

  return (
    <div className="flex flex-col gap-1.5 col-span-2 md:col-span-1">
      {label && <Label>{label}</Label>}
      <div className="relative">
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder={placeholder}
          className="text-base pr-10"
        />
        {inputValue && !isPending && (
          <button
            type="button"
            onClick={clearInput}
            className="absolute top-1/2 right-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
        {isPending && (
          <div className="absolute top-2 right-2">
            <Spinner />
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchServerParams;
