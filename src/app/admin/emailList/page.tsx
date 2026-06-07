"use client";

import Link from "next/link";
import React, { useMemo, useState } from "react";
import { FiDownload, FiSearch } from "react-icons/fi";
import { LuSend } from "react-icons/lu";

type EmailRecord = {
  id: number;
  name: string;
  email: string;
  subscribed: boolean;
};

const EMAIL_RECORDS: EmailRecord[] = [
  { id: 1, name: "Sarah Johnson", email: "sarah@example.com", subscribed: true },
  { id: 2, name: "Mike Chen", email: "mike@example.com", subscribed: true },
  { id: 3, name: "Emma Wilson", email: "emma@example.com", subscribed: false },
  { id: 4, name: "James Brown", email: "james@example.com", subscribed: true },
  { id: 5, name: "Lisa Park", email: "lisa@example.com", subscribed: true },
  { id: 6, name: "David Kim", email: "david@example.com", subscribed: true },
  { id: 7, name: "Anna Smith", email: "anna@example.com", subscribed: false },
  { id: 8, name: "Tom Harris", email: "tom@example.com", subscribed: true },
  { id: 9, name: "Jessica Lee", email: "jessica@example.com", subscribed: true },
  { id: 10, name: "Robert Taylor", email: "robert@example.com", subscribed: true },
  { id: 11, name: "Sofia Martinez", email: "sofia@example.com", subscribed: false },
  { id: 12, name: "Noah Davis", email: "noah@example.com", subscribed: true },
  { id: 13, name: "Ava Thompson", email: "ava@example.com", subscribed: true },
  { id: 14, name: "Liam Walker", email: "liam@example.com", subscribed: false },
  { id: 15, name: "Olivia Green", email: "olivia@example.com", subscribed: true },
  { id: 16, name: "Ethan Scott", email: "ethan@example.com", subscribed: true },
  { id: 17, name: "Mia Adams", email: "mia@example.com", subscribed: true },
  { id: 18, name: "Lucas Allen", email: "lucas@example.com", subscribed: false },
  { id: 19, name: "Chloe Young", email: "chloe@example.com", subscribed: true },
  { id: 20, name: "Henry King", email: "henry@example.com", subscribed: true },
  { id: 21, name: "Grace Hall", email: "grace@example.com", subscribed: false },
  { id: 22, name: "Mason Wright", email: "mason@example.com", subscribed: true },
  { id: 23, name: "Lily Baker", email: "lily@example.com", subscribed: true },
  { id: 24, name: "Jackson Hill", email: "jackson@example.com", subscribed: true },
  { id: 25, name: "Zoe Nelson", email: "zoe@example.com", subscribed: false },
  { id: 26, name: "Benjamin Carter", email: "benjamin@example.com", subscribed: true },
  { id: 27, name: "Amelia Mitchell", email: "amelia@example.com", subscribed: true },
  { id: 28, name: "Daniel Perez", email: "daniel@example.com", subscribed: true },
  { id: 29, name: "Harper Roberts", email: "harper@example.com", subscribed: false },
  { id: 30, name: "Logan Turner", email: "logan@example.com", subscribed: true },
];

const ITEMS_PER_PAGE = 10;

const getStatusStyle = (subscribed: boolean) =>
  subscribed
    ? "border border-[#b8e8c6] bg-[#e8f7ee] text-[#21864a]"
    : "border border-[#dfe4ea] bg-[#f2f4f7] text-[#7c8490]";

export default function EmailListPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [showExportModal, setShowExportModal] = useState(false);

  const filteredRecords = useMemo(() => {
    const term = searchTerm.trim().toLowerCase();
    if (!term) {
      return EMAIL_RECORDS;
    }

    return EMAIL_RECORDS.filter(
      (record) =>
        record.name.toLowerCase().includes(term) ||
        record.email.toLowerCase().includes(term),
    );
  }, [searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredRecords.length / ITEMS_PER_PAGE));

  const paginatedRecords = useMemo(() => {
    const safePage = Math.min(currentPage, totalPages);
    const start = (safePage - 1) * ITEMS_PER_PAGE;
    return filteredRecords.slice(start, start + ITEMS_PER_PAGE);
  }, [filteredRecords, currentPage, totalPages]);

  const goToPage = (page: number) => {
    if (page < 1 || page > totalPages) {
      return;
    }
    setCurrentPage(page);
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    setCurrentPage(1);
  };

  const buildCsv = () => {
    const rows = filteredRecords.map((record) => [
      record.name,
      record.email,
      record.subscribed ? "Subscribed" : "Unsubscribed",
    ]);

    const csvRows = [["User Name", "Email", "Subscription Status"], ...rows]
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(","),
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
    className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[#d8dde4] bg-[#f7f7f8] px-4 text-[14px] font-medium text-[#2d323a]"
  >
    <FiDownload size={14} />
    Export CSV
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
    {paginatedRecords.length === 0 ? (
      <tr>
        <td
          colSpan={2}
          className="px-4 py-8 text-center text-[14px] text-[#7f8793]"
        >
          No records found.
        </td>
      </tr>
    ) : (
      paginatedRecords.map((record) => (
        <tr
          key={record.id}
          className="border-b border-[#e7ebf0] text-[14px] text-[#3a4048]"
        >
          <td className="px-4 py-3">{record.name}</td>
          <td className="px-4 py-3 text-[#6b7280]">
            {record.email}
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
              names, emails, and subscription status.
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
