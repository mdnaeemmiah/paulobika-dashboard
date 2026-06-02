"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import { FiChevronLeft } from "react-icons/fi";
import { toast } from "sonner";
import { DOG_INFORMATION_OPTIONS } from "../../dogInformation/dogInformationData";
import {
  type ProductPlatform,
  type ProductStatus,
  PRODUCT_CATEGORY_OPTIONS,
  PRODUCT_TABLE_ROWS,
} from "../productData";

type ProductFormState = {
  id: string;
  foodName: string;
  brand: string;
  category: string;
  ingredient: string;
  categoryId: string;
  benefits: string;
  whyRecommended: string;
  thingsToConsider: string;
  allergyTags: string;
  budgetTag: string;
  price: string;
  sub_price: string;
  discount_label: string;
  image: string;
  chewyLink: string;
  zooplusLink: string;
  description: string;
  status: ProductStatus;
  platform: ProductPlatform;
};

type ProductFormField = keyof ProductFormState;
type ProductFormFieldErrors = Partial<Record<ProductFormField, string>>;

type AllergyOption = {
  id: string;
  name: string;
};

type FoodCategoryOption = {
  id: string;
  name: string;
};

const budgetOptions = [
  {
    type: "budget",
    label: "Budget",
    description: "Under $30/month",
  },
  {
    type: "premium",
    label: "Premium",
    description: "$30-$80/month",
  },
  {
    type: "no_preference",
    label: "No Preference",
    description: "Show me everything",
  },
];

const STATIC_CATEGORIES: FoodCategoryOption[] = PRODUCT_CATEGORY_OPTIONS.map((name, index) => ({
  id: String(index + 1),
  name,
}));

const STATIC_ALLERGIES: AllergyOption[] = DOG_INFORMATION_OPTIONS.foodAllergies.map((name) => ({
  id: name,
  name,
}));

const STATIC_PRODUCTS = PRODUCT_TABLE_ROWS.map((row, index) => ({
  id: String(index + 1),
  foodName: row.foodName,
  brand: row.brand,
  category: row.category,
  ingredient: row.ingredient,
  benefits: row.benefits,
  whyRecommended: row.whyRecommended,
  thingsToConsider: row.thingsToConsider,
  allergyTags: row.allergyTags,
  budgetTag: row.budgetTag,
  description: row.description,
  status: row.status,
  platform: row.platform,
  affiliateUrl: row.affiliateUrl,
}));

const emptyForm: ProductFormState = {
  id: "new",
  foodName: "",
  brand: "",
  category: "Dry",
  categoryId: "",
  ingredient: "Turkey",
  benefits: "",
  whyRecommended: "",
  thingsToConsider: "",
  allergyTags: "",
  budgetTag: "",
  price: "",
  sub_price: "",
  discount_label: "",
  image: "",
  chewyLink: "",
  zooplusLink: "",
  description: "",
  status: "Active",
  platform: "" as ProductPlatform,
};

