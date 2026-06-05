"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft } from "react-icons/fi";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import axios from "axios";

type UserStatus = "Active" | "Inactive" | "Suspended" | "Blocked";

type ApiUserResponse = {
  id: number;
  name: string;
  email: string;
  is_active: boolean;
  created_at: string;
};

type UserRow = {
  id: number;
  userName: string;
  email: string;
  dogName?: string;
  signupDate: string;
  status: UserStatus;
  phone?: string;
  breed?: string;
  age?: string;
  weight?: string;
  allergies: string[];
  foodPreferences: string[];
};

const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
};

const transformApiUserToUserRow = (apiUser: ApiUserResponse): UserRow => {
  return {
    id: apiUser.id,
    userName: apiUser.name,
    email: apiUser.email,
    dogName: undefined,
    signupDate: formatDate(apiUser.created_at),
    status: apiUser.is_active ? "Active" : "Inactive",
    phone: undefined,
    breed: undefined,
    age: undefined,
    weight: undefined,
    allergies: [],
    foodPreferences: [],
  };
};

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(!params.id);
  const [fetchError, setFetchError] = useState(params.id ? "" : "User ID not found.");

  useEffect(() => {
    if (!params.id) {
      return;
    }

    const fetchUserDetails = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const response = await baseApi.get(ENDPOINTS.userDetails(params.id));
        if (response.data) {
          const transformedUser = transformApiUserToUserRow(response.data);
          setUser(transformedUser);
        } else {
          setFetchError("User not found.");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          if (err.response?.status === 404) {
            setFetchError("User not found.");
          } else {
            setFetchError(err.response?.data?.message || "Failed to load user details");
          }
        } else {
          setFetchError("Failed to load user details");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserDetails();
  }, [params.id]);

  if (isLoading) {
    return (
      <div className="min-h-screen">
        <div className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-6">
          <p className="text-[#4b5563]">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user || fetchError) {
    return (
      <div className="min-h-screen">
        <div className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-6">
          <Link href="/admin/userManagement" className="text-[#b76424]">
            Back to User Management
          </Link>
          <p className="mt-3 text-[#4b5563]">{fetchError || "User not found."}</p>
        </div>
      </div>
    );
  }

  const statusClass =
    user.status === "Active"
      ? "bg-[#e6f6ec] text-[#2f9d61] border border-[#bde8cd]"
      : user.status === "Inactive"
        ? "bg-[#f1f3f6] text-[#7a8492] border border-[#e0e5ea]"
        : user.status === "Suspended"
          ? "bg-[#fff4dd] text-[#bf7d08] border border-[#f5dfac]"
          : "bg-[#fde8e8] text-[#cf3f3f] border border-[#f4caca]";

  return (
    <div className="min-h-screen">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href="/admin/userManagement" className="text-[#1f2937]">
            <FiArrowLeft size={20} />
          </Link>
          <h1 className="text-[22px] font-semibold text-[#232a33] sm:text-[28px] lg:text-[40px]">
            {user.userName}
          </h1>
          <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium sm:text-sm ${statusClass}`}>
            {user.status}
          </span>
        </div>

        {/* <div className="flex w-full items-center gap-3 sm:w-auto">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#d8dde4] bg-white px-4 py-2 text-sm text-[#4b5563] sm:flex-none">
            <FiEdit2 size={15} />
            Edit
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#b76424] px-4 py-2 text-sm text-white sm:flex-none">
            <FiUserX size={15} />
            Deactivate
          </button>
        </div> */}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-4">
          <h2 className="mb-4 text-[20px] font-semibold text-[#232a33] sm:text-[24px] lg:text-[32px]">
            User Information
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Name</span>
              <span className="text-[#2f343a] sm:text-right">{user.userName}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Email</span>
              <span className="break-all text-[#2f343a] sm:text-right">{user.email}</span>
            </div>
            {user.phone ? (
              <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                <span className="text-[#7a8088]">Phone</span>
                <span className="text-[#2f343a] sm:text-right">{user.phone}</span>
              </div>
            ) : null}
            <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Signup Date</span>
              <span className="text-[#2f343a] sm:text-right">{user.signupDate}</span>
            </div>
          </div>
        </section>

        {user.dogName || user.breed || user.age || user.weight ? (
          <section className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-4">
            <h2 className="mb-4 text-[20px] font-semibold text-[#232a33] sm:text-[24px] lg:text-[32px]">
              Dog Profile
            </h2>
            <div className="space-y-4 text-sm">
              {user.dogName ? (
                <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-[#7a8088]">Name</span>
                  <span className="text-[#2f343a] sm:text-right">{user.dogName}</span>
                </div>
              ) : null}
              {user.breed ? (
                <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-[#7a8088]">Breed</span>
                  <span className="text-[#2f343a] sm:text-right">{user.breed}</span>
                </div>
              ) : null}
              {user.age ? (
                <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-[#7a8088]">Age</span>
                  <span className="text-[#2f343a] sm:text-right">{user.age}</span>
                </div>
              ) : null}
              {user.weight ? (
                <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                  <span className="text-[#7a8088]">Weight</span>
                  <span className="text-[#2f343a] sm:text-right">{user.weight}</span>
                </div>
              ) : null}
            </div>
          </section>
        ) : null}

        {user.allergies && user.allergies.length > 0 ? (
          <section className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-4">
            <h2 className="mb-4 text-[20px] font-semibold text-[#232a33] sm:text-[24px] lg:text-[32px]">
              Allergy List
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.allergies.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#f0b7b7] bg-[#fff2f2] px-3 py-1 text-xs text-[#d93c3c]"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}

        {user.foodPreferences && user.foodPreferences.length > 0 ? (
          <section className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-4">
            <h2 className="mb-4 text-[20px] font-semibold text-[#232a33] sm:text-[24px] lg:text-[32px]">
              Food Preferences
            </h2>
            <div className="flex flex-wrap gap-2">
              {user.foodPreferences.map((item) => (
                <span
                  key={item}
                  className="rounded-full border border-[#b9d3ff] bg-[#ecf4ff] px-3 py-1 text-xs text-[#2668e3]"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>
        ) : null}
      </div>
    </div>
  );
}
