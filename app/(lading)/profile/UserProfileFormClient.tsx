"use client";

import * as React from "react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User } from "@/types";
import { updateUser } from "@/app/api/user";
import { SelectCity } from "@/components/shared/SelectCity";
import { PencilLine, Save, X } from "lucide-react"; // Make sure you're using lucide-react
import Image from "next/image";
import { cn } from "@/lib/utils"; // Assuming you have a `cn` helper
import { SingleSelect } from "@/components/shared/SingleSelect";

interface UserProfileFormClientProps {
  user: User;
}

export default function UserProfileForm({ user }: UserProfileFormClientProps) {
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);

  const [editMode, setEditMode] = React.useState(false);
  const [formData, setFormData] = React.useState({
    ...user,
    firstName: user.firstName || "",
    lastName: user.lastName || "",
    email: user.email || "",
    membership: user.membership || { name: "" },
    createdAt: user.createdAt || "",
    city: user.city || "",
    phone: user.phone || "",
  });

  const [phoneError, setPhoneError] = React.useState<string | null>(null);

  const fileInputRef = React.useRef<HTMLInputElement | null>(null);

  const handlePhotoClick = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setFormData((prev) => ({
      ...prev,
      userProfile: previewUrl, // preview only
    }));

    // Optional: store file in state if you want to send it later
    setSelectedFile(file);
  };

  const validatePhone = (phone: string) => {
    const digits = phone.replace(/\D/g, "");
    return digits.length === 9 || digits.length === 10;
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 10);
    const [part1, part2, part3] = [
      digits.slice(0, 3),
      digits.slice(3, 6),
      digits.slice(6, 10),
    ];
    return [part1, part2 && `-${part2}`, part3 && `-${part3}`]
      .filter(Boolean)
      .join("");
  };

  const handleChange = (field: string, value: string) => {
    if (field === "phone") {
      const formatted = formatPhone(value);
      setPhoneError(
        validatePhone(formatted) ? null : "Phone must be 9–10 digits."
      );
      setFormData((prev) => ({ ...prev, phone: formatted }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.phone || !validatePhone(formData.phone)) {
      toast.error("Phone number is invalid.");
      return;
    }

    try {
      await updateUser(formData);
      toast.success("Profile updated!");
      setEditMode(false);
    } catch (err) {
      toast.error("Update failed.");
    }
  };

  const handleCancel = () => {
    setFormData({
      ...user,
      firstName: user.firstName || "",
      lastName: user.lastName || "",
      email: user.email || "",
      membership: user.membership || { name: "" },
      createdAt: user.createdAt || "",
      city: user.city || "",
      phone: user.phone || "",
    });
    setPhoneError(null);
    setEditMode(false);
  };

  return (
    <div className="max-w-5xl mx-auto bg-white shadow-md overflow-hidden">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#1e3a8a] via-[#3b82f6] to-[#06b3d4] text-white pb-32 overflow-hidden">
        {/* Top Decorative Curve */}
        <svg
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1440 150"
          preserveAspectRatio="none"
        >
          <path
            fill="#ffffff"
            d="M0,100 C400,200 1100,0 1440,100 L1440,150 L0,150 Z"
          />
        </svg>

        {/* Background texture or blurred image (optional) */}
        <div className="absolute inset-0 bg-[url('/images/abstract-bg.png')] bg-cover opacity-10 blur-sm" />

        {/* Main Content */}
        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-16 flex flex-col items-center text-center">
          {/* Avatar */}
          {/* Avatar with change photo button */}
          <div className="relative w-fit">
            <img
              src={formData.userProfile || "https://github.com/shadcn.png"}
              alt="User Avatar"
              className="w-32 h-32 rounded-full border-4 border-white object-cover shadow-lg"
            />

            {/* Hidden file input */}
            <input
              type="file"
              accept="image/*"
              className="hidden"
              ref={fileInputRef}
              onChange={handlePhotoChange}
            />

            {editMode && (
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 text-xs rounded-full"
                onClick={handlePhotoClick}
              >
                Change Photo
              </Button>
            )}
          </div>

          {/* Info Card */}
          <div className="backdrop-blur-lg bg-white/10 border border-white/30 shadow-md mt-6 p-6 rounded-2xl w-full md:w-3/4">
            <h1 className="text-3xl font-bold">
              {formData.firstName} {formData.lastName}
            </h1>
            <p className="text-indigo-100 text-sm mt-1">{formData.email}</p>
            <span className="inline-block bg-white text-indigo-700 text-xs font-semibold px-3 py-1 mt-2 rounded-full uppercase tracking-wide shadow">
              {formData.membership?.name || "Free Member"}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="mt-6">
            {editMode ? (
              <div className="flex gap-3 justify-center">
                <Button onClick={handleSave} className="gap-1">
                  <Save className="w-4 h-4" />
                  Save
                </Button>
                <Button
                  variant="secondary"
                  onClick={handleCancel}
                  className="gap-1"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </Button>
              </div>
            ) : (
              <Button
                onClick={() => setEditMode(true)}
                variant="ghost"
                className="flex items-center gap-1 border border-white text-white hover:bg-white/10 px-5 py-2 rounded-full transition"
              >
                <PencilLine className="w-4 h-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Section: Personal Info */}
      <div className="bg-gray-50 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Personal Information
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Full Name */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Full Name
            </label>
            {editMode ? (
              <div className="flex gap-2">
                <Input
                  placeholder="First name"
                  value={formData.firstName}
                  onChange={(e) => handleChange("firstName", e.target.value)}
                />
                <Input
                  placeholder="Last name"
                  value={formData.lastName}
                  onChange={(e) => handleChange("lastName", e.target.value)}
                />
              </div>
            ) : (
              <p className="text-gray-900">
                {formData.firstName} {formData.lastName}
              </p>
            )}
          </div>

          {/* Email (read-only) */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Email</label>
            <p className="text-gray-900">{formData.email}</p>
          </div>

          {/* Phone */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">Phone</label>
            {editMode ? (
              <>
                <Input
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  placeholder="Phone number"
                />
                {phoneError && (
                  <p className="text-red-500 text-xs mt-1">{phoneError}</p>
                )}
              </>
            ) : (
              <p className="text-gray-900">{formData.phone || "-"}</p>
            )}
          </div>

          {/* City */}
          <div>
            <label className="text-sm text-gray-600 mb-1 block">City</label>
            {editMode ? (
              <SelectCity
                value={formData.city}
                onChange={(value) => handleChange("city", value || "")}
              />
            ) : (
              <p className="text-gray-900">{formData.city || "-"}</p>
            )}
          </div>
        </div>
      </div>

      {/* Section: Membership */}
      <div className="bg-gray-50 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          Membership Details
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Membership
            </label>
            <p className="text-indigo-700 font-medium">
              {formData.membership?.name || "Free Member"}
            </p>
          </div>

          <div>
            <label className="text-sm text-gray-600 mb-1 block">
              Member Since
            </label>
            <p className="text-gray-900">
              {formData.createdAt
                ? format(new Date(formData.createdAt), "MMMM d, yyyy")
                : "-"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
