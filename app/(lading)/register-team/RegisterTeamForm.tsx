"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Loader2, ImageIcon } from "lucide-react";
import { registerTeam } from "@/app/api/team";
import { SingleSelect } from "@/components/shared/SingleSelect";
import { useRouter } from 'next/navigation';
import { APP_ROUTE } from "@/constants/route";
import { toast } from "sonner";

const CITY_OPTIONS = [
  "Phnom Penh",
  "Siem Reap",
  "Battambang",
  "Sihanoukville",
  "Kampot",
  "Takeo",
  "Kampong Cham",
].map((c: string) => ({ label: c, value: c }));

export default function RegisterTeamForm({ sports }: any) {
  const SPORT_OPTIONS = sports.map((s: any) => ({
    label: s.name,
    value: s.id,
  }));

  const [form, setForm] = useState({
    name: "",
    sportTypeId: "",
    logoUrl: "",
    description: "",
    city: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoPreview, setShowLogoPreview] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (name === "logoUrl") {
      setShowLogoPreview(value.startsWith("http"));
    }
  };

  const handleSelectChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      
      const res = await registerTeam(form);
      
      if(res.status===201) {
        toast.success(res.message)
        router.push(`${APP_ROUTE.YOUR_TEAM}`);
        return 0;
      }  
      toast.error(res.message)
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md overflow-hidden">
      <Card className="border border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-gray-800">
            🏆 Register a New Team
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Fill in your team details to join the competition.
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Side */}
              <div className="space-y-6">
                {/* Team Name */}
                <div>
                  <Label htmlFor="name" className="block mb-1 font-medium">
                    Team Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    placeholder="e.g. Thunder Hawks"
                    value={form.name}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </div>

                {/* Sport Type */}
                <div>
                  <Label
                    htmlFor="sportTypeId"
                    className="block mb-1 font-medium"
                  >
                    Sport Type
                  </Label>

                  <SingleSelect
                    options={SPORT_OPTIONS}
                    value={form.sportTypeId}
                    onChange={(v) =>
                      handleSelectChange("sportTypeId", v as string)
                    }
                    placeholder="Select sport..."
                    searchPlaceholder="Search sport..."
                    noResultsMessage="No sport found."
                  />
                </div>

                {/* City */}
                <div>
                  <Label htmlFor="city" className="block mb-1 font-medium">
                    City
                  </Label>
                  <SingleSelect
                    options={CITY_OPTIONS}
                    value={form.city}
                    onChange={(v) => handleSelectChange("city", v as string)}
                    placeholder="Select city..."
                    searchPlaceholder="Search city..."
                    noResultsMessage="No city found."
                  />
                </div>

                {/* Description */}
                <div>
                  <Label
                    htmlFor="description"
                    className="block mb-1 font-medium"
                  >
                    Team Description
                  </Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Share your team’s goals, achievements, or story..."
                    value={form.description}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </div>
              </div>

              {/* Right Side */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="logoUrl" className="block mb-1 font-medium">
                    Logo URL
                  </Label>
                  <Input
                    id="logoUrl"
                    name="logoUrl"
                    type="url"
                    placeholder="https://example.com/logo.png"
                    value={form.logoUrl}
                    onChange={handleChange}
                    required
                    disabled={isSubmitting}
                    className="rounded-xl"
                  />
                </div>
                <div className="mt-4 border border-dashed rounded-xl p-4 bg-muted/40 text-center">
                  {showLogoPreview ? (
                    <img
                      src={form.logoUrl}
                      alt="Team Logo Preview"
                      className="mx-auto h-32 rounded-md shadow-sm border bg-white object-contain"
                      onError={() => setShowLogoPreview(false)}
                    />
                  ) : (
                    <div className="text-sm text-muted-foreground flex flex-col items-center justify-center">
                      <ImageIcon className="h-8 w-8 mb-1" />
                      Logo preview will appear here
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full md:w-1/3 mx-auto block rounded-full h-12 bg-blue-100 text-blue-700 border border-blue-300 hover:bg-blue-200"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Registering...
                </>
              ) : (
                <>Register Team</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
