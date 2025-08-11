// app/profile/UserProfilePageServer.tsx
import { User } from "@/types";
import StripeSection from "./StripeSectionClient";
import UserProfileForm from "./UserProfileFormClient";

import { fetchProfile } from "@/app/api/user";

export const dynamic = "force-dynamic";

export default async function UserProfilePageServer() {
  const user: User = await fetchProfile();
  
  return (
    <main className="max-w-3xl mx-auto pb-20 md:pb-2 space-y-8">
      {/* Editable user profile form (client component) */}
      <UserProfileForm user={user} />
      {/* Stripe connection section (client component) */}
      {/* <StripeSection /> */}
    </main>
  );
}
