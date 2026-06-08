"use client";

import React, { useMemo, useState, useEffect } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import axios from "axios";

type ApiUser = {
  id: number;
  name: string;
  email: string;
};

const ITEMS_PER_PAGE = 10;

export default function EmailListPage() {
  const [users, setUsers] = useState<ApiUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      setFetchError("");
      try {
        const response = await baseApi.get(ENDPOINTS.getUsers);
        if (response.data && Array.isArray(response.data)) {
          setUsers(response.data);
        } else if (response.data?.results && Array.isArray(response.data.results)) {
          setUsers(response.data.results);
        } else {
          setFetchError("Invalid data format from server");
        }
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setFetchError(err.response?.data?.message || "Failed to load users");
        } else {
          setFetchError("Failed to load users");
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) return users;
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(term) ||
        user.email?.toLowerCase().includes(term),
    );
  }, [searchTerm, users]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));

  const paginatedRecords = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const buildCsv = () => {
    const rows = filteredRecords.map((user) => [user.name, user.email]);

    const csvRows = [["User Name", "Email"], ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      )
      .join("\n");

    const blob = new Blob([csvRows], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "email-list.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setShowExportModal(false);
  };

  return (
    <div className="min-h-full">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[22px] leading-none font-semibold text-white sm:text-[30px]">Email List</h2>
        </div>

        <div className="space-y-4 p-4 sm:p-5">
          <div className="flex items-center gap-3">
            <label className="flex h-11 flex-1 items-center gap-2 rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3">
              <FiSearch className="text-[#8d95a0]" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => handleSearch(event.target.value)}
                placeholder="Search users..."
                className="w-full bg-transparent text-[14px] text-[#3a4048] outline-none placeholder:text-[#9aa1ab]"
              />
            </label>

            <button
              type="button"
              onClick={() => setShowExportModal(true)}
              disabled={isLoading || users.length === 0}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8dde4] bg-[#f7f7f8] px-4 text-[14px] font-medium text-[#2d323a] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <FiDownload size={14} />
              Download CSV
            </button>
          </div>

          <div className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f7f8]">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="border-b border-[#e1e6ed] text-[13px] text-[#6f7784]">
                    <th className="px-4 py-3 font-medium lg:text-[20px]">
                      User Name
                    </th>
                    <th className="px-4 py-3 font-medium lg:text-[20px]">
                      Email
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {isLoading ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[14px] text-[#7f8793]">
                        Loading users...
                      </td>
                    </tr>
                  ) : fetchError ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[14px] text-[#cf3f3f]">
                        {fetchError}
                      </td>
                    </tr>
                  ) : paginatedRecords.length === 0 ? (
                    <tr>
                      <td colSpan={2} className="px-4 py-8 text-center text-[14px] text-[#7f8793]">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    paginatedRecords.map((user) => (
                      <tr
                        key={user.id}
                        className="border-b border-[#e7ebf0] text-[14px] text-[#3a4048]"
                      >
                        <td className="px-4 py-3">{user.name}</td>
                        <td className="px-4 py-3 text-[#6b7280]">
                          {user.email}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-[#e1e6ed] px-4 py-3 text-[13px] text-[#6f7784] sm:flex-row sm:items-center sm:justify-between">
              <p>
                Page {currentPage} of {totalPages}
              </p>

              <div className="flex flex-wrap items-center justify-end gap-1">
                <button
                  type="button"
                  onClick={() => goToPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d8dde4] text-[#6f7784] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Previous page"
                >
                  &lt;
                </button>

                {Array.from({ length: totalPages }).map((_, index) => {
                  const pageNumber = index + 1;
                  const isActive = pageNumber === currentPage;

                  return (
                    <button
                      key={pageNumber}
                      type="button"
                      onClick={() => goToPage(pageNumber)}
                      className={`flex h-7 w-7 items-center justify-center rounded-full border text-[12px] font-medium ${
                        isActive
                          ? "border-[#b76424] bg-[#b76424] text-white"
                          : "border-transparent text-[#3a4048]"
                      }`}
                    >
                      {pageNumber}
                    </button>
                  );
                })}

                <button
                  type="button"
                  onClick={() => goToPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded-full border border-[#d8dde4] text-[#6f7784] disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Next page"
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {showExportModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-125 rounded-2xl border border-[#d8dde4] bg-white p-4 shadow-xl sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[20px] font-medium text-[#2d323a] sm:text-[22px]">Export Email List</p>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="text-[22px] leading-none text-[#8b93a0]"
                aria-label="Close export modal"
              >
                x
              </button>
            </div>

            <p className="text-[14px] text-[#737b86]">
              Export all {filteredRecords.length} email records as a CSV file. This will include user
              names and emails.
            </p>

            <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:gap-3">
              <button
                type="button"
                onClick={buildCsv}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-[#b76424] px-6 text-[15px] font-medium text-white sm:min-w-40"
              >
                Download CSV
              </button>
              <button
                type="button"
                onClick={() => setShowExportModal(false)}
                className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-[#d8dde4] bg-[#f7f7f8] px-6 text-[15px] font-medium text-[#2d323a] sm:min-w-34"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
