/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { LIFESTAGE_OPTIONS } from "@/src/app/admin/productManagement/productData";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [brokenImage, setBrokenImage] = useState(false);
  const [form, setForm] = useState({
    name: "",
    brand: "",
    category: "",
    image: "",
    price: "",
    lifestage: "",
    grain_free: false,
    protein_percentage: "",
    fat_percentage: "",
    calories_per_hundred_grams: "",
    status: "active",
    ingredients: "",
    benefits: "",
    why_recommended: "",
    source_link: "",
  });

  const handleChange = (k: string, v: any) => setForm((s) => ({ ...s, [k]: v }));

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    const url = URL.createObjectURL(file);
    setImagePreview(url);
    setSelectedImageFile(file);
  };

  const clearImage = () => {
    if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (selectedImageFile) {
        const fd = new FormData();
        fd.append("image", selectedImageFile);
        fd.append("name", form.name);
        fd.append("brand", form.brand);
        fd.append("category", JSON.stringify(form.category.split(",").map((s) => s.trim()).filter(Boolean)));
        fd.append("price", form.price);
        fd.append("lifestage", form.lifestage);
        fd.append("grain_free", String(Boolean(form.grain_free)));
        fd.append("protein_percentage", form.protein_percentage);
        fd.append("fat_percentage", form.fat_percentage);
        fd.append("calories_per_hundred_grams", form.calories_per_hundred_grams);
        fd.append("status", form.status);
        fd.append("ingredients", form.ingredients);
        const benefitsArr = form.benefits.split(",").map((s) => s.trim()).filter(Boolean);
        if (benefitsArr.length > 0) fd.append("benefits", JSON.stringify(benefitsArr));
        fd.append("why_recommended", form.why_recommended);
        fd.append("source_link", form.source_link);

        await baseApi.post(ENDPOINTS.product, fd, { headers: { "Content-Type": "multipart/form-data" } });
      } else {
        const benefitsArr = form.benefits.split(",").map((s) => s.trim()).filter(Boolean);
        const payload: any = {
          name: form.name,
          brand: form.brand,
          category: form.category.split(",").map((s) => s.trim()).filter(Boolean),
          price: form.price,
          lifestage: form.lifestage,
          grain_free: Boolean(form.grain_free),
          protein_percentage: form.protein_percentage,
          fat_percentage: form.fat_percentage,
          calories_per_hundred_grams: form.calories_per_hundred_grams,
          status: form.status,
          ingredients: form.ingredients,
        };

        if (benefitsArr.length > 0) payload.benefits = benefitsArr;
        if (form.image && form.image.trim()) payload.image = form.image.trim();
        // ensure benefits/why_recommended/source_link when present
        payload.why_recommended = form.why_recommended;
        payload.source_link = form.source_link;
        await baseApi.post(ENDPOINTS.product, payload);
      }

      toast.success("Product created");
      router.push("/admin/productManagement");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || "Failed to create product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Add New Product</h1>
        <button type="button" onClick={() => router.push('/admin/productManagement')} className="rounded-lg border px-3 py-1">Back</button>
      </div>
      <form onSubmit={handleSubmit} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Name</label>
              <input required value={form.name} onChange={(e) => handleChange("name", e.target.value)} placeholder="Name" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Brand</label>
              <input value={form.brand} onChange={(e) => handleChange("brand", e.target.value)} placeholder="Brand" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Categories</label>
              <input value={form.category} onChange={(e) => handleChange("category", e.target.value)} placeholder="Categories (comma separated)" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Price</label>
              <input value={form.price} onChange={(e) => handleChange("price", e.target.value)} placeholder="Price" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Lifestage</label>
              <select value={form.lifestage} onChange={(e) => handleChange("lifestage", e.target.value)} className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full">
                {(() => {
                  const opts = LIFESTAGE_OPTIONS.slice();
                  if (form.lifestage && !opts.includes(form.lifestage)) opts.push(form.lifestage);
                  return opts.map((o) => <option key={o} value={o}>{o === "" ? "Select" : (o.charAt(0).toUpperCase() + o.slice(1))}</option>);
                })()}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Status</label>
              <select value={form.status} onChange={(e) => handleChange("status", e.target.value)} className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
              </select>
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.grain_free} onChange={(e) => handleChange("grain_free", e.target.checked)} /> <span className="ml-1">Grain free</span></label>
            </div>
          </div>

          <textarea value={form.ingredients} onChange={(e) => handleChange("ingredients", e.target.value)} placeholder="Ingredients" className="h-28 w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm" />
          <input value={form.benefits} onChange={(e) => handleChange("benefits", e.target.value)} placeholder="Benefits (comma separated)" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm" />
          <textarea value={form.why_recommended} onChange={(e) => handleChange("why_recommended", e.target.value)} placeholder="Why recommended" className="h-28 w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm" />
        </div>

        <aside className="space-y-3">
          <label className="block text-sm font-medium text-[#2d323a]">Image</label>
          <label htmlFor="image" className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dde4] bg-[#f8f9fb] text-[#8f97a3]">
            {imagePreview ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(() => {
                  try {
                    // Resolve URL relative to current origin, then proxy if external
                    const u = imagePreview ? new URL(imagePreview, window.location.origin) : null;
                    const isExternal = u ? (u.origin !== window.location.origin) : false;
                    const resolved = u ? u.toString() : imagePreview;
                    const src = resolved && isExternal ? `/api/image-proxy?url=${encodeURIComponent(resolved)}` : resolved;
                    return <img src={src || undefined} alt="Preview" onError={() => setBrokenImage(true)} onLoad={() => setBrokenImage(false)} className="h-full w-full object-cover rounded-xl" />;
                  } catch {
                    return <img src={imagePreview || undefined} alt="Preview" onError={() => setBrokenImage(true)} onLoad={() => setBrokenImage(false)} className="h-full w-full object-cover rounded-xl" />;
                  }
                })()}
                <button type="button" onClick={(e) => { e.preventDefault(); clearImage(); }} className="absolute top-2 right-2 rounded-full bg-black/60 p-1 text-white">Remove</button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2">
                <svg width="34" height="34" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="#9aa3ad" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M5 10l7-7 7 7" stroke="#9aa3ad" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                <span className="text-[13px]">Click to upload image</span>
              </div>
            )}
          </label>
          <input id="image" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />

          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2d323a]">Source link</label>
            <input value={form.source_link} onChange={(e) => handleChange("source_link", e.target.value)} placeholder="Source link" className="h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => router.push("/admin/productManagement")} className="rounded-xl border border-[#d8dde4] bg-white px-4 py-2">Cancel</button>
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#b76424] px-4 py-2 text-white">{isSubmitting ? 'Saving...' : 'Create Product'}</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
