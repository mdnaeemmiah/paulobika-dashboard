"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { FiEdit2, FiSearch, FiTrash2 } from "react-icons/fi";
import { PRODUCT_PAGE_SIZE, PRODUCT_TABLE_ROWS, type ProductStatus } from "./productData";

const statusStyles: Record<ProductStatus, string> = {
  Active: "bg-[#e6f8ee] text-[#1e8b4b] border border-[#beeacc]",
  Inactive: "bg-[#f1f3f6] text-[#6f7885] border border-[#dde3ea]",
};

const categoryStyles: Record<string, string> = {
  Dry: "bg-[#eaf2ff] text-[#2668e3] border border-[#c8dcff]",
  Wet: "bg-[#ebf4ff] text-[#0f62d1] border border-[#c8dcff]",
  Fresh: "bg-[#e8fff2] text-[#19744d] border border-[#b9ebcf]",
  Prescription: "bg-[#eff1ff] text-[#585fc9] border border-[#d9dcff]",
};

type ProductTableRow = {
  id: string;
  foodName: string;
  brand: string;
  price: string;
  subPrice: string;
  status: ProductStatus;
  categories: string[];
  ingredients: string;
  affiliateUrl: string;
};

type DeleteTarget = {
  id: string;
  foodName: string;
};

const STATIC_ROWS: ProductTableRow[] = PRODUCT_TABLE_ROWS.map((item, index) => ({
  id: String(index + 1),
  foodName: item.foodName,
  brand: item.brand,
  price: "29.99",
  subPrice: "39.99",
  status: item.status,
  categories: [item.category],
  ingredients: item.ingredient,
  affiliateUrl: item.affiliateUrl,
}));

export default function ProductManagementPage() {
  const [rows, setRows] = useState<ProductTableRow[]>(STATIC_ROWS);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading] = useState(false);
  const [fetchError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredRows = useMemo(() => {
    const keyword = searchText.trim().toLowerCase();

    return rows.filter((row) => {
      const matchesSearch =
        keyword.length === 0 ||
        row.foodName.toLowerCase().includes(keyword) ||
        row.brand.toLowerCase().includes(keyword) ||
        row.ingredients.toLowerCase().includes(keyword) ||
        row.categories.join(" ").toLowerCase().includes(keyword);

      if (!matchesSearch) return false;
      if (categoryFilter === "all") return true;
      return row.categories.some((category) => category === categoryFilter);
    });
  }, [rows, searchText, categoryFilter]);

  const categoryOptions = useMemo(() => {
    const unique = new Set<string>();
    rows.forEach((row) => {
      row.categories.forEach((category) => {
        if (category) {
          unique.add(category);
        }
      });
    });

    return Array.from(unique).sort((a, b) => a.localeCompare(b));
  }, [rows]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PRODUCT_PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);

  const pagedRows = useMemo(() => {
    const start = (safeCurrentPage - 1) * PRODUCT_PAGE_SIZE;
    return filteredRows.slice(start, start + PRODUCT_PAGE_SIZE);
  }, [filteredRows, safeCurrentPage]);

  const handleDeleteClick = (id: string, foodName: string) => {
    setDeleteTarget({ id, foodName });
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
    setRows((prev) => prev.filter((row) => row.id !== deleteTarget.id));
    setDeleteTarget(null);
    setIsDeleting(false);
  };

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]">
            Product Management
          </h2>

          <Link
            href="/admin/productManagement/new"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#2f343a]"
          >
            <span className="text-base leading-none">+</span>
            Add Recommendation
          </Link>
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
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
              value={categoryFilter}
              onChange={(e) => {
                setCategoryFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="h-11 rounded-xl border border-[#d8dde4] bg-white px-4 text-sm text-[#3a4048] outline-none"
            >
              <option value="all">All Categories</option>
              {categoryOptions.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {fetchError ? (
            <p className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">
              {fetchError}
            </p>
          ) : null}

          <div className="overflow-x-auto rounded-2xl border border-[#d8dde4] bg-white">
            <table className="w-full min-w-220 border-collapse">
              <thead>
                <tr className="border-b border-[#e0e5ea] text-left">
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Food Name</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Brand</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Price</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Category</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Ingredients</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Status</th>
                  {/* <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Link</th> */}
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4 lg:text-[20px]">Actions</th>
                </tr>
              </thead>

              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      Loading products...
                    </td>
                  </tr>
                ) : pagedRows.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#7d8592]">
                      No products found.
                    </td>
                  </tr>
                ) : (
                  pagedRows.map((row) => (
                    <tr key={row.id} className="border-b border-[#edf1f4] last:border-b-0">
                      <td className="max-w-44 truncate px-3 py-3 text-[13px] font-medium text-[#2f343a] sm:px-4">
                        {row.foodName}
                      </td>
                      <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">{row.brand}</td>
                      <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">
                        ${row.price}
                        {row.subPrice ? (
                          <span className="ml-1 text-[11px] text-[#9aa1ab] line-through">${row.subPrice}</span>
                        ) : null}
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex flex-wrap gap-1">
                          {row.categories.map((category) => (
                            <span
                              key={`${row.id}-${category}`}
                              className={`inline-flex rounded-full px-3 py-1 text-[11px] ${categoryStyles[category] ?? "border border-[#d8dde4] bg-[#f8fafc] text-[#5f6670]"}`}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span className="inline-flex rounded-full bg-[#f1f3f6] px-3 py-1 text-[11px] text-[#6f7680]">
                          {row.ingredients || "N/A"}
                        </span>
                      </td>
                      <td className="px-3 py-3 sm:px-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${statusStyles[row.status]}`}
                        >
                          {row.status}
                        </span>
                      </td>
                      {/* <td className="max-w-44 truncate px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">
                        {row.affiliateUrl ? (
                          <a
                            href={row.affiliateUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 hover:text-[#2668e3]"
                          >
                            {row.affiliateUrl}
                            <FiExternalLink size={12} />
                          </a>
                        ) : (
                          "N/A"
                        )}
                      </td> */}
                      <td className="px-3 py-3 sm:px-4">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/admin/productManagement/${row.id}`}
                            className="text-[#2668e3]"
                            aria-label={`Edit ${row.foodName}`}
                          >
                            <FiEdit2 size={15} />
                          </Link>

                          <button
                            type="button"
                            onClick={() => handleDeleteClick(row.id, row.foodName)}
                            className="text-[#ef4444] cursor-pointer"
                            aria-label={`Delete ${row.foodName}`}
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
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={safeCurrentPage === 1}
                className="h-8 rounded-lg border border-[#d8dde4] bg-white px-3 text-sm text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Prev
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setCurrentPage(pageNumber)}
                  className={`h-8 min-w-8 rounded-lg border px-2 text-sm ${
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
                className="h-8 rounded-lg border border-[#d8dde4] bg-white px-3 text-sm text-[#5f6670] disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-semibold text-[#232a33]">Delete Product</h3>
            <p className="mt-2 text-sm text-[#5f6670]">
              Are you sure you want to delete <span className="font-medium text-[#232a33]">{deleteTarget.foodName}</span>?
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
