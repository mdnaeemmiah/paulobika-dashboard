/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiEdit2, FiSearch, FiTrash2, FiPlus } from "react-icons/fi";
import { toast } from "sonner";
import axios from "axios";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { PRODUCT_PAGE_SIZE, PRODUCT_TABLE_ROWS, type ProductStatus } from "./productData";

type ApiProduct = {
  id: number | string;
  name: string;
  brand: string;
  category: string[];
  health_issues?: any[];
  food_allergies?: any[];
  price: string;
  lifestage?: string;
  grain_free?: boolean;
  protein_percentage?: string;
  fat_percentage?: string;
  calories_per_hundred_grams?: string;
  status?: string;
  image?: string;
  ingredients?: string;
  benefits?: string[];
  why_recommended?: string;
  source_link?: string;
};

type Row = {
  id: string;
  foodName: string;
  brand: string;
  price: string;
  categories: string[];
  healthIssues: string;
  foodAllergies: string;
  lifestage?: string;
  grainFree?: boolean;
  status: ProductStatus;
};

const statusFromApi = (value?: string): ProductStatus => (value?.toLowerCase() === "active" ? "Active" : "Inactive");

const parseCategories = (cat: unknown): string[] => {
  const parseValue = (value: any): string[] => {
    if (Array.isArray(value)) {
      return value.flatMap((c) => parseValue(c)).filter(Boolean);
    }
    if (typeof value !== "string") return [];
    
    let parsed: any = value.trim();
    // Try progressive JSON parsing in case the value is stringified multiple times
    for (let i = 0; i < 5; i++) {
      if (typeof parsed !== "string") break;
      try {
        const next = JSON.parse(parsed);
        parsed = next;
      } catch (e) {
        break;
      }
    }
    
    if (Array.isArray(parsed)) {
      return parsed.map((c) => String(c).trim()).filter(Boolean);
    }
    if (typeof parsed === "string") {
      return [parsed.trim()].filter(Boolean);
    }
    return [];
  };
  
  return parseValue(cat);
};

const mapApiToRow = (p: ApiProduct): Row => ({
  id: String(p.id),
  foodName: p.name ?? "Untitled",
  brand: p.brand ?? "",
  price: p.price ?? "",
  categories: parseCategories(p.category),
  healthIssues: parseCategories(p.health_issues).join(", "),
  foodAllergies: parseCategories(p.food_allergies).join(", "),
  lifestage: p.lifestage,
  grainFree: Boolean(p.grain_free),
  status: statusFromApi(p.status),
});

