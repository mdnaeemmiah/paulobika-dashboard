"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { FiArrowLeft, FiEdit2, FiUserX } from "react-icons/fi";

type UserStatus = "Active" | "Inactive" | "Suspended" | "Blocked";

type UserRow = {
  id: string;
  userName: string;
  email: string;
  dogName: string;
  signupDate: string;
  status: UserStatus;
  phone: string;
  breed: string;
  age: string;
  weight: string;
  allergies: string[];
  foodPreferences: string[];
};

const STATIC_USERS: UserRow[] = [
  {
    id: "user-1",
    userName: "Brooklyn Simmons",
    email: "brooklyn@example.com",
    dogName: "Milo",
    signupDate: "Jun 01, 2026",
    status: "Active",
    phone: "+1 555 0101",
    breed: "Golden Retriever",
    age: "3 years",
    weight: "24 kg",
    allergies: ["Chicken"],
    foodPreferences: ["Dry Food"],
  },
  {
    id: "user-2",
    userName: "Cody Fisher",
    email: "cody@example.com",
    dogName: "Luna",
    signupDate: "May 24, 2026",
    status: "Inactive",
    phone: "+1 555 0102",
    breed: "Labrador",
    age: "5 years",
    weight: "28 kg",
    allergies: ["Beef"],
    foodPreferences: ["Wet Food"],
  },
  {
    id: "user-3",
    userName: "Leslie Alexander",
    email: "leslie@example.com",
    dogName: "Rocky",
    signupDate: "May 10, 2026",
    status: "Suspended",
    phone: "+1 555 0103",
    breed: "Beagle",
    age: "2 years",
    weight: "12 kg",
    allergies: ["Dairy"],
    foodPreferences: ["Fresh Food"],
  },
  {
    id: "user-4",
    userName: "Jane Cooper",
    email: "jane@example.com",
    dogName: "Bella",
    signupDate: "Apr 18, 2026",
    status: "Blocked",
    phone: "+1 555 0104",
    breed: "Husky",
    age: "4 years",
    weight: "20 kg",
    allergies: ["Soy"],
    foodPreferences: ["Prescription"],
  },
];

export default function UserDetailsPage() {
  const params = useParams<{ id: string }>();
  const [user, setUser] = useState<UserRow | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");

  useEffect(() => {
    if (!params.id) {
      setFetchError("User not found.");
      setIsLoading(false);
      return;
    }

    const match = STATIC_USERS.find((item) => item.id === params.id) ?? null;
    if (!match) {
      setFetchError("User not found.");
      setUser(null);
      setIsLoading(false);
      return;
    }

    setUser(match);
    setFetchError("");
    setIsLoading(false);
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
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Phone</span>
              <span className="text-[#2f343a] sm:text-right">{user.phone}</span>
            </div>
            <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Signup Date</span>
              <span className="text-[#2f343a] sm:text-right">{user.signupDate}</span>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-4">
          <h2 className="mb-4 text-[20px] font-semibold text-[#232a33] sm:text-[24px] lg:text-[32px]">
            Dog Profile
          </h2>
          <div className="space-y-4 text-sm">
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Name</span>
              <span className="text-[#2f343a] sm:text-right">{user.dogName}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Breed</span>
              <span className="text-[#2f343a] sm:text-right">{user.breed}</span>
            </div>
            <div className="flex flex-col gap-1 border-b border-[#e6e9ee] pb-2 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Age</span>
              <span className="text-[#2f343a] sm:text-right">{user.age}</span>
            </div>
            <div className="flex flex-col gap-1 pb-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
              <span className="text-[#7a8088]">Weight</span>
              <span className="text-[#2f343a] sm:text-right">{user.weight}</span>
            </div>
          </div>
        </section>

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
      </div>
    </div>
  );
}
