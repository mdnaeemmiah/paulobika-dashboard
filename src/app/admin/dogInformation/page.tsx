"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronLeft, FiChevronRight, FiEdit2 } from "react-icons/fi";
import {
  DOG_INFO_PAGE_SIZE,
  DOG_INFO_ROWS,
  type DogInfoRow,
} from "./dogInformationData";

const pillClass =
  "inline-flex min-w-20 justify-center rounded-full border border-[#dde3ea] bg-[#f8fafc] px-3 py-1 text-[12px] text-[#5f6772]";

export default function DogInformationPage() {
  const [rows] = useState<DogInfoRow[]>(DOG_INFO_ROWS);
  const [isLoading] = useState(false);
  const [loadError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(rows.length / DOG_INFO_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * DOG_INFO_PAGE_SIZE;
    return rows.slice(start, start + DOG_INFO_PAGE_SIZE);
  }, [rows, safeCurrentPage]);

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="flex items-center justify-between gap-3 bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]">
            Dog Information
          </h2>

          <Link
            href="/admin/dogInformation/edit"
            className="inline-flex items-center gap-2 rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm font-medium text-[#2f343a]"
          >
            <FiEdit2 size={14} />
            Edit Information
          </Link>
        </div>

        <div className="overflow-x-auto p-2 sm:p-3">
          <div className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-white">
            <table className="w-full min-w-250 border-collapse">
              <thead>
                <tr className="border-b border-[#e0e5ea] text-left">
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Breed</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Health Issues</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Food Allergies</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Food Type</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-[#6f7680] sm:px-4">
                      Loading dog information...
                    </td>
                  </tr>
                ) : null}

                {!isLoading && loadError ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-[#c2410c] sm:px-4">
                      {loadError}
                    </td>
                  </tr>
                ) : null}

                {!isLoading && !loadError && pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-3 py-8 text-center text-sm text-[#6f7680] sm:px-4">
                      No dog information found.
                    </td>
                  </tr>
                ) : null}

                {pagedRows.map((row) => (
                  <tr key={row.id} className="border-b border-[#edf1f4] last:border-b-0">
                    <td className="px-3 py-3 sm:px-4">
                      <span className={pillClass}>{row.breed}</span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={pillClass}>{row.healthIssues}</span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={pillClass}>{row.foodAllergies}</span>
                    </td>
                    <td className="px-3 py-3 sm:px-4">
                      <span className={pillClass}>{row.foodType}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex items-center justify-between gap-3 px-2">
            <p className="text-sm text-[#7d8592]">
              Page {safeCurrentPage} of {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dde4] bg-white text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Previous page"
              >
                <FiChevronLeft size={14} />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-8 min-w-8 rounded-full border px-2 text-sm ${
                    pageNumber === safeCurrentPage
                      ? "border-[#b76424] bg-[#b76424] text-white"
                      : "border-[#d8dde4] bg-white text-[#5f6670]"
                  }`}
                >
                  {pageNumber}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={safeCurrentPage === totalPages}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#d8dde4] bg-white text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Next page"
              >
                <FiChevronRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
