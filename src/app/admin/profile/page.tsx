"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiEdit2 } from "react-icons/fi";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";

type ProfileResponse = {
  name?: string;
  email?: string;
  image?: string;
  profile_image?: string;
  profileImage?: string;
  photo?: string;
  avatar?: string;
  first_name?: string;
  username?: string;
  user?: {
    name?: string;
    email?: string;
    image?: string;
    avatar?: string;
  };
};

const resolveImageUrl = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    const absolute = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
    try {
      const u = new URL(absolute);
      // rewrite known IP host to canonical API host
      if (u.hostname === '34.234.152.253') {
        u.hostname = 'api.everidog.com';
        return u.toString();
      }
    } catch {
      // ignore
    }
    return absolute;
  }

  // If the path looks like a media path, force the known API domain so TLS and host match
  if (trimmed.startsWith("/media") || trimmed.startsWith("media/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || ENDPOINTS?.BASEURL || baseApi?.defaults?.baseURL || "https://api.everidog.com";
    try {
      return new URL(trimmed, apiHost).toString();
    } catch {
      return apiHost.replace(/\/$/, "") + (trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
    }
  }

  const baseUrl = baseApi?.defaults?.baseURL || ENDPOINTS?.BASEURL || process.env.NEXT_PUBLIC_API_URL || "";
  if (!baseUrl) return trimmed;

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return trimmed;
  }
};

export default function ProfilePage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const avatarInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      setIsLoading(true);

      try {
        const response = await baseApi.get(ENDPOINTS.getUser);
        const data = response.data as ProfileResponse;

        if (!isMounted) {
          return;
        }

        const resolvedName = String(
          data?.name ?? data?.first_name ?? data?.username ?? data?.user?.name ?? "",
        ).trim();
        const resolvedEmail = String(data?.email ?? data?.user?.email ?? "").trim();
        const resolvedImage = resolveImageUrl(
          data?.image ?? data?.profile_image ?? data?.profileImage ?? data?.photo ?? data?.avatar ?? data?.user?.image ?? data?.user?.avatar,
        );

        setName(resolvedName);
        setEmail(resolvedEmail);
        setAvatarPreview(resolvedImage || null);
      } catch (error) {
        console.error("Failed to load profile", error);
        toast.error("Failed to load profile");
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (avatarPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
  }, [avatarPreview]);

  const handleEnableEdit = () => {
    setIsEditing(true);
  };

  const handleUpdate = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const submitProfile = async () => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        toast.error("Name is required");
        return;
      }

      setIsSaving(true);

      try {
        const formData = new FormData();
        formData.append("name", trimmedName);

        if (selectedImageFile) {
          formData.append("image", selectedImageFile);
        }

        const response = await baseApi.patch(ENDPOINTS.updateProfile, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        const data = response?.data as ProfileResponse;
        const updatedName = String(data?.name ?? trimmedName).trim();
        const updatedEmail = String(data?.email ?? email).trim();
        const updatedImage = resolveImageUrl(
          data?.image ?? data?.profile_image ?? data?.profileImage ?? data?.photo ?? data?.avatar ?? data?.user?.image ?? data?.user?.avatar,
        );

        setName(updatedName);
        setEmail(updatedEmail);
        setAvatarPreview(updatedImage || avatarPreview);
        setSelectedImageFile(null);
        setIsEditing(false);
        toast.success("Profile updated successfully");
      } catch (error) {
        console.error("Failed to update profile", error);
        toast.error("Failed to update profile");
      } finally {
        setIsSaving(false);
      }
    };

    void submitProfile();
  };

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    const previewUrl = URL.createObjectURL(selectedFile);
    setAvatarPreview(previewUrl);
    setSelectedImageFile(selectedFile);
    setIsEditing(true);
  };

  return (
    <div className="min-h-screen bg-[#eef1f5] px-4 py-5 sm:px-6 sm:py-6">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6] shadow-sm">
        <div className="bg-[#b76424] px-4 py-3">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px]">Profile</h2>
        </div>

        <div className="px-4 py-5 sm:px-6 sm:py-6">
          <div className="mx-auto max-w-130 rounded-2xl border border-[#d8dde4] bg-[#f7f7f8] px-4 py-6 sm:px-6">
            <div className="flex flex-col items-center">
              <div className="relative h-20 w-20">
                {avatarPreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarPreview} alt="Profile preview" className="h-full w-full rounded-full object-cover" />
                ) : (
                  <div className="h-full w-full rounded-full border border-[#cfd5dc] bg-[#eff1f4]" aria-hidden="true" />
                )}

                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="absolute right-0 bottom-0 flex h-6 w-6 items-center justify-center rounded-full border border-[#cfd5dc] bg-white text-[#7e8794]"
                  aria-label="Edit avatar"
                >
                  <FiEdit2 size={12} />
                </button>

                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleAvatarChange}
                  className="hidden"
                />
              </div>

              <h3 className="mt-3 text-[36px] font-semibold text-[#232a33] sm:text-[42px]">{name}</h3>

              <button
                type="button"
                onClick={handleEnableEdit}
                disabled={isLoading}
                className="mt-1 text-[16px] cursor-pointer font-semibold text-[#b76424] underline decoration-1 underline-offset-2 disabled:cursor-not-allowed disabled:text-[#c58a5f]"
              >
                Edit Profile
              </button>
            </div>

            <form onSubmit={handleUpdate} className="mx-auto mt-6 max-w-95 space-y-3.5">
              <div className="space-y-1">
                <label htmlFor="name" className="text-[20px] font-semibold text-[#232a33]">
                  Name
                </label>
                <input
                  id="name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  disabled={!isEditing}
                  className="h-11 w-full rounded border border-[#cfd5dc] bg-white px-3 text-[14px] text-[#364152] outline-none transition-colors disabled:cursor-not-allowed disabled:bg-[#eff1f4] disabled:text-[#8a93a0]"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="email" className="text-[20px] font-semibold text-[#232a33]">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  readOnly
                  className="h-11 w-full rounded border border-[#cfd5dc] bg-[#eff1f4] px-3 text-[14px] text-[#8a93a0] outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={!isEditing || isSaving}
                className="mt-1 inline-flex h-11 w-full items-center justify-center rounded-md bg-[#b76424] px-4 text-[20px] font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-[#d6b49a]"
              >
                {isSaving ? "Updating..." : "Update Profile"}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
