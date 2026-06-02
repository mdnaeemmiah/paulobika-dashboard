"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiEye, FiSearch, FiTrash2 } from "react-icons/fi";

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

type DeleteTarget = {
  id: string;
  userName: string;
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

const PAGE_SIZE = 8;

export default function UserManagementPage() {
  const [users, setUsers] = useState<UserRow[]>(STATIC_USERS);
  const [isLoading] = useState(false);
  const [fetchError] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | UserStatus | "blocked-list">("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredUsers = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return users.filter((user) => {
      const matchesSearch =
        keyword.length === 0 ||
        user.userName.toLowerCase().includes(keyword) ||
        user.email.toLowerCase().includes(keyword) ||
        user.dogName.toLowerCase().includes(keyword);

      if (!matchesSearch) return false;

      if (statusFilter === "all") return true;
      if (statusFilter === "blocked-list") return user.status === "Blocked";
      return user.status === statusFilter;
    });
  }, [users, searchText, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedUsers = useMemo(() => {
    const start = (safeCurrentPage - 1) * PAGE_SIZE;
    return filteredUsers.slice(start, start + PAGE_SIZE);
  }, [filteredUsers, safeCurrentPage]);

  const handleDeleteClick = (id: string, userName: string) => {
    setDeleteTarget({ id, userName });
  };

  const handleCancelDelete = () => {
    if (isDeleting) {
      return;
    }

    setDeleteTarget(null);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) {
      return;
    }

    setIsDeleting(true);
    setUsers((prev) => prev.filter((item) => item.id !== deleteTarget.id));
    setDeleteTarget(null);
    setActionError("");
    setIsDeleting(false);
  };

  const statusPillClass = (status: UserStatus) => {
    if (status === "Active") return "bg-[#e6f6ec] text-[#2f9d61] border border-[#bde8cd]";
    if (status === "Inactive") return "bg-[#f1f3f6] text-[#7a8492] border border-[#e0e5ea]";
    if (status === "Suspended") return "bg-[#fff4dd] text-[#bf7d08] border border-[#f5dfac]";
    return "bg-[#fde8e8] text-[#cf3f3f] border border-[#f4caca]";
  };

  return (
    <div className="relative min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]">
            User Management
          </h2>
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-4 flex flex-row gap-3 lg:flex-row lg:items-center">
            <div className="flex h-11 flex-1 items-center rounded-xl border border-[#d8dde4] bg-white px-3">
              <FiSearch className="mr-2 text-[#7d8592]" />
              <input
                type="text"
                value={searchText}
                onChange={(e) => {
                  setSearchText(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search users..."
                className="w-full bg-transparent text-sm text-[#3a4048] outline-none placeholder:text-[#9aa3ad]"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value as "all" | UserStatus | "blocked-list");
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-[#d8dde4] bg-white px-4 text-sm text-[#3a4048] outline-none"
            >
              <option value="all">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Suspended">Suspended</option>
              <option value="blocked-list">Blocked List</option>
            </select>
          </div>

          {actionError ? (
            <p className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {actionError}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-[#d8dde4] bg-white">
            <table className="w-full min-w-190 border-collapse lg:min-w-210">
              <thead>
                <tr className="border-b border-[#e0e5ea] text-left">
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">User Name</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Email</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Dog Name</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Signup Date</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Status</th>
                  <th className="px-3 py-3 text-[14px] font-medium text-[#232a33] sm:px-4 sm:text-[16px] lg:text-[20px]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      Loading users...
                    </td>
                  </tr>
                ) : fetchError ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#cf3f3f]">
                      {fetchError}
                    </td>
                  </tr>
                ) : pagedUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  pagedUsers.map((user) => (
                    <tr key={user.id} className="border-b border-[#edf1f4] last:border-b-0">
                      <td className="px-3 py-3 text-[13px] font-medium text-[#2f343a] sm:px-4 sm:text-[14px] lg:text-[18px]">
                        {user.userName}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#7a8088] sm:px-4 sm:text-[13px] lg:text-[17px]">
                        {user.email}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#2f343a] sm:px-4 sm:text-[13px] lg:text-[17px]">
                        {user.dogName}
                      </td>
                      <td className="px-3 py-3 text-[12px] text-[#7a8088] sm:px-4 sm:text-[13px] lg:text-[17px]">
                        {user.signupDate}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium sm:px-3 sm:text-[12px] lg:text-[14px] ${statusPillClass(user.status)}`}
                        >
                          {user.status}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                          <Link href={`/admin/userManagement/${user.id}`} className="text-[#3b82f6] cursor-pointer" aria-label={`View details of ${user.userName}`}>
                            <FiEye size={15} />
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDeleteClick(user.id, user.userName)}
                            className="text-[#ef4444] cursor-pointer"
                            aria-label={`Delete ${user.userName}`}
                          >
                            <FiTrash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#7d8592]">
              Page {safeCurrentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 w-8 rounded-full border border-[#e0e5ea] text-sm text-[#7d8592] disabled:opacity-50"
              >
                &lt;
              </button>

              {Array.from({ length: totalPages }).map((_, i) => {
                const page = i + 1;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`h-8 min-w-8 rounded-full px-2 text-sm ${
                      page === safeCurrentPage ? "bg-[#f9733d] text-white" : "text-[#3a4048]"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={safeCurrentPage === totalPages}
                className="h-8 w-8 rounded-full border border-[#e0e5ea] text-sm text-[#7d8592] disabled:opacity-50"
              >
                &gt;
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-semibold text-[#232a33]">Delete User</h3>
            <p className="mt-2 text-sm text-[#5f6670]">
              Are you sure you want to delete <span className="font-medium text-[#232a33]">{deleteTarget.userName}</span>?
            </p>
            <p className="mt-1 text-xs text-[#9aa3ad]">This action cannot be undone.</p>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handleCancelDelete}
                disabled={isDeleting}
                className="h-9 rounded-lg border border-[#d8dde4] bg-white px-4 text-sm text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void handleConfirmDelete()}
                disabled={isDeleting}
                className="h-9 rounded-lg bg-[#dc2626] px-4 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isDeleting ? "Deleting..." : "Yes, Delete"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