export default function ProductManagementPage() {
  const [rows, setRows] = useState<Row[]>([]);
  const [searchText, setSearchText] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [fetchError, setFetchError] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; foodName: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    setFetchError("");
    try {
      const res = await baseApi.get(ENDPOINTS.product);
      const list: ApiProduct[] = Array.isArray(res.data) ? res.data : res.data?.results ?? res.data?.data ?? [];
      // show newest items first (items added at the end of API response appear on top)
      setRows(list.map(mapApiToRow).reverse());
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || "Failed to load products" : "Failed to load products";
      setFetchError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const id = window.setTimeout(() => void fetchProducts(), 0);
    return () => window.clearTimeout(id);
  }, [fetchProducts]);

  const filteredRows = useMemo(() => {
    const kw = searchText.trim().toLowerCase();
    return rows.filter((r) => {
      const match = kw.length === 0 || r.foodName.toLowerCase().includes(kw) || r.brand.toLowerCase().includes(kw) || r.categories.join(" ").toLowerCase().includes(kw) || r.healthIssues.toLowerCase().includes(kw) || r.foodAllergies.toLowerCase().includes(kw);
      if (!match) return false;
      if (categoryFilter === "all") return true;
      return r.categories.includes(categoryFilter);
    });
  }, [rows, searchText, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / PRODUCT_PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const paged = filteredRows.slice((safePage - 1) * PRODUCT_PAGE_SIZE, safePage * PRODUCT_PAGE_SIZE);

  const handleDeleteClick = (id: string, foodName: string) => setDeleteTarget({ id, foodName });

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await baseApi.delete(`${ENDPOINTS.product}${deleteTarget.id}/`);
      setRows((prev) => prev.filter((r) => r.id !== deleteTarget.id));
      toast.success("Product deleted");
      setDeleteTarget(null);
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.message || "Failed to delete" : "Failed to delete";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]">Product Management</h2>
          <Link href="/admin/productManagement/new" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-medium text-[#2f343a]">
            <FiPlus /> Add Recommendation
          </Link>
        </div>

        <div className="p-3 sm:p-4">
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center">
            <div className="flex h-11 flex-1 items-center rounded-xl border border-[#d8dde4] bg-white px-3">
              <FiSearch className="mr-2 text-[#7d8592]" />
              <input value={searchText} onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }} placeholder="Search products..." className="w-full bg-transparent text-sm text-[#3a4048] outline-none placeholder:text-[#9aa3ad]" />
            </div>

            <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setCurrentPage(1); }} className="h-11 rounded-xl border border-[#d8dde4] bg-white px-4 text-sm text-[#3a4048] outline-none">
              <option value="all">All Categories</option>
              {Array.from(new Set(rows.flatMap((r) => r.categories))).map((c) => (<option key={c} value={c}>{c}</option>))}
            </select>
          </div>

          {fetchError ? <p className="mb-3 rounded-lg border border-[#fecaca] bg-[#fef2f2] px-3 py-2 text-sm text-[#b91c1c]">{fetchError}</p> : null}

          <div className="overflow-x-auto rounded-2xl border border-[#d8dde4] bg-white">
            <table className="w-full min-w-240 border-collapse">
              <thead>
                <tr className="border-b border-[#e0e5ea] text-left">
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Food Name</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Brand</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Price</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Category</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Health Issues</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Food Allergies</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Lifestage</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Status</th>
                  <th className="px-3 py-3 text-sm font-medium text-[#232a33] sm:px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#7d8592]">Loading products...</td></tr>
                ) : paged.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-8 text-center text-sm text-[#7d8592]">No products found.</td></tr>
                ) : paged.map((row) => (
                  <tr key={row.id} className="border-b border-[#edf1f4] last:border-b-0">
                    <td className="max-w-44 truncate px-3 py-3 text-[13px] font-medium text-[#2f343a] sm:px-4">{row.foodName}</td>
                    <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">{row.brand}</td>
                    <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">${row.price}</td>
                    <td className="px-3 py-3 sm:px-4"><div className="flex flex-wrap gap-1">{row.categories.map((c)=> (<span key={`${row.id}-${c}`} className="inline-flex rounded-full px-3 py-1 text-[11px] bg-[#f8fafc] text-[#5f6670] border border-[#d8dde4]">{c}</span>))}</div></td>
                    <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4 max-w-xs truncate" title={row.healthIssues}>{row.healthIssues || "-"}</td>
                    <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4 max-w-xs truncate" title={row.foodAllergies}>{row.foodAllergies || "-"}</td>
                    <td className="px-3 py-3 text-[13px] text-[#6f7680] sm:px-4">{row.lifestage ?? "-"}</td>
                    <td className="px-3 py-3 sm:px-4"><span className={`inline-flex rounded-full px-3 py-1 text-[11px] font-medium ${row.status === 'Active' ? 'bg-[#e6f8ee] text-[#1e8b4b] border border-[#beeacc]' : 'bg-[#f1f3f6] text-[#6f7885] border border-[#dde3ea]'}`}>{row.status}</span></td>
                    <td className="px-3 py-3 sm:px-4">
                      <div className="flex items-center gap-2">
                        <Link href={`/admin/productManagement/${row.id}`} className="text-[#2668e3]" aria-label={`Edit ${row.foodName}`}><FiEdit2 size={15} /></Link>
                        <button type="button" onClick={() => handleDeleteClick(row.id, row.foodName)} className="text-[#ef4444]" aria-label={`Delete ${row.foodName}`}><FiTrash2 size={15} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-col gap-2 px-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-[#7d8592]">Page {safePage} of {totalPages}</p>
            <div className="flex items-center gap-1 self-end sm:self-auto">
              <button type="button" onClick={() => setCurrentPage((p) => Math.max(1, p-1))} disabled={safePage === 1} className="h-8 rounded-lg border border-[#d8dde4] bg-white px-3 text-sm text-[#5f6670]">Prev</button>
              {Array.from({length: totalPages}, (_,i)=>i+1).map((n) => (<button key={n} onClick={() => setCurrentPage(n)} className={`h-8 min-w-8 rounded-lg border px-2 text-sm ${n===safePage?'border-[#b76424] bg-[#b76424] text-white':'border-[#d8dde4] bg-white text-[#5f6670]'}`}>{n}</button>))}
              <button type="button" onClick={() => setCurrentPage((p) => Math.min(totalPages, p+1))} disabled={safePage === totalPages} className="h-8 rounded-lg border border-[#d8dde4] bg-white px-3 text-sm text-[#5f6670]">Next</button>
            </div>
          </div>
        </div>
      </section>

      {deleteTarget ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-[0_20px_50px_rgba(0,0,0,0.2)]">
            <h3 className="text-lg font-semibold text-[#232a33]">Delete Product</h3>
            <p className="mt-2 text-sm text-[#5f6670]">Are you sure you want to delete <span className="font-medium text-[#232a33]">{deleteTarget.foodName}</span>?</p>
            <p className="mt-1 text-xs text-[#9aa3ad]">This action cannot be undone.</p>
            <div className="mt-5 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setDeleteTarget(null)} disabled={isDeleting} className="h-9 rounded-lg border border-[#d8dde4] bg-white px-4 text-sm text-[#5f6670]">Cancel</button>
              <button type="button" onClick={() => void handleConfirmDelete()} disabled={isDeleting} className="h-9 rounded-lg bg-[#dc2626] px-4 text-sm font-medium text-white">{isDeleting? 'Deleting...' : 'Yes, Delete'}</button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
