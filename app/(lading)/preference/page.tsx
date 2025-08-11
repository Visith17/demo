import {
  AlertCircle,
  Notebook,
} from "lucide-react";
import { EditablePreferencesForm } from "./EditablePreferencesForm";
import { fetchPrefernce } from "@/app/api/preference";
import { fetchClubFilter } from "@/app/api/club";
import { fetchAllSportTypes } from "@/app/api/club";

export const dynamic = "force-dynamic";

export default async function PreferencesPage() {
  let preference = null;
  let error: Error | null = null;
  let sports = null;
  let clubs = null;
  try {
    // Fetch data in parallel
    [clubs, sports, preference] = await Promise.all([
      fetchClubFilter(),
      fetchAllSportTypes(),
      fetchPrefernce()
    ]);
    
  } catch (err) {
    console.error("Error loading preferences:", err);
    error = err as Error;
  }

  return (
    <div className="p-1 space-y-6 max-w-2xl mx-auto pb-20">
      {/* <h1 className="text-xl font-semibold">Preferences & Preferences</h1> */}

      {/* <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">
            🔒 Verification & Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <InfoItem
            icon={<BadgeCheck className="w-4 h-4 text-green-500" />}
            label="Identity Verified"
          />
          <InfoItem
            icon={<ShieldCheck className="w-4 h-4 text-blue-500" />}
            label="2FA Enabled"
          />
        </CardContent>
      </Card> */}

      {error ? (
        <ErrorState error={error} />
      ) : preference ? (
        <EditablePreferencesForm
          initialValues={preference}
          sportTypes={sports}
          clubs={clubs}
        />
      ) : (
        <EmptyState />
      )}
    </div>
  );
}

function ErrorState({ error }: { error: Error }) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-red-50 rounded-lg">
      <AlertCircle className="w-12 h-12 text-red-500 mb-4" />
      <h2 className="text-lg font-semibold text-red-700 mb-2">
        Unable to load Preference
      </h2>
      <p className="text-red-600 mb-4">{error.message}</p>
      <p className="text-sm text-red-500">
        Please try again later or contact support if the problem persists.
      </p>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-gray-50 rounded-lg">
      <Notebook className="w-12 h-12 text-gray-400 mb-4" />
      <h2 className="text-lg font-semibold text-gray-700 mb-2">
        No bookings yet
      </h2>
      <p className="text-gray-600">
        When you book a pitch, it will appear here
      </p>
    </div>
  );
}
