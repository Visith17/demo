'use server';

import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import TeamDetailsPage from '@/components/shared/your-teams/TeamDetailsPage';
import { Skeleton } from '@/components/ui/skeleton';
import { fetcTeamById } from '@/app/api/team';

// Types
interface PageProps {
  params: {
    teamId: string;
  };
}

// Skeleton loader for team details
function TeamDetailsSkeleton() {
  return (
    <div className="space-y-6 p-4">
      {/* Header */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-[250px]" />
        <Skeleton className="h-4 w-[180px]" />
      </div>

      {/* Content */}
      <div className="space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-full max-w-[400px]" />
          <Skeleton className="h-4 w-full max-w-[300px]" />
          <Skeleton className="h-4 w-full max-w-[350px]" />
        </div>

        {/* Additional sections */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Skeleton className="h-[120px] rounded-lg" />
          <Skeleton className="h-[120px] rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// Metadata generation
export async function generateMetadata({ params }: PageProps) {
  try {
    const { teamId } = params;

    if (!teamId) {
      return {
        title: 'Invalid Team',
        description: 'The team ID provided is invalid.',
      };
    }

    const team = await fetcTeamById(teamId);
    if (!team) {
      return {
        title: 'Team Not Found',
        description: 'The requested team could not be found.',
      };
    }

    return {
      title: `Team #${team.data?.id || teamId} - Details`,
      description: `View details about the team ${team.data?.name ?? 'Unnamed'}`,
    };
  } catch (error) {
    console.error('[generateMetadata] Error:', error);
    return {
      title: 'Team Details',
      description: 'View detailed information about the selected team.',
    };
  }
}

// Team Details Page
export default async function TeamDetails({ params }: PageProps) {
  try {
    const { teamId } = params;

    if (!teamId) notFound();

    const team = await fetcTeamById(teamId);
    if (!team) notFound();

    return (
      <main className="mx-auto pb-20 md:pb-2 space-y-8">
        <Suspense fallback={<TeamDetailsSkeleton />}>
          <TeamDetailsPage team={team.data} />
        </Suspense>
      </main>
    );
  } catch (error) {
    console.error('[TeamDetailsPage] Error:', {
      params,
      error: error instanceof Error ? error.message : 'Unknown error',
    });

    throw new Error(
      error instanceof Error
        ? `Failed to load team details: ${error.message}`
        : 'Failed to load team details'
    );
  }
}
