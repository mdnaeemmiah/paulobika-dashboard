"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { FiArrowLeft, FiChevronRight, FiSettings, FiLogOut } from "react-icons/fi";
import { MdOutlinePets } from "react-icons/md";
import { TbCurrencyDollar } from "react-icons/tb";
import { LuShieldCheck, LuLifeBuoy } from "react-icons/lu";
import { PiDotsNineBold } from "react-icons/pi";
import { RiAlertLine } from "react-icons/ri";
import ProfileImg1 from "@/src/app/assets/streamline-plump_dog-1.svg";
import Link from "next/link";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";

type UserProfile = {
  name: string;
  email: string;
  image: string;
};

type DogInfoResponse = {
  dog_name?: string;
  // breed?: string | number;
  age?: string | number;
  weight?: string | number;
  lifestage?: string;
  activity_level?: string;
};

const resolveImageUrl = (value: unknown): string => {
  if (typeof value === "string" && value.trim()) {
    const trimmed = value.trim();
    if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
      return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
    }

    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    if (baseUrl) {
      try {
        return new URL(trimmed, baseUrl).toString();
      } catch {
        return trimmed;
      }
    }

    return trimmed;
  }

  return "";
};

const pickDogInfo = (payload: unknown): DogInfoResponse | null => {
  if (payload && typeof payload === "object" && !Array.isArray(payload)) {
    const maybeResults = payload as { results?: unknown };
    if (Array.isArray(maybeResults.results) && maybeResults.results.length > 0) {
      const first = maybeResults.results[0];
      return first && typeof first === "object" ? (first as DogInfoResponse) : null;
    }
    return payload as DogInfoResponse;
  }

  if (Array.isArray(payload) && payload.length > 0) {
    const first = payload[0];
    return first && typeof first === "object" ? (first as DogInfoResponse) : null;
  }

  return null;
};

const formatLabelValue = (value: unknown, fallback = "-"): string => {
  if (value === null || value === undefined) {
    return fallback;
  }
  const text = String(value).trim();
  return text || fallback;
};

const formatWeight = (value: unknown): string => {
  if (value === null || value === undefined || String(value).trim() === "") {
    return "-";
  }
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return `${String(value)} kg`;
  }
  const display = Number.isInteger(numeric) ? String(numeric) : numeric.toFixed(2);
  return `${display} kg`;
};

const toTitleCase = (value: unknown): string => {
  const text = String(value ?? "").trim().toLowerCase();
  if (!text) {
    return "-";
  }
  return text.charAt(0).toUpperCase() + text.slice(1);
};

const preferences = [
  { label: "Budget Preference", sub: "Mid-Range",href: "/dogInfo/activity", icon: <TbCurrencyDollar className="text-[20px] text-[#B66A3A]" /> },
  { label: "Food Types", sub: "Dry, Wet",href: "/dogInfo/preferance", icon: <PiDotsNineBold className="text-[20px] text-[#B66A3A]" /> },
  { label: "Allergies", sub: "Chicken, Grains",href: "/dogInfo/allergies", icon: <RiAlertLine className="text-[20px] text-[#B66A3A]" /> },
  { label: "Calculated Food", sub: "Chicken, Grains",href: "/profile/calculate", icon: <RiAlertLine className="text-[20px] text-[#B66A3A]" /> },
  { label: "Security", sub: "Change Pass & Delete Account", href: "/profile/security", icon: <LuShieldCheck className="text-[20px] text-[#B66A3A]" /> },
  { label: "Help & Support", sub: "Get help and FAQ's", href: "/help&support", icon: <LuLifeBuoy className="text-[20px] text-[#B66A3A]" /> },
];

