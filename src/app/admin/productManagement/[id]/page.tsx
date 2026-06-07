/* eslint-disable @typescript-eslint/no-explicit-any, @next/next/no-img-element */
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

  const urlMatch = trimmed.match(/https?:\/\/[^\s"')\]]+/i);
  const candidate = urlMatch?.[0] ?? trimmed.replace(/^["'\[]+/, "").replace(/["'\]\)]+$/, "");

  if (!candidate) return "";
  if (/^https?:\/\//i.test(candidate) || candidate.startsWith("//")) {
    const absolute = candidate.startsWith("//") ? `https:${candidate}` : candidate;
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
  if (candidate.startsWith("/media") || candidate.startsWith("media/")) {
    const apiHost = process.env.NEXT_PUBLIC_API_URL || ENDPOINTS?.BASEURL || baseApi?.defaults?.baseURL || "https://api.everidog.com";
    try {
      return new URL(candidate, apiHost).toString();
    } catch {
      return apiHost.replace(/\/$/, "") + (candidate.startsWith("/") ? candidate : `/${candidate}`);
    }
  }

  if (!baseUrl) return trimmed;

  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return candidate;
  }
};

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

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
          good_for: data.good_for ?? "",
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

  const toCommaSeparatedText = (value: unknown) => {
    if (Array.isArray(value)) {
      return value.map((item) => String(item).trim()).filter(Boolean).join(", ");
    }

    if (typeof value === "string") {
      return value.trim();
    }

    return "";
  };

  const buildEditPayload = () => {
    const payload = new FormData();

    payload.append("name", String(form?.name ?? ""));
    payload.append("brand", String(form?.brand ?? ""));
    payload.append("category", toCommaSeparatedText(form?.category));
    payload.append("health_issues", toCommaSeparatedText(form?.health_issues));
    payload.append("food_allergies", toCommaSeparatedText(form?.food_allergies));
    payload.append("good_for", String(form?.good_for ?? ""));
    payload.append("price", String(form?.price ?? ""));
    payload.append("lifestage", String(form?.lifestage ?? ""));
    payload.append("grain_free", String(Boolean(form?.grain_free)));
    payload.append("protein_percentage", String(form?.protein_percentage ?? ""));
    payload.append("fat_percentage", String(form?.fat_percentage ?? ""));
    payload.append("calories_per_hundred_grams", String(form?.calories_per_hundred_grams ?? ""));
    payload.append("status", String(form?.status ?? "active"));
    payload.append("ingredients", String(form?.ingredients ?? ""));
    payload.append("benefits", toCommaSeparatedText(form?.benefits));
    payload.append("why_recommended", String(form?.why_recommended ?? ""));
    payload.append("source_link", String(form?.source_link ?? ""));

    if (selectedImageFile) {
      payload.append("image", selectedImageFile);
    }

    return payload;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }
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
      const payload = buildEditPayload();

      await baseApi.patch(`${ENDPOINTS.product}${id}/`, payload, {
        headers: { "Content-Type": "multipart/form-data" },
      });

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
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Protein %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.protein_percentage}
                onChange={(e) => handleChange("protein_percentage", e.target.value)}
                placeholder="e.g. 20.00"
                className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Fat %</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="100"
                value={form.fat_percentage}
                onChange={(e) => handleChange("fat_percentage", e.target.value)}
                placeholder="e.g. 4.00"
                className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full"
              />
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-[#2d323a]">Calories / 100g</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.calories_per_hundred_grams}
                onChange={(e) => handleChange("calories_per_hundred_grams", e.target.value)}
                placeholder="e.g. 200.00"
                className="h-11 rounded-xl border border-[#d8dde4] bg-white px-3 text-sm w-full"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2d323a]">Ingredients</label>
            <textarea value={form.ingredients} onChange={(e) => handleChange("ingredients", e.target.value)} placeholder="Ingredients" className="h-28 w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm" />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-[#2d323a]">Good For</label>
            <input
              value={form.good_for || ""}
              onChange={(e) => handleChange("good_for", e.target.value)}
              placeholder="Good for"
              className="h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm"
            />
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
                {(() => {
                  try {
                    const u = imagePreview ? new URL(imagePreview, window.location.origin) : null;
                    const isExternal = u ? (u.origin !== window.location.origin) : false;
                    const resolved = u ? u.toString() : imagePreview;
                    const src = resolved && isExternal ? `/api/image-proxy?url=${encodeURIComponent(resolved)}` : resolved || undefined;
                    return <img src={src} alt="Preview" className="h-full w-full object-cover rounded-xl" />;
                  } catch {
                    return <img src={imagePreview || undefined} alt="Preview" className="h-full w-full object-cover rounded-xl" />;
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
            <button type="submit" disabled={isSubmitting} className="rounded-xl bg-[#b76424] px-4 py-2 text-white">{isSubmitting ? 'Saving...' : 'Save Changes'}</button>
          </div>
        </aside>
      </form>
    </div>
  );
}
