"use client";

import * as React from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle2, AlertTriangle } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function StripeSection() {
  const [stripeConnected, setStripeConnected] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleConnectStripe = React.useCallback(async () => {
    setLoading(true);
    try {
      // TODO: Replace with real Stripe connection logic
      await new Promise((resolve) => setTimeout(resolve, 1500));
      setStripeConnected(true);
      toast.success("Successfully connected to Stripe");
    } catch (error) {
      toast.error("Failed to connect to Stripe");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <Card className="border border-muted-foreground/10 rounded-2xl shadow-sm">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
          <span role="img" aria-label="card">
            💳
          </span>{" "}
          Payment Settings
        </CardTitle>
      </CardHeader>

      <CardContent className="p-6 space-y-6">
        {stripeConnected ? (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-emerald-600 font-medium">
              <CheckCircle2 className="w-5 h-5" />
              <span>Your Stripe account is connected</span>
            </div>
            <p className="text-sm text-muted-foreground">
              You can manage your payouts and account settings on your{" "}
              <Link
                href="https://dashboard.stripe.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:text-primary/90 underline underline-offset-4"
              >
                Stripe Dashboard
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 bg-yellow-100 text-yellow-900 rounded-lg border border-yellow-300">
              <AlertTriangle className="w-5 h-5 mt-1" />
              <div>
                <p className="font-medium">Stripe Not Connected</p>
                <p className="text-sm text-muted-foreground">
                  Connect your Stripe account to start receiving payouts.
                </p>
              </div>
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleConnectStripe}
                disabled={loading}
                className="w-fit"
              >
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Connect with Stripe
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
