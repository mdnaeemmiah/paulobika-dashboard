/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";
import { LIFESTAGE_OPTIONS } from "@/src/app/admin/productManagement/productData";

const resolveImageUrl = (value: unknown): string => {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("//")) {
    const absolute = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;
    try {
      const u = new URL(absolute);
      if (u.hostname === '34.234.152.253') {
        u.hostname = 'api.everidog.com';
        return u.toString();
      }
    } catch {
      // ignore
    }
    return absolute;
  }

  const baseUrl = baseApi?.defaults?.baseURL || ENDPOINTS?.BASEURL || process.env.NEXT_PUBLIC_API_URL || "";
  // If the path looks like a media path, force the known API domain so TLS and host match
  if (trimmed.startsWith("/media") || trimmed.startsWith("media/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || ENDPOINTS?.BASEURL || baseApi?.defaults?.baseURL || "https://api.everidog.com";
    try {
      return new URL(trimmed, apiHost).toString();
    } catch {
      return apiHost.replace(/\/$/, "") + (trimmed.startsWith("/") ? trimmed : `/${trimmed}`);
    }
  }

  if (!baseUrl) return trimmed;

  try {
    return new URL(trimmed, baseUrl).toString();
  } catch {
    return trimmed;
  }
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [brokenImage, setBrokenImage] = useState(false);

  const normalizeCategoryForForm = (cat: unknown): string => {
    if (Array.isArray(cat)) {
      // if array contains a single string that's actually a stringified array, try to parse it
      if (cat.length === 1 && typeof cat[0] === 'string' && /^[\s]*\[/.test(cat[0])) {
        try {
          const parsed = JSON.parse(cat[0]);
          if (Array.isArray(parsed)) return parsed.map((c) => String(c).trim()).filter(Boolean).join(', ');
        } catch {
          // fallthrough
        }
      }
      return cat.map((c) => String(c).trim()).filter(Boolean).join(', ');
    }
    if (typeof cat === 'string') {
      // if string looks like a JSON array, parse it
      const s = cat.trim();
      if (/^[\[]/.test(s)) {
        try {
          const parsed = JSON.parse(s);
          if (Array.isArray(parsed)) return parsed.map((c) => String(c).trim()).filter(Boolean).join(', ');
        } catch {
          // fallthrough
        }
      }
      return s;
    }
    return '';
  };

  const normalizeCategoryInput = (input: unknown): string[] => {
    if (Array.isArray(input)) return input.map((c) => String(c).trim()).filter(Boolean);
    if (typeof input !== 'string') return [];
    // try to parse if it's JSON
    const s = input.trim();
    if (/^[\[]/.test(s)) {
      try {
        const parsed = JSON.parse(s);
        if (Array.isArray(parsed)) return parsed.map((c) => String(c).trim()).filter(Boolean);
      } catch {
        // fallthrough
      }
    }
    // split comma-separated
    return s.split(',').map((x) => x.trim()).filter(Boolean);
  };

  useEffect(() => {
    if (!id) return;
    let mounted = true;
    (async () => {
      try {
        const res = await baseApi.get(`${ENDPOINTS.product}${id}/`);
        if (!mounted) return;
        const data = res.data;
        setForm({
          name: data.name ?? "",
          brand: data.brand ?? "",
          category: normalizeCategoryForForm(data.category),
          health_issues: normalizeCategoryForForm(data.health_issues),
          food_allergies: normalizeCategoryForForm(data.food_allergies),
          price: data.price ?? "",
          lifestage: data.lifestage ?? "",
          grain_free: Boolean(data.grain_free),
          protein_percentage: data.protein_percentage ?? "",
          fat_percentage: data.fat_percentage ?? "",
          calories_per_hundred_grams: data.calories_per_hundred_grams ?? "",
          status: data.status ?? "active",
          image: data.image ?? "",
          ingredients: data.ingredients ?? "",
          benefits: Array.isArray(data.benefits) ? data.benefits.join(", ") : (data.benefits || ""),
          why_recommended: data.why_recommended ?? "",
          source_link: data.source_link ?? "",
        });
        // set preview from existing image url
        if (data.image) setImagePreview(resolveImageUrl(data.image) || null);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Failed to load product");
      } finally {
        setIsLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [id]);

  const handleChange = (k: string, v: any) => setForm((s: any) => ({ ...s, [k]: v }));

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
    setForm((s:any) => ({ ...s, image: "" }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    setIsSubmitting(true);

    try {
      // if an image file was selected, send multipart/form-data
        if (selectedImageFile) {
        const fd = new FormData();
        fd.append("image", selectedImageFile);
        fd.append("name", form.name);
        fd.append("brand", form.brand);
        fd.append("category", JSON.stringify(normalizeCategoryInput(form.category)));
        const healthIssuesArr = normalizeCategoryInput(form.health_issues);
        if (healthIssuesArr.length > 0) fd.append("health_issues", JSON.stringify(healthIssuesArr));
        const foodAllergiesArr = normalizeCategoryInput(form.food_allergies);
        if (foodAllergiesArr.length > 0) fd.append("food_allergies", JSON.stringify(foodAllergiesArr));
        fd.append("price", form.price);
        fd.append("lifestage", form.lifestage);
        fd.append("grain_free", String(Boolean(form.grain_free)));
        fd.append("protein_percentage", form.protein_percentage);
        fd.append("fat_percentage", form.fat_percentage);
        fd.append("calories_per_hundred_grams", form.calories_per_hundred_grams);
        fd.append("status", form.status);
        fd.append("ingredients", form.ingredients);
        const benefitsArr = (form as any).benefits?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [];
        if (benefitsArr.length > 0) fd.append("benefits", JSON.stringify(benefitsArr));
        fd.append("why_recommended", form.why_recommended);
        fd.append("source_link", form.source_link);

        await baseApi.patch(`${ENDPOINTS.product}${id}/`, fd, { headers: { "Content-Type": "multipart/form-data" } });
        } else {
        const benefitsArr = (form as any).benefits?.split(",").map((s: string) => s.trim()).filter(Boolean) ?? [];
        const payload: any = {
          name: form.name,
          brand: form.brand,
          category: normalizeCategoryInput(form.category),
          health_issues: normalizeCategoryInput(form.health_issues),
          food_allergies: normalizeCategoryInput(form.food_allergies),
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
        if (form.image && (form.image as string).trim()) payload.image = (form.image as string).trim();
        payload.why_recommended = form.why_recommended;
        payload.source_link = form.source_link;

        await baseApi.patch(`${ENDPOINTS.product}${id}/`, payload);
      }

      toast.success("Product updated");
      router.push("/admin/productManagement");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update product");
    } finally {
      setIsSubmitting(false);
    }
  };

  // const handleDelete = async () => {
  //   if (!id) return;
  //   setIsDeleting(true);
  //   try {
  //     await baseApi.delete(`${ENDPOINTS.product}${id}/`);
  //     toast.success("Product deleted");
  //     router.push("/admin/productManagement");
  //   } catch (err: any) {
  //     toast.error(err?.response?.data?.message || "Failed to delete product");
  //   } finally {
  //     setIsDeleting(false);
  //   }
  // };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  if (isLoading) return <div className="p-4">Loading...</div>;
  if (!form) return <div className="p-4">Product not found.</div>;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Edit Product</h1>
        <button type="button" onClick={() => router.push('/admin/productManagement')} className="rounded-lg border px-3 py-1">Back</button>
      </div>
      <form onSubmit={handleSave} className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
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
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Health Issues</label>
              <input value={form.health_issues} onChange={(e) => handleChange("health_issues", e.target.value)} placeholder="Health issues (comma separated)" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Food Allergies</label>
              <input value={form.food_allergies} onChange={(e) => handleChange("food_allergies", e.target.value)} placeholder="Food allergies (comma separated)" className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full" />
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

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2d323a]">Ingredients</label>
            <textarea value={form.ingredients} onChange={(e) => handleChange("ingredients", e.target.value)} placeholder="Ingredients" className="h-28 w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2d323a]">Benefits</label>
            <input value={form.benefits} onChange={(e) => handleChange("benefits", e.target.value)} placeholder="Benefits (comma separated)" className="h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2d323a]">Why Recommended</label>
            <textarea value={form.why_recommended} onChange={(e) => handleChange("why_recommended", e.target.value)} placeholder="Why recommended" className="h-28 w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm" />
          </div>
        </div>

        <aside className="space-y-3">
          <label className="block text-sm font-medium text-[#2d323a]">Image</label>
          <label htmlFor="image" className="flex h-44 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dde4] bg-[#f8f9fb] text-[#8f97a3]">
            {imagePreview ? (
              <div className="relative h-full w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {(() => {
                  try {
                    const u = imagePreview ? new URL(imagePreview, window.location.origin) : null;
                    const isExternal = u ? (u.origin !== window.location.origin) : false;
                    const resolved = u ? u.toString() : imagePreview;
                    const src = resolved && isExternal ? `/api/image-proxy?url=${encodeURIComponent(resolved)}` : resolved || undefined;
                    return <img src={src} alt="Preview" onError={() => setBrokenImage(true)} onLoad={() => setBrokenImage(false)} className="h-full w-full object-cover rounded-xl" />;
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
          {/* <div className="text-xs text-[#6f7680]">
            <div>Raw image value: <span className="break-all">{form.image || "(empty)"}</span></div>
            <div>Resolved URL: <span className="break-all">{imagePreview || "(none)"}</span></div>
            {brokenImage ? <div className="text-[#ef4444]">Image failed to load (broken URL or CORS).</div> : null}
          </div> */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-[#2d323a]">Source link</label>
            <input value={form.source_link} onChange={(e) => handleChange("source_link", e.target.value)} placeholder="Source link" className="h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm" />
          </div>

          <div className="flex items-center justify-end gap-2">
            <button type="button" onClick={() => router.push("/admin/productManagement")} className="rounded-xl border border-[#d8dde4] bg-white px-4 py-2">Cancel</button>
            {/* <button type="button" onClick={() => void handleDelete()} disabled={isDeleting} className="rounded-xl bg-[#dc2626] px-4 py-2 text-white">{isDeleting ? 'Deleting...' : 'Delete'}</button> */}
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#b76424] px-4 py-2 text-white">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
