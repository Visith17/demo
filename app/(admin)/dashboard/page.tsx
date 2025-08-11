// app/club/page.tsx or pages/club.tsx (depending on your routing setup)

import React from "react";
import { ClubCard } from "@/components/shared/club/ClubCard"; // wherever you saved the ClubCard
// Optional: Replace with actual club data or fetch it
const mockClubs = [
  {
    id: 1,
    name: "Victory Sports Club",
    city: "Phnom Penh",
    email: "info@victoryclub.com",
    owner: {phone: "+855 12 345 678"},
    pitch_details: [],
    sport_types: [],
    rating: 4.6,
    coverImage: "/club-cover.jpg",
    locationUrl: ''
  },
  {
    id: 2,
    name: "Eagle Arena",
    city: "Siem Reap",
    email: "contact@eaglearena.com",
    owner: {phone: "+855 98 765 432"},
    pitch_details: [],
    sport_types: [],
    rating: 4.8,
    coverImage: "/club-cover2.jpg",
    locationUrl: ''
  },
];
export const dynamic = "force-dynamic";
export default function ClubListPage() {
  return (
    <main className="max-w-5xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold mb-4">🏟️ All Clubs</h1>
      {mockClubs.map((club) => (
        <ClubCard club={club} index={club.id} key={club.id}/>
      ))}
    </main>
  );
}
