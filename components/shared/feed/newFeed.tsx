"use client";

import React from "react";
import { Club } from "@/types";
import ClubsTab from "./ClubsTab";
import { TeamsTab } from "./TeamsTab";
import { MatchesTab } from "./MatchesTab";

interface TabsProps {
  defaultValue: string;
  children: React.ReactNode;
}

interface ClubListProps {
  clubList: {
    items: Club[];
    total: number;
    error?: string;
    filter: Function;
  };
}

const isComponentWithDisplayName = (
  type: any
): type is { displayName: string } => {
  return typeof type === "function" || typeof type === "object";
};

const Tabs = ({ defaultValue, children }: TabsProps) => {
  const [value, setValue] = React.useState(defaultValue);
  const tabs = React.Children.toArray(children).filter(React.isValidElement);

  const list = tabs.find(
    (tab) =>
      isComponentWithDisplayName(tab.type) &&
      tab.type.displayName === "TabsList"
  ) as React.ReactElement | undefined;

  const contents = tabs.filter(
    (tab) =>
      isComponentWithDisplayName(tab.type) &&
      tab.type.displayName === "TabsContent"
  ) as React.ReactElement[];

  return (
    <div className="space-y-4">
      {list && React.cloneElement(list, { value, setValue })}
      {contents.map((tab) =>
        React.cloneElement(tab, { activeValue: value, key: tab.props.value })
      )}
    </div>
  );
};

const TabsList = ({ children, value, setValue }: any) => (
  <div className="flex gap-2 justify-center sticky top-0 z-10 bg-white py-2 border-b">
    {React.Children.map(children, (child) =>
      React.cloneElement(child, {
        isActive: value === child.props.value,
        onClick: () => setValue(child.props.value),
      })
    )}
  </div>
);
TabsList.displayName = "TabsList";

const TabsTrigger = ({ value, isActive, onClick, children }: any) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
      isActive
        ? "bg-blue-400 text-white shadow"
        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
    }`}
  >
    {children}
  </button>
);
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = ({ value, activeValue, children }: any) => {
  return value === activeValue ? <div>{children}</div> : null;
};
TabsContent.displayName = "TabsContent";

const SectionHeader = ({ icon, title }: { icon: string; title: string }) => (
  <div className="flex items-center gap-2">
    <span className="text-xl">{icon}</span>
    <h2 className="text-lg font-semibold">{title}</h2>
  </div>
);

export default function InteractiveSportFeed({ clubList, teamList, matchList }: any) {

  return (
    <div className="p-2 space-y-1 max-w-3xl mx-auto">

      <Tabs defaultValue="matches">
        <TabsList>
          <TabsTrigger value="clubs">🏟️ Clubs</TabsTrigger>
          <TabsTrigger value="teams">👥 Teams</TabsTrigger>
          <TabsTrigger value="matches">🎯 Matches</TabsTrigger>
        </TabsList>

        {/* Clubs */}
        <TabsContent value="clubs">
          <SectionHeader icon="🏟️" title="Sport Clubs" />
          <ClubsTab clubs={clubList.items} />
        </TabsContent>

        {/* Teams */}
        <TabsContent value="teams">
          <SectionHeader icon="👥" title="Sport Teams" />
          <TeamsTab teams={teamList} />
        </TabsContent>

        {/* Matches */}
        <TabsContent value="matches">
          <SectionHeader icon="🎯" title="Open Matches" />
          <MatchesTab matches={matchList} accepted={[true]} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
