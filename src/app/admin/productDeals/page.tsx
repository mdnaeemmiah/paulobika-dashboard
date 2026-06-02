/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useRef, useState } from "react";
import { FiX } from "react-icons/fi";
import { LuUpload } from "react-icons/lu";
import { toast } from "sonner";

type DealItem = {
  id: string;
  title: string;
  discount: string;
  promoCode: string;
  image: string;
  isActive: boolean;
};

const STATIC_DEALS: DealItem[] = [
  {
    id: "deal-1",
    title: "Puppy Starter Pack",
    discount: "25%",
    promoCode: "PAWSTART",
    image: "",
    isActive: true,
  },
  {
    id: "deal-2",
    title: "Senior Dog Care",
    discount: "15%",
    promoCode: "SENIOR15",
    image: "",
    isActive: false,
  },
  {
    id: "deal-3",
    title: "Healthy Treats",
    discount: "30%",
    promoCode: "TREAT30",
    image: "",
    isActive: true,
  },
];

export default function ProductDealsPage() {
  const [deals, setDeals] = useState<DealItem[]>([]);
  const [isLoadingDeals, setIsLoadingDeals] = useState(true);
  const [selectedDealId, setSelectedDealId] = useState<string>("");
  const [title, setTitle] = useState("");
  const [discount, setDiscount] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [active, setActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const applyDealToForm = (deal: DealItem) => {
    setSelectedDealId(deal.id);
    setTitle(deal.title);
    setDiscount(deal.discount);
    setPromoCode(deal.promoCode);
    setActive(deal.isActive);
    setImagePreview(deal.image || null);
    setSelectedImageFile(null);

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  useEffect(() => {
    const initialDeals = STATIC_DEALS;
    setDeals(initialDeals);
    if (initialDeals.length > 0) {
      applyDealToForm(initialDeals[0]);
    }
    setIsLoadingDeals(false);
  }, []);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    const localPreviewUrl = URL.createObjectURL(selectedFile);
    setImagePreview(localPreviewUrl);
    setSelectedImageFile(selectedFile);
  };

  const handleClearPreview = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault();
    event.stopPropagation();

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImagePreview(null);
    setSelectedImageFile(null);
    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedDealId) {
      toast.error("No product deal selected to update");
      return;
    }

    if (!title.trim()) {
      toast.error("Title is required");
      return;
    }

    setIsSubmitting(true);
    try {
      setDeals((prev) =>
        prev.map((deal) =>
          deal.id === selectedDealId
            ? {
                ...deal,
                title: title.trim(),
                discount: discount.trim(),
                promoCode: promoCode.trim(),
                isActive: active,
                image: imagePreview || deal.image,
              }
            : deal,
        ),
      );
      toast.success("Product deal updated successfully");
    } catch (error) {
      console.error("Failed to update product deal", error);
      toast.error("Failed to update product deal");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <h2 className="text-[22px] leading-none font-semibold text-white sm:text-[28px]">
            Product Deals
          </h2>
        </div>

        <div className="p-4 sm:p-5">
          <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-[#d8dde4] bg-[#f7f7f8] p-4 sm:p-6">
            <div className="space-y-2">
              <p className="text-[18px] text-[#2d323a]">Existing Deals</p>
              {isLoadingDeals ? (
                <p className="text-[14px] text-[#6b7280]">Loading deals...</p>
              ) : deals.length === 0 ? (
                <p className="text-[14px] text-[#6b7280]">No existing product deals found.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {deals.map((deal) => {
                    const isSelected = deal.id === selectedDealId;
                    return (
                      <button
                        key={deal.id}
                        type="button"
                        onClick={() => applyDealToForm(deal)}
                        className={`rounded-lg border px-3 py-1.5 text-[13px] transition-colors ${
                          isSelected
                            ? "border-[#b76424] bg-[#f8e5d6] text-[#8f4a1d]"
                            : "border-[#d8dde4] bg-white text-[#4b5563] hover:bg-[#eef2f7]"
                        }`}
                      >
                        {deal.title || `Deal #${deal.id}`}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="title" className="text-[20px]  text-[#2d323a]">
                Title
              </label>
              <input
                id="title"
                type="text"
                placeholder="e.g. Special Offer"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="discount" className="text-[20px]  text-[#2d323a] ">
                Percentage of Discount
              </label>
              <input
                id="discount"
                type="text"
                placeholder="e.g. 30% Off First Order"
                value={discount}
                onChange={(event) => setDiscount(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="promoCode" className="text-[20px]  text-[#2d323a]">
                Promo Code
              </label>
              <input
                id="promoCode"
                type="text"
                placeholder="e.g. PAWFOOD30"
                value={promoCode}
                onChange={(event) => setPromoCode(event.target.value)}
                className="h-11 w-full rounded-xl border border-[#d8dde4] bg-[#eceef2] px-3 text-[14px] text-[#3a4048] outline-none placeholder:text-[#a1a8b2]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="image" className="text-[20px]  text-[#2d323a]">
                Image Upload
              </label>

              <label
                htmlFor="image"
                className="flex h-34 w-full cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dde4] bg-[#f8f9fb] text-[#8f97a3]"
              >
                {imagePreview ? (
                  <span className="relative block h-30 w-30 overflow-hidden rounded-xl border border-[#d8dde4]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={imagePreview} alt="Deal preview" className="h-full w-full object-cover" />
                    <button
                      type="button"
                      onClick={handleClearPreview}
                      className="absolute top-1 right-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/55 text-white"
                      aria-label="Remove image"
                    >
                      <FiX size={14} />
                    </button>
                    </span>
                ) : (
                  <>
                    <LuUpload className="mb-2 text-[22px]" />
                    <span className="text-[13px]">Click or drag to upload image</span>
                  </>
                )}
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
                ref={imageInputRef}
              />
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[20px]  text-[#2d323a]">Status</span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(event) => setActive(event.target.checked)}
                  disabled={!selectedDealId}
                  className="peer sr-only"
                />
                <span className="h-6 w-11 rounded-full bg-[#c6ccd4] transition-colors after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all peer-checked:bg-[#b76424] peer-checked:after:translate-x-5" />
              </label>
              <span className={`text-[20px]  ${active ? "text-[#b76424]" : "text-[#8d95a0]"}`}>
                {active ? "Active" : "Inactive"}
              </span>
            </div>

            <div className="flex flex-row gap-3 pt-1">
              <button
                type="submit"
                disabled={!selectedDealId || isSubmitting}
                className="inline-flex h-11 min-w-36 items-center justify-center rounded-xl bg-[#b76424] px-8 text-[20px] font-medium text-white"
              >
                {isSubmitting ? "Updating..." : "Update"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const selected = deals.find((item) => item.id === selectedDealId);
                  if (selected) {
                    applyDealToForm(selected);
                  }
                }}
                className="inline-flex h-11 min-w-36 items-center justify-center rounded-xl border border-[#d8dde4] bg-[#f7f7f8] px-8 text-[20px] font-medium text-[#2d323a]"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
