// app/login/GoogleLoginWrapper.tsx
"use client";

import { GoogleOAuthProvider, GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const ENV = {
  GOOGLE_CLIENT_ID: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  DEV_ID: "1234567890-example-development-client-id.apps.googleusercontent.com",
};

export default function GoogleLoginWrapper({
  onSuccess,
  onError,
}: {
  onSuccess: (response: CredentialResponse) => void;
  onError: () => void;
}) {
  const clientId = ENV.GOOGLE_CLIENT_ID || ENV.DEV_ID;

  if (!clientId) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>Google login is not configured. Try another method.</AlertDescription>
      </Alert>
    );
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <GoogleLogin onSuccess={onSuccess} onError={onError} useOneTap theme="outline" />
    </GoogleOAuthProvider>
  );
}