export default function Profile() {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile>({
    name: "User",
    email: "",
    image: "",
  });
  const [dogInfo, setDogInfo] = useState([
    { label: "Name", value: "-" },
    // { label: "Breed", value: "-" },
    { label: "Age", value: "-" },
    { label: "Weight", value: "-" },
    { label: "Life Stage", value: "-" },
    { label: "Activity", value: "-" },
  ]);

  const handleLogout = () => {
    localStorage.removeItem("is_admin");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  useEffect(() => {
    let isMounted = true;
    const fetchUserProfile = async () => {
      try {
        const response = await baseApi.get(ENDPOINTS.getUser);
        const data = response?.data;
        if (!isMounted) return;

        setUser({
          name: String(data?.first_name ?? data?.name ?? data?.username ?? "User").trim(),
          email: String(data?.email ?? "").trim(),
          image: resolveImageUrl(data?.image ?? data?.photo ?? data?.profile_image),
        });
      } catch (err) {
        console.error("Failed to load user profile", err);
      }
    };

    void fetchUserProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    const fetchDogInfo = async () => {
      try {
        const response = await baseApi.get(ENDPOINTS.dogInfo);
        const data = pickDogInfo(response.data);
        if (!isMounted || !data) {
          return;
        }

        setDogInfo([
          { label: "Name", value: formatLabelValue(data.dog_name) },
          // { label: "Breed", value: formatLabelValue(data.breed) },
          {
            label: "Age",
            value:
              formatLabelValue(data.age) === "-"
                ? "-"
                : `${formatLabelValue(data.age)} years`,
          },
          { label: "Weight", value: formatWeight(data.weight) },
          { label: "Life Stage", value: toTitleCase(data.lifestage) },
          { label: "Activity", value: toTitleCase(data.activity_level) },
        ]);
      } catch (error) {
        console.error("Failed to load dog info", error);
      }
    };

    void fetchDogInfo();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div
        className="px-4 pt-5 pb-8 rounded-b-3xl bg-[#ba5f23]"
      >
        <div className="flex items-center justify-between mb-5">
          <button
            onClick={() => router.back()}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20"
          >
            <FiArrowLeft className="text-white text-[18px]" />
          </button>
          <h1 className="text-[16px] font-semibold text-white">Profile</h1>
          <button className="w-8 h-8 flex items-center justify-center rounded-full bg-white/20">
            <FiSettings className="text-white text-[17px]" />
          </button>
        </div>

        {/* User Info */}
        <div className="flex items-center gap-4">
          <div className="w-15 h-15 rounded-full bg-white/30 overflow-hidden flex items-center justify-center border-2 border-white/50">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={user.image}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="h-full w-full rounded-full bg-white/20" aria-hidden="true" />
            )}
          </div>
          <div>
            <h2 className="text-[17px] font-bold text-white">{user.name}</h2>
            <p className="text-[12px] text-white/80 mt-0.5">{user.email || "email@example.com"}</p>
          </div>
        </div>
      </div>

      <div className="px-4 mt-2 pb-6 ">
        {/* Edit Profile */}
        <Link href='/profile/editProfile'>
          <div className="bg-white rounded-2xl hover:scale-105 duration-300 px-4 py-4 flex items-center justify-between mb-4 mt-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
                <MdOutlinePets className="text-[#B66A3A] text-[17px]" />
              </div>
              <div>
                <p className="text-[13px] font-semibold text-gray-900">Edit Profile</p>
                <p className="text-[12px] text-gray-400">Update your personal information</p>
              </div>
            </div>
            <FiChevronRight className="text-gray-400 text-[16px]" />
          </div>
        </Link>

        {/* DOG INFO */}

        <div className="bg-white rounded-2xl px-4 py-1 mb-4 shadow-sm">
          <p className="text-[12px] mt-2 font-bold text-gray-800 tracking-widest mb-2 px-1">
            <Image
              src={ProfileImg1}
              alt="Dog Icon"
              width={24}
              height={14}
              className="inline-block mr-2"
            ></Image>
            DOG INFO</p>
          {dogInfo.map((item, idx) => (
            <div
              key={item.label}
              className={`flex items-center justify-between py-3 ${idx !== dogInfo.length - 1 ? "border-b border-gray-100" : ""}`}
            >
              <span className="text-[13px] text-gray-400">{item.label}</span>
              <span className="text-[13px] font-medium text-gray-800">{item.value}</span>
            </div>
          ))}
        </div>

        {/* PREFERENCES */}

        <div className="bg-white rounded-2xl px-4 py-1 mb-4 shadow-sm">
          <p className="text-[13px] mt-2 font-bold text-gray-800 tracking-widest mb-2 px-1">⚙️ PREFERENCES</p>
          <div className="flex flex-col gap-1">
            {preferences.map((item, idx) => (
              <button
                key={item.label}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center gap-3 py-3 px-2 rounded-xl transition-colors duration-150 hover:bg-orange-50 active:bg-orange-100 ${idx !== preferences.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center shrink-0">
                  {item.icon}
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[13px] font-semibold text-gray-900">{item.label}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{item.sub}</p>
                </div>
                <FiChevronRight className="text-gray-400 text-[15px] shrink-0" />
              </button>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="bg-white  hover:scale-105 duration-300 hover:bg-red-50 rounded-2xl px-4 py-1 shadow-sm">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full cursor-pointer  flex items-center gap-3 py-3"
          >
            <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center shrink-0">
              <FiLogOut className="text-red-500 text-[17px]" />
            </div>
            <div className="flex-1 text-left">
              <p className="text-[13px] font-semibold text-red-500">Logout</p>
              <p className="text-[11px] text-gray-400 mt-0.5">Sign out of your account</p>
            </div>
            <FiChevronRight className="text-gray-400 text-[15px] shrink-0" />
          </button>
        </div>
      </div>
    </div>
  );
}

