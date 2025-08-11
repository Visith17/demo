"use client";

import React, { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { Input } from "@/components/ui/input";
import { useDebouncedCallback } from "use-debounce";

function PitchSearch() {
  const router = useRouter();
  const searchParams = useSearchParams()
  
  const [searchTerm, setSearchTerm] = React.useState<string>("");

  const debounced = useDebouncedCallback(
    (value: string) => setSearchTerm(value),
    500,
    { maxWait: 2000 }
  );

  // useEffect(() => {
  //   if (searchTerm) {
  //     const params = new URLSearchParams(searchParams.toString())
  //     params.set("search", searchTerm);
  //     router.push(params.toString());
  //   }
  // }, [searchTerm, router]);

  return (
    <Input
      type="text"
      placeholder="Search"
      defaultValue={searchTerm}
      onChange={(e) => debounced(e.target.value)}
    />
  );
}

export default PitchSearch;