export default function ProductManagementEditPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [allergyOptions, setAllergyOptions] = useState<AllergyOption[]>(STATIC_ALLERGIES);
  const [isLoadingAllergies] = useState(false);
  const [foodCategoryOptions, setFoodCategoryOptions] = useState<FoodCategoryOption[]>(STATIC_CATEGORIES);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  const [isLoadingCategories] = useState(false);
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<ProductFormFieldErrors>({});
  const [isLoadingProduct, setIsLoadingProduct] = useState(params.id !== "new");
  const [productNotFound, setProductNotFound] = useState(false);
  const [formState, setFormState] = useState<ProductFormState>(emptyForm);

  useEffect(() => {
    setAllergyOptions(STATIC_ALLERGIES);
    setFoodCategoryOptions(STATIC_CATEGORIES);
  }, []);

  useEffect(() => {
    if (params.id === "new") {
      setIsLoadingProduct(false);
      setProductNotFound(false);
      setFormState(emptyForm);
      setSelectedCategoryIds([]);
      return;
    }

    setIsLoadingProduct(true);
    setProductNotFound(false);

    const match = STATIC_PRODUCTS.find((item) => item.id === params.id);
    if (!match) {
      setProductNotFound(true);
      setIsLoadingProduct(false);
      return;
    }

    const categoryId = STATIC_CATEGORIES.find((cat) => cat.name === match.category)?.id ?? "";

    setSelectedCategoryIds(categoryId ? [categoryId] : []);
    setFormState({
      ...emptyForm,
      id: match.id,
      foodName: match.foodName,
      brand: match.brand,
      price: "29.99",
      sub_price: "39.99",
      discount_label: "25% OFF",
      status: match.status,
      image: "",
      ingredient: match.ingredient,
      benefits: match.benefits,
      whyRecommended: match.whyRecommended,
      thingsToConsider: match.thingsToConsider,
      chewyLink: match.platform === "Chewy" ? match.affiliateUrl : "",
      zooplusLink: match.platform === "Zooplus" ? match.affiliateUrl : "",
      categoryId,
      allergyTags: match.allergyTags,
      budgetTag: match.budgetTag,
      description: match.description,
      platform: match.platform,
    });

    setIsLoadingProduct(false);
  }, [params.id]);

  useEffect(() => {
    if (!formState.categoryId) {
      return;
    }

    setSelectedCategoryIds((prev) => {
      if (prev.includes(formState.categoryId)) {
        return prev;
      }
      return [...prev, formState.categoryId];
    });
  }, [formState.categoryId]);

  const setField = <K extends keyof ProductFormState>(
    field: K,
    value: ProductFormState[K],
  ) => {
    setFormState((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => {
      if (!prev[field]) {
        return prev;
      }

      return {
        ...prev,
        [field]: "",
      };
    });
  };

  const handleImageFileChange = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    setSelectedImageFile(file);
    setSubmitError("");
    setFieldErrors((prev) => ({ ...prev, image: "" }));

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        setField("image", reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleCategorySelect = (categoryId: string) => {
    const normalized = categoryId.trim();
    if (!normalized) {
      return;
    }

    setSelectedCategoryIds((prev) => {
      if (prev.includes(normalized)) {
        return prev;
      }

      const next = [...prev, normalized];
      setFormState((current) => ({ ...current, categoryId: next[0] ?? "" }));
      setFieldErrors((current) => ({ ...current, categoryId: "" }));
      return next;
    });
  };

  const removeSelectedCategory = (categoryId: string) => {
    setSelectedCategoryIds((prev) => {
      const next = prev.filter((id) => id !== categoryId);
      setFormState((current) => ({ ...current, categoryId: next[0] ?? "" }));
      return next;
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const isEditMode = params.id !== "new";

    setIsSubmitting(true);
    setSubmitError("");
    setFieldErrors({});

    try {
      const validationErrors: ProductFormFieldErrors = {};
      if (!formState.foodName.trim()) {
        validationErrors.foodName = "Food name is required.";
      }
      if (!formState.brand.trim()) {
        validationErrors.brand = "Brand is required.";
      }
      if (!formState.ingredient.trim()) {
        validationErrors.ingredient = "Ingredient is required.";
      }
      if (!formState.price.trim()) {
        validationErrors.price = "Price is required.";
      } else if (Number(formState.price) < 0 || Number.isNaN(Number(formState.price))) {
        validationErrors.price = "Enter a valid price.";
      }
      if (formState.sub_price.trim()) {
        const subPrice = Number(formState.sub_price);
        if (subPrice < 0 || Number.isNaN(subPrice)) {
          validationErrors.sub_price = "Enter a valid sub price.";
        }
      }
      if (
        formState.chewyLink.trim() &&
        !/^https?:\/\//i.test(formState.chewyLink.trim())
      ) {
        validationErrors.chewyLink = "Chewy URL must start with http:// or https://";
      }
      if (
        formState.zooplusLink.trim() &&
        !/^https?:\/\//i.test(formState.zooplusLink.trim())
      ) {
        validationErrors.zooplusLink = "Zooplus URL must start with http:// or https://";
      }

      const categoryIds = selectedCategoryIds.map((id) => id.trim()).filter(Boolean);
      if (categoryIds.length === 0) {
        validationErrors.categoryId = "Category is required.";
      }

      if (Object.keys(validationErrors).length > 0) {
        setFieldErrors(validationErrors);
        toast.error("Please fix the highlighted fields.");
        setIsSubmitting(false);
        return;
      }

      // Static mode: keep all edits in local UI only and navigate back.
      void categoryIds;
      void selectedImageFile;

      toast.success(isEditMode ? "Product updated successfully." : "Product saved successfully.");
      router.push("/admin/productManagement");
    } catch (error: unknown) {





      const fallbackMessage = isEditMode
        ? "Failed to update product. Please try again."
        : "Failed to save product. Please try again.";
      setSubmitError(fallbackMessage);
      toast.error(fallbackMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingProduct) {
    return (
      <div className="min-h-screen">
        <div className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-6">
          <p className="text-[#4b5563]">Loading product details...</p>
        </div>
      </div>
    );
  }

  if (params.id !== "new" && productNotFound) {
    return (
      <div className="min-h-screen">
        <div className="rounded-2xl border border-[#d8dde4] bg-[#f7f8fa] p-6">
          <Link href="/admin/productManagement" className="text-[#b76424]">
            Back to Product Management
          </Link>
          <p className="mt-3 text-[#4b5563]">Product not found.</p>
        </div>
      </div>
    );
  }

  const title =
    params.id === "new" ? "Add Product Details" : "Edit Product Details";

  return (
    <div className="min-h-screen bg-[#f3f5f8]  ">
      <form
        onSubmit={handleSubmit}
        className="overflow-hidden rounded-3xl border border-[#d8dde4] bg-[#f7f8fa] shadow-[0_10px_30px_rgba(17,24,39,0.08)]"
      >
        <div className="bg-linear-to-r from-[#b76424] to-[#cd7b3e] px-4 py-3 sm:px-5">
          <div className="flex items-center gap-2 text-white">
            <Link
              href="/admin/productManagement"
              aria-label="Back to product management"
              className="inline-flex"
            >
              <FiChevronLeft size={22} />
                  <h2 className="text-[20px] leading-none font-semibold text-white sm:text-[24px]">
              {title}
            </h2>
            </Link>
        
          </div>
        </div>

        {submitError ? (
          <p className="px-4 pt-3 text-sm font-medium text-red-600 sm:px-5">{submitError}</p>
        ) : null}

        <div className="grid grid-cols-1 gap-4 p-4 sm:p-5 lg:grid-cols-2 lg:gap-5">
          <div>
            <label
              htmlFor="foodName"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Food Name
            </label>
            <input
              id="foodName"
              value={formState.foodName}
              onChange={(event) => setField("foodName", event.target.value)}
              placeholder="Enter food name"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              required
            />
            {fieldErrors.foodName ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.foodName}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="brand"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Brand
            </label>
            <input
              id="brand"
              value={formState.brand}
              onChange={(event) => setField("brand", event.target.value)}
              placeholder="Enter brand name"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              required
            />
            {fieldErrors.brand ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.brand}</p>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="price"
                className="mb-1 block text-xs font-medium text-[#232a33]"
              >
                Price
              </label>
              <input
                id="price"
                type="number"
                min="0"
                step="0.01"
                value={formState.price}
                onChange={(event) => setField("price", event.target.value)}
                placeholder="29.99"
                className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              />
              {fieldErrors.price ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.price}</p>
              ) : null}
            </div>

            <div>
              <label
                htmlFor="sub_price"
                className="mb-1 block text-xs font-medium text-[#232a33]"
              >
                Sub Price
              </label>
              <input
                id="sub_price"
                type="number"
                min="0"
                step="0.01"
                value={formState.sub_price}
                onChange={(event) => setField("sub_price", event.target.value)}
                placeholder="39.99"
                className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              />
              {fieldErrors.sub_price ? (
                <p className="mt-1 text-xs text-red-600">{fieldErrors.sub_price}</p>
              ) : null}
            </div>
          </div>

          <div>
            <label
              htmlFor="discount_label"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Discount Label
            </label>
            <input
              id="discount_label"
              value={formState.discount_label}
              onChange={(event) => setField("discount_label", event.target.value)}
              placeholder="25% OFF"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
          </div>

          <div className="rounded-2xl border border-[#e0e5ea] bg-white p-3 lg:col-span-2">
            <div className="mb-3 grid grid-cols-1 gap-3">
              <div>
                <label
                  htmlFor="imageUpload"
                  className="mb-1 block text-xs font-medium text-[#232a33]"
                >
                  Upload Image
                </label>
                <input
                  id="imageUpload"
                  type="file"
                  accept="image/*"
                  onChange={handleImageFileChange}
                  className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-2 text-sm text-[#2f343a] file:mr-3 file:rounded-md file:border-0 file:bg-[#f4e3d4] file:px-3 file:py-1 file:text-xs file:font-medium file:text-[#b76424]"
                />
                {fieldErrors.image ? (
                  <p className="mt-1 text-xs text-red-600">{fieldErrors.image}</p>
                ) : null}
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-[#eceff3] bg-[#fafbfc]">
              {formState.image ? (
                <Image
                  src={formState.image}
                  alt="Product preview"
                  width={960}
                  height={480}
                  unoptimized
                  className="mx-auto h-25 w-40 object-cover"
                />
              ) : (
                <div className="flex h-25 items-center justify-center text-sm text-[#8a919b]">
                  Product image preview
                </div>
              )}
              <div className="flex items-center justify-between p-3">
                <div>
                  <p className="text-sm font-semibold text-[#232a33]">
                    {formState.foodName || "Product Name"}
                  </p>
                  <p className="text-xs text-[#6b7280]">{formState.brand || "Brand"}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-semibold text-[#1f2937]">
                    ${formState.price || "29.99"}
                  </p>
                  <p className="text-xs text-[#9aa1ab] line-through">
                    ${formState.sub_price || "39.99"}
                  </p>
                  <span className="inline-block rounded-full bg-[#e9f8ef] px-2 py-0.5 text-[10px] font-semibold text-[#18803a]">
                    {formState.discount_label || "25% OFF"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label
              htmlFor="benefits"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Benefits
            </label>
            <input
              id="benefits"
              value={formState.benefits}
              onChange={(event) => setField("benefits", event.target.value)}
              placeholder="e.g. Gentle on stomach, high moisture content"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="whyRecommended"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Why Recommended
            </label>
            <input
              id="whyRecommended"
              value={formState.whyRecommended}
              onChange={(event) =>
                setField("whyRecommended", event.target.value)
              }
              placeholder="Why this product is recommended"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="thingsToConsider"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Things to Consider
            </label>
            <input
              id="thingsToConsider"
              value={formState.thingsToConsider}
              onChange={(event) =>
                setField("thingsToConsider", event.target.value)
              }
              placeholder="Storage or feeding notes"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
          </div>

          <div>
            <label
              htmlFor="chewyLink"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Affiliate URL (Chewy)
            </label>
            <input
              id="chewyLink"
              value={formState.chewyLink}
              onChange={(event) => setField("chewyLink", event.target.value)}
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
            {fieldErrors.chewyLink ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.chewyLink}</p>
            ) : null}
          </div>
          <div>
            <label
              htmlFor="zooplusLink"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Affiliate URL (Zooplus)
            </label>
            <input
              id="zooplusLink"
              value={formState.zooplusLink}
              onChange={(event) => setField("zooplusLink", event.target.value)}
              placeholder="https://..."
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
            {fieldErrors.zooplusLink ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.zooplusLink}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="category"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Category
            </label>
            <select
              id="category"
              value=""
              onChange={(event) => handleCategorySelect(event.target.value)}
              disabled={isLoadingCategories}
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            >
              <option value="">Select category</option>
              {foodCategoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>

            {selectedCategoryIds.length > 0 ? (
              <div className="mt-2 flex flex-wrap gap-2">
                {selectedCategoryIds.map((categoryId) => {
                  const categoryName =
                    foodCategoryOptions.find((item) => item.id === categoryId)?.name ??
                    categoryId;

                  return (
                    <span
                      key={categoryId}
                      className="inline-flex items-center gap-1 rounded-full border border-[#efd7c5] bg-[#fdf3ec] px-2 py-1 text-xs text-[#8b4a1b]"
                    >
                      {categoryName}
                      <button
                        type="button"
                        onClick={() => removeSelectedCategory(categoryId)}
                        className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full text-[11px] leading-none hover:bg-[#f2dccb]"
                        aria-label={`Remove ${categoryName}`}
                      >
                        x
                      </button>
                    </span>
                  );
                })}
              </div>
            ) : null}
            {fieldErrors.categoryId ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.categoryId}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="ingredient"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Ingredients
            </label>
            <input
              id="ingredient"
              value={formState.ingredient}
              onChange={(event) => setField("ingredient", event.target.value)}
              placeholder="e.g. Turkey, Rice, Oat fiber"
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
            />
            {fieldErrors.ingredient ? (
              <p className="mt-1 text-xs text-red-600">{fieldErrors.ingredient}</p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="allergyTags"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Allergy Tags
            </label>
            <select
              id="allergyTags"
              value={formState.allergyTags}
              onChange={(event) => setField("allergyTags", event.target.value)}
              className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              disabled={isLoadingAllergies}
            >
              <option value="">Select allergy tag</option>
              {formState.allergyTags &&
                !allergyOptions.some(
                  (item) => item.name === formState.allergyTags,
                ) && (
                  <option value={formState.allergyTags}>
                    {formState.allergyTags}
                  </option>
                )}
              {allergyOptions.map((allergy) => (
                <option key={allergy.id} value={allergy.name}>
                  {allergy.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:col-span-2">
            <div>
              <label
                htmlFor="budgetTag"
                className="mb-1 block text-xs font-medium text-[#232a33]"
              >
                Budget Tag
              </label>
              <select
                id="budgetTag"
                value={formState.budgetTag}
                onChange={(event) => setField("budgetTag", event.target.value)}
                className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              >
                <option value="">Select budget</option>
                {formState.budgetTag &&
                  !budgetOptions.some(
                    (item) => item.type === formState.budgetTag,
                  ) && (
                    <option value={formState.budgetTag}>
                      {formState.budgetTag}
                    </option>
                  )}
                {budgetOptions.map((option) => (
                  <option key={option.type} value={option.type}>
                    {option.label} ({option.description})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="status"
                className="mb-1 block text-xs font-medium text-[#232a33]"
              >
                Status
              </label>
              <select
                id="status"
                value={formState.status}
                onChange={(event) =>
                  setField("status", event.target.value as ProductStatus)
                }
                className="h-10 w-full rounded-lg border border-[#e0e5ea] bg-white px-3 text-sm text-[#2f343a] outline-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="lg:col-span-2">
            <label
              htmlFor="description"
              className="mb-1 block text-xs font-medium text-[#232a33]"
            >
              Description
            </label>
            <textarea
              id="description"
              value={formState.description}
              onChange={(event) => setField("description", event.target.value)}
              rows={4}
              placeholder="Enter description"
              className="w-full rounded-lg border border-[#e0e5ea] bg-white px-3 py-2 text-sm text-[#2f343a] outline-none"
            />
          </div>

          <div className="mt-1 flex items-center gap-3 lg:col-span-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-10 rounded-lg bg-[#b76424] px-6 text-sm font-medium text-white transition-colors hover:bg-[#a9551d] disabled:cursor-not-allowed disabled:opacity-70"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </button>

            <Link
              href="/admin/productManagement"
              className="h-10 rounded-lg border border-[#d8dde4] bg-white px-6 text-sm font-medium leading-10 text-[#5f6670]"
            >
              Cancel
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
