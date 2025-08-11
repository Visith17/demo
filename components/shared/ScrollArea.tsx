import React from "react";
import clsx from "clsx";

interface ScrollAreaProps {
  children: React.ReactNode;
  maxHeight?: string; // Accepts Tailwind class value like 'max-h-[50vh]'
}

export const ScrollArea = ({ children, maxHeight = "max-h-[59vh]" }: ScrollAreaProps) => (
  <div className={clsx("overflow-y-auto space-y-1 pr-1 scrollbar-hide", maxHeight)}>
    {children}
  </div>
);
