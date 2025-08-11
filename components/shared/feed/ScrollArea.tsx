// components/sport-feed/ScrollArea.tsx
import React from "react";

export const ScrollArea = ({ children }: { children: React.ReactNode }) => (
  <div className="overflow-y-auto max-h-[67vh] space-y-4 pr-1 scrollbar-hide">
    {children}
  </div>
);
