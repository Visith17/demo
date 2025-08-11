"use client";

import React from "react";
import { motion } from "framer-motion";
import { ScrollArea } from "@/components/shared/ScrollArea";
import { format } from "date-fns"; // Add this import at the top
import { AddMemberModal } from "./AddMemberModal";
import { Trash2, PencilLine, UserPlusIcon } from "lucide-react";
import { removeMembers, approveMember } from "@/app/api/team";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { UpdateTeamModal } from "./UpdateTeamModal";
// import { PencilLine, Save, X } from "lucide-react"; // Make sure you're using lucide-react

const TeamDetailsPage = ({ team }: any) => {
  
  const [approvedMembers, setApprovedMembers] = React.useState(
    team.members.filter((m: any) => m.team_members.status === "approved")
  );
  
  const [pendingMembers, setPendingMembers] = React.useState(
    team.members.filter((m: any) => m.team_members.status === "pending")
  );
  team.upcomingMatches = [
    {
      id: 1,
      opponent: "Blue Rockets",
      date: "2025-08-02T17:00:00Z",
      location: "City Sports Arena",
    },
    {
      id: 2,
      opponent: "Red Dragons",
      date: "2025-08-10T19:30:00Z",
      location: "Downtown Indoor Stadium",
    },
  ];
  const getInitials = (name: string) =>
    name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .toUpperCase();

  const formatDate = (isoDate: string) =>
    new Date(isoDate).toLocaleDateString(undefined, {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  const handleApprove = async (userId: number) => {
    try {
      const payload = {
        teamId: team.id,
        userId,
      };
      // Replace with your real API call
      const res = await approveMember(payload);

      if (res.status === 200) {
        const updatedUser = pendingMembers.find((m: any) => m.id === userId);
        if (updatedUser) {
          updatedUser.team_members.approvalStatus = "approved";
          toast.success("Member approved");
          setPendingMembers((prev: any) =>
            prev.filter((member: any) => member.id !== userId)
          );
          setApprovedMembers((prev: any) => [...prev, updatedUser]);
        }
      } else {
        toast.error("Failed to approve member");
      }
    } catch (error) {
      console.error("Error approving member", error);
      toast.error("Unexpected error occurred");
    }
  };

  const handleRemove = async (userId: number) => {
    const confirmed = confirm("Are you sure you want to remove this member?");
    if (!confirmed) return;

    const payload = { teamId: team.id, userId };

    try {
      const res = await removeMembers(payload);
      if (res.status === 200) {
        toast.success(res.message);
        setApprovedMembers((prev: any) =>
          prev.filter((m: any) => m.id !== userId)
        );
      }
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Hero Header */}
      {/* Edit Info Button Top Right */}

      <div className="relative bg-gradient-to-r from-indigo-700 to-purple-700 text-white rounded-b-3xl shadow-lg pb-24 px-6 pt-10">
        <div className="absolute top-6 right-6">
          <UpdateTeamModal
            team={team}
            onSuccess={(updatedTeam) => {
              // optionally update state if needed
            }}
            triggerButton={
              <Button
                variant="ghost"
                className="flex items-center gap-1 border border-white text-white hover:bg-white/10 px-5 py-2 rounded-full transition"
              >
                <PencilLine className="w-4 h-4" />
                Edit Info
              </Button>
            }
          />
        </div>
        <div className="flex flex-col md:flex-row gap-6 md:items-center">
          {/* Logo */}
          <div className="flex-shrink-0">
            {team.logoUrl ? (
              <img
                src={team.logoUrl}
                alt={team.name}
                className="w-32 h-32 rounded-full border-4 border-white shadow-md object-cover"
              />
            ) : (
              <div className="w-32 h-32 rounded-full bg-white text-indigo-700 flex items-center justify-center text-3xl font-extrabold border-4 border-white shadow-md">
                {getInitials(team.name)}
              </div>
            )}
          </div>

          {/* Team Info */}
          <div className="flex-1">
            <h1 className="text-4xl font-bold">{team.name}</h1>
            <p className="text-sm text-indigo-100 mt-1">{team.description}</p>
            <span className="inline-block mt-2 bg-white text-indigo-700 font-semibold px-4 py-1 rounded-full text-xs uppercase tracking-wide">
              {team.sport_type.name}
            </span>{" "}
            <span className="inline-block mt-2 bg-white text-indigo-700 font-semibold px-4 py-1 rounded-full text-xs uppercase tracking-wide">
              {team.level}
            </span>
            <p className="text-sm text-indigo-100 mt-2">
              🗓️ Founded {formatDate(team.createdAt)}
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-0 left-0 right-0 px-6">
          <div className="flex justify-around bg-white text-gray-800 rounded-xl shadow-lg py-4 translate-y-1/2">
            {[
              // ["Matches", team.stats.matches],
              // ["Wins", team.stats.wins],
              // ["Goals", team.stats.goals],
              // ["Matches", team.stats.matches],
              ["Wins", 25],
              ["Goals", 65],
              ["Matches", 30],
            ].map(([label, value]) => (
              <div key={label} className="text-center">
                <div className="text-2xl font-bold">{value}</div>
                <div className="text-xs uppercase tracking-wider text-gray-500">
                  {label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="mt-24 px-6 space-y-12">
        {/* Roster */}
        <section className="space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              👥 Team Roster
            </h2>
            <AddMemberModal
              teamId={team.id}
              onSuccess={(newMember) => {
                setApprovedMembers((prev: any) => [...prev, newMember]);
              }}
              triggerButton={
                <button className="inline-flex items-center border border-indigo-600 text-indigo-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-indigo-50 transition focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Add Member
                </button>
              }
            />
          </div>

          {pendingMembers.length > 0 && (
            <section>
              {/* <h2 className="text-xl font-semibold text-gray-800 mb-4">
                ⏳ Pending Requests
              </h2> */}
              <ScrollArea maxHeight="max-h-[30vh]">
                <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-1">
                  {pendingMembers.map((player: any) => (
                    <motion.div
                      key={player.id}
                      whileHover={{ scale: 1.02 }}
                      className="relative bg-yellow-50 border border-yellow-200 rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all group"
                    >
                      {player.userProfile ? (
                        <img
                          src={player.userProfile}
                          alt={player.firstName}
                          className="w-14 h-14 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-14 h-14 rounded-full bg-yellow-100 text-yellow-700 flex items-center justify-center text-lg font-bold">
                          {getInitials(
                            player.firstName + " " + player.lastName
                          )}
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">
                          {player.firstName + " " + player.lastName}
                        </div>
                        <div className="text-sm text-yellow-600">
                          Pending Approval
                        </div>
                      </div>

                      <button
                        onClick={() => handleApprove(player.id)}
                        className="border border-green-600 text-green-600 px-4 py-1.5 rounded-md text-sm font-medium hover:bg-green-50 transition focus:outline-none focus:ring-2 focus:ring-green-400"
                      >
                        Accept
                      </button>
                    </motion.div>
                  ))}
                </div>
              </ScrollArea>
            </section>
          )}
          
          <ScrollArea maxHeight="max-h-[30vh]">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-1">
              {/* Owner (non-removable) */}
              <motion.div
                key={team.owner.id}
                whileHover={{ scale: 1.02 }}
                className="relative bg-white-50 border border-white-200 rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all group"
              >
                {team.owner.userProfile ? (
                  <img
                    src={team.owner.userProfile}
                    alt={team.owner.firstName}
                    className="w-14 h-14 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                    {getInitials(
                      team.owner.firstName + " " + team.owner.lastName
                    )}
                  </div>
                )}
                <div>
                  <div className="font-semibold text-gray-900">
                    {team.owner.firstName + " " + team.owner.lastName}
                  </div>
                  <div className="text-sm text-indigo-600">Captain</div>
                </div>
              </motion.div>

              {/* Members */}
              {approvedMembers.map((player: any) => (
                <motion.div
                  key={player.id}
                  whileHover={{ scale: 1.02 }}
                  className="relative bg-white-50 border border-white-200 rounded-xl shadow-sm p-4 flex items-center gap-4 transition-all group"
                >
                  <button
                    onClick={() => handleRemove(player.id)}
                    className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove Member"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>

                  {player.userProfile ? (
                    <img
                      src={player.userProfile}
                      alt={player.firstName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg font-bold">
                      {getInitials(player.firstName + " " + player.lastName)}
                    </div>
                  )}

                  <div>
                    <div className="font-semibold text-gray-900">
                      {player.firstName + " " + player.lastName}
                    </div>
                    <div className="text-sm text-indigo-600">
                      {player.team_members.position}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </ScrollArea>
        </section>

        {/* Matches */}
        <section>
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            📅 Upcoming Matches
          </h2>
          <div className="space-y-4">
            <ScrollArea maxHeight="max-h-[30vh]">
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 gap-1">
              {team.upcomingMatches.map((match: any) => (
                <motion.div
                  key={match.id}
                  whileHover={{ scale: 1.01 }}
                  className="p-4 bg-white-50 border border-white-200 rounded-lg shadow-sm"
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-indigo-700 font-semibold">
                        vs {match.opponent}
                      </p>
                      <p className="text-sm text-gray-600">{match.location}</p>
                    </div>
                    <time className="text-sm text-gray-500">
                      {formatDate(match.date)}
                    </time>
                  </div>
                </motion.div>
              ))}
              </div>
            </ScrollArea>
          </div>
        </section>
      </div>
    </div>
  );
};

export default TeamDetailsPage;
