"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import {
  MdDashboard,
  MdOutlinePets,
  MdOutlineEmail,
  MdOutlineSettings,
} from "react-icons/md";
import { FiMenu, FiX } from "react-icons/fi";
import { LuPackage, LuTag, LuUsers } from "react-icons/lu";
import { TbLogout } from "react-icons/tb";
import Logo from "@/src/app/assets/onbording/Logo.svg";

import { ENDPOINTS } from "@/src/api/endPoints";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";

type ProfileResponse = {
  name?: string;
  image?: string;
  profile_image?: string;
  profileImage?: string;
  photo?: string;
  avatar?: string;
  first_name?: string;
  username?: string;
  user?: {
    name?: string;
    image?: string;
    avatar?: string;
  };
};

const resolveImageUrl = (value: unknown): string => {
  if (typeof value !== "string") {
    return "";
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return "";
  }

  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    return trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
  }

  const baseUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    return trimmed;
  }

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return trimmed;
  }
};

const navItems = [
  // { label: "Dashboard", href: "/admin/dashboard", icon: MdDashboard },
  {
    label: "User Management",
    href: "/admin/userManagement",
    icon: LuUsers,
  },
  {
    label: "Product Management",
    href: "/admin/productManagement",
    icon: LuPackage,
  },
  // {
  //   label: "Dog Information",
  //   href: "/admin/dogInformation",
  //   icon: MdOutlinePets,
  // },
  // { label: "Product Deals", href: "/admin/productDeals", icon: LuTag },
  { label: "Email List", href: "/admin/emailList", icon: MdOutlineEmail },
  { label: "Settings", href: "/admin/settings", icon: MdOutlineSettings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileName, setProfileName] = useState("User");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchProfile = async () => {
      try {
        const response = await baseApi.get(ENDPOINTS.getUser);
        const data = response.data as ProfileResponse;

        if (!isMounted) {
          return;
        }

        setProfileName(
          String(
            data?.name ??
              data?.first_name ??
              data?.username ??
              data?.user?.name ??
              "User",
          ).trim() || "User",
        );
        setProfileImage(
          resolveImageUrl(
            data?.image ??
              data?.profile_image ??
              data?.profileImage ??
              data?.photo ??
              data?.avatar ??
              data?.user?.image ??
              data?.user?.avatar,
          ),
        );
      } catch (error) {
        console.error("Failed to load dashboard profile", error);
      }
    };

    void fetchProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("is_admin");
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    router.push("/auth/login");
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      {/* <Link href="/admin/dashboard"> */}
        <div className="mb-0 flex justify-center items-center gap-2 px-2 lg:mb-0">
          <Image
            src={Logo}
            alt="Everidog"
            width={120}
            height={36}
            className="lg:w-42 md:w-42 "
          />
        </div>
      {/* </Link> */}

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1">
        {navItems.map(({ label, href, icon: Icon }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setIsSidebarOpen(false)}
              className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-[16px] font-medium transition-colors lg:gap-4 lg:px-4 lg:py-3 lg:text-[18px] ${
                active
                  ? "bg-linear-to-r from-[#C57E50] to-[#8F4A1D] text-white"
                  : "text-gray-600 hover:bg-orange-50 hover:text-[#8F4A1D]"
              }`}
            >
              <Icon size={18} className="lg:scale-110" />
              {label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <button
        onClick={() => {
          setIsSidebarOpen(false);
          handleLogout();
        }}
        className="mt-4 flex items-center gap-3 rounded-lg bg-linear-to-r from-[#C57E50] to-[#8F4A1D] px-3 py-2.5 text-[16px] font-medium text-white transition hover:brightness-105 lg:gap-4 lg:px-4 lg:py-3 lg:text-[18px]"
      >
        <TbLogout size={18} className="lg:scale-110" />
        Logout
      </button>
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#f4f5f7]">
      {/* Desktop sidebar */}
      <aside className="hidden h-screen w-50 shrink-0 flex-col overflow-y-auto bg-white px-4 py-8 shadow-sm md:flex md:w-60 lg:w-75 lg:px-6 lg:py-10">
        {sidebarContent}
      </aside>

      {/* Mobile sidebar drawer */}
      <div
        className={`fixed inset-0 z-50 bg-black/35 transition-opacity duration-200 md:hidden ${
          isSidebarOpen
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />
      <aside
        className={`fixed left-0 top-0 z-60 flex h-screen w-65 flex-col bg-white px-4 py-6 shadow-xl transition-transform duration-300 md:hidden ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="mb-4 flex items-center justify-end">
          <button
            type="button"
            onClick={() => setIsSidebarOpen(false)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280]"
            aria-label="Close menu"
          >
            <FiX size={18} />
          </button>
        </div>
        {sidebarContent}
      </aside>

      {/* Main */}
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-[#f7f8fa]">
        {/* Topbar */}
        <header className="mx-3 mt-3 rounded-[10px] border border-[#e8edf2] bg-white px-3 py-3 shadow-[0_2px_8px_rgba(15,23,42,0.04)] sm:mx-4 sm:mt-4 sm:px-4 md:mx-6 md:px-5">
          <div className="grid grid-cols-1 items-center gap-3 md:grid-cols-[auto_1fr_auto] md:gap-4">
            <div className="flex items-start gap-3">
              <button
                type="button"
                onClick={() => setIsSidebarOpen(true)}
                className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-full border border-[#e5e7eb] text-[#6b7280] md:hidden"
                aria-label="Open menu"
              >
                <FiMenu size={18} />
              </button>
              <div>
                <h1 className="text-[18px] font-semibold leading-[1.1] text-[#1f2937] sm:text-[20px] md:text-[22px]">
                  Welcome, {profileName}
                </h1>
                <p className="text-[12px] text-[#6b7280] sm:text-[13px]">
                  Have a nice day!
                </p>
              </div>
            </div>

            {/* Search */}
            {/* <div className="flex h-10 w-full items-center gap-2 rounded-lg border border-[#e7ebf0] bg-[#f7f8fa] px-3 md:mx-auto md:max-w-105">
              <FiSearch className="text-[#9aa3af] text-[14px]" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full bg-transparent text-[13px] text-[#4b5563] placeholder:text-[#9ca3af] outline-none"
              />
            </div> */}

            {/* Icons */}
            <div className="flex items-center justify-end gap-2 sm:gap-3">
              {/* <button className="relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-[#C57E50] text-[#C57E50] transition hover:border-[#8F4A1D] hover:text-[#8F4A1D]">
                <FiBell className="text-[18px]" />
                <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#C57E50]" />
              </button> */}
              <button
                type="button"
                onClick={() => router.push("/admin/profile")}
                className="flex items-center gap-2 rounded-full border-2 border-[#C57E50] px-1.5 py-1 transition hover:border-[#8F4A1D]"
                aria-label="Open profile"
              >
                <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[#f5e7dc] text-[#C57E50]">
                  {profileImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={profileImage}
                      alt={profileName}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="h-full w-full rounded-full border border-[#d9bca7] bg-[#f5e7dc]" aria-hidden="true" />
                  )}
                </span>
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="min-h-0 flex-1 overflow-y-auto p-3 sm:p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
