"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { FiChevronDown, FiChevronLeft, FiMoreVertical, FiPlus } from "react-icons/fi";
import { DOG_INFORMATION_OPTIONS } from "../dogInformationData";
import { toast } from "sonner";

type OptionKey = keyof typeof DOG_INFORMATION_OPTIONS;

type OptionItem = {
  id: string;
  name: string;
  title?: string;
  icon?: string;
};

type OptionState = {
  [K in OptionKey]: OptionItem[];
};

type FormState = {
  [K in OptionKey]: string;
};

const emptyForm: FormState = {
  breed: "",
  healthIssues: "",
  foodAllergies: "",
  foodType: "",
};

const labels: Record<OptionKey, string> = {
  breed: "Breed",
  healthIssues: "Health Issues",
  foodAllergies: "Food Allergies",
  foodType: "Food Type",
};

const sectionOrder: OptionKey[] = [
  "breed",
  "healthIssues",
  "foodAllergies",
  "foodType",
];


const parseOptionItem = (item: unknown): OptionItem | null => {
  if (!item || typeof item !== "object") {
    return null;
  }

  const record = item as Record<string, unknown>;
  const rawName = record.name ?? record.title ?? record.label ?? record.value;
  const rawTitle = record.title;
  const rawIcon = record.icon;
  const rawId = record.id ?? record.pk ?? record.uuid;

  if (typeof rawName !== "string" || !rawName.trim()) {
    return null;
  }

  return {
    id: String(rawId ?? rawName).trim(),
    name: rawName.trim(),
    title: typeof rawTitle === "string" ? rawTitle.trim() : undefined,
    icon: typeof rawIcon === "string" ? rawIcon.trim() : undefined,
  };
};

const parseOptionArray = (payload: unknown): OptionItem[] => {
  const list = Array.isArray(payload)
    ? payload
    : payload && typeof payload === "object" && Array.isArray((payload as { results?: unknown[] }).results)
      ? ((payload as { results: unknown[] }).results ?? [])
      : [];

  const parsed = list
    .map(parseOptionItem)
    .filter((item): item is OptionItem => Boolean(item));

  const seen = new Set<string>();
  return parsed.filter((item) => {
    const key = item.name.toLowerCase();
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
};

export default function DogInformationEditPage() {
  const [formValues, setFormValues] = useState<FormState>(emptyForm);
  const fallbackOptions = useMemo<OptionState>(() => ({
    breed: DOG_INFORMATION_OPTIONS.breed.map((name) => ({ id: name, name })),
    healthIssues: DOG_INFORMATION_OPTIONS.healthIssues.map((name) => ({ id: name, name })),
    foodAllergies: DOG_INFORMATION_OPTIONS.foodAllergies.map((name) => ({ id: name, name })),
    foodType: DOG_INFORMATION_OPTIONS.foodType.map((name) => ({ id: name, name })),
  }), []);

  const [options, setOptions] = useState<OptionState>(fallbackOptions);
  const [openField, setOpenField] = useState<OptionKey | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState<Record<OptionKey, boolean>>({
    breed: false,
    healthIssues: false,
    foodAllergies: false,
    foodType: false,
  });
  const [isDeleting, setIsDeleting] = useState<Record<OptionKey, boolean>>({
    breed: false,
    healthIssues: false,
    foodAllergies: false,
    foodType: false,
  });
  const [showAddInput, setShowAddInput] = useState<Record<OptionKey, boolean>>({
    breed: false,

    healthIssues: false,
    foodAllergies: false,
    foodType: false,
  });
  const [newOptionValue, setNewOptionValue] = useState<Record<OptionKey, string>>({
    breed: "",
    healthIssues: "",
    foodAllergies: "",
    foodType: "",
  });
  const [newFoodTypeTitle, setNewFoodTypeTitle] = useState("");
  const [newFoodTypeIcon, setNewFoodTypeIcon] = useState<File | null>(null);
  const [openOptionMenu, setOpenOptionMenu] = useState<{
    field: OptionKey;
    optionId: string;
  } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setOptions(fallbackOptions);
    setIsLoading(false);
  }, [fallbackOptions]);

  useEffect(() => {
    setFormValues((prev) => ({
      breed: prev.breed || options.breed[0]?.name || "",
      healthIssues: prev.healthIssues || options.healthIssues[0]?.name || "",
      foodAllergies: prev.foodAllergies || options.foodAllergies[0]?.name || "",
      foodType: prev.foodType || options.foodType[0]?.name || "",
    }));
  }, [options]);


  const handleFormChange = (field: OptionKey, value: string) => {
    setFormValues((prev) => ({ ...prev, [field]: value }));
  };

  const toggleField = (field: OptionKey) => {
    setOpenField((prev) => (prev === field ? null : field));
  };

  const addNewOption = async (field: OptionKey) => {
    const nextOption = newOptionValue[field].trim();

    if (!nextOption) {
      toast.error(`Enter a ${labels[field]} option first.`);
      return;
    }

    const alreadyExists = options[field].some(
      (option) => option.name.toLowerCase() === nextOption.toLowerCase(),
    );

    if (alreadyExists) {
      handleFormChange(field, nextOption);
      setNewOptionValue((prev) => ({ ...prev, [field]: "" }));
      toast.success(`${labels[field]} option already exists.`);
      return;
    }

    setIsSaving((prev) => ({ ...prev, [field]: true }));

    const created: OptionItem = {
      id: String(Date.now()),
      name: nextOption,
      title: field === "foodType" ? newFoodTypeTitle.trim() || nextOption : undefined,
      icon: undefined,
    };

    setOptions((prev) => ({
      ...prev,
      [field]: [...prev[field], created],
    }));
    handleFormChange(field, created.name);
    setNewOptionValue((prev) => ({ ...prev, [field]: "" }));
    if (field === "foodType") {
      setNewFoodTypeTitle("");
      setNewFoodTypeIcon(null);
    }
    setShowAddInput((prev) => ({ ...prev, [field]: false }));
    setOpenField(null);
    toast.success(`${labels[field]} option saved.`);
    setIsSaving((prev) => ({ ...prev, [field]: false }));
  };

  const deleteOption = async (field: OptionKey, optionToDelete: OptionItem) => {
    setIsDeleting((prev) => ({ ...prev, [field]: true }));

    setOptions((prev) => {
      const filtered = prev[field].filter((option) => option.id !== optionToDelete.id);
      const nextOptions = {
        ...prev,
        [field]: filtered,
      };

      setFormValues((currentValues) => {
        if (currentValues[field] !== optionToDelete.name) {
          return currentValues;
        }

        return {
          ...currentValues,
          [field]: filtered[0]?.name ?? "",
        };
      });

      return nextOptions;
    });

    setOpenOptionMenu(null);
    toast.success(`${labels[field]} option deleted.`);
    setIsDeleting((prev) => ({ ...prev, [field]: false }));
  };



  return (
    <div className="min-h-screen space-y-4">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f7f8fa]">
        <div className="bg-[#b76424] px-4 py-2.5">
          <Link
            href="/admin/dogInformation"
            className="inline-flex items-center gap-2 text-[20px] leading-none font-semibold text-white sm:text-[24px] lg:text-[34px]"
          >
            <FiChevronLeft size={18} />
            Add Dog Info for Collections
          </Link>
        </div>

        <div className="space-y-4 p-4">
          {sectionOrder.map((field) => (
            <div
              key={field}
              className={`space-y-1.5 ${openField === field ? "relative z-40" : "relative z-0"}`}
            >
              <label className="text-sm md:text-[16px]  text-[#232a33]">{labels[field]} Dropdown</label>

              <button
                type="button"
                onClick={() => toggleField(field)}
                className="flex h-11 w-full items-center justify-between rounded-xl border border-[#d8dde4] bg-white px-3 text-left text-sm text-[#3a4048]"
              >
                <span>{formValues[field] || options[field][0]?.name || ""}</span>
                <FiChevronDown
                  className={`text-[#6f7680] transition-transform ${openField === field ? "rotate-180" : ""}`}
                />
              </button>

              {openField === field && (
                <div className="rounded-2xl border border-[#d8dde4] bg-[#eff1f4] p-3">
                  <div className="space-y-1 pb-2">
                    {options[field].map((option) => (
                      <div
                        key={option.id}
                        className={`relative flex w-full items-center gap-2 ${
                          openOptionMenu?.field === field && openOptionMenu.optionId === option.id ? "z-50" : ""
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => {
                            handleFormChange(field, option.name);
                            setOpenField(null);
                            setOpenOptionMenu(null);
                          }}
                          className={`block flex-1 rounded-lg px-2 py-1.5 text-left text-sm transition ${
                            formValues[field] === option.name
                              ? "bg-white font-medium text-[#2f343a]"
                              : "text-[#6f7680] hover:bg-white"
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            {field === "foodType" && option.icon ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={option.icon}
                                alt={option.name}
                                className="h-5 w-5 rounded object-cover"
                              />
                            ) : null}
                            <span>
                              {option.name}
                              {field === "foodType" && option.title ? (
                                <span className="ml-2 text-xs text-[#8a9099]">({option.title})</span>
                              ) : null}
                            </span>
                          </span>
                        </button>

                        <button
                          type="button"
                          aria-label={`Open menu for ${option.name}`}
                          disabled={isDeleting[field]}
                          onClick={() =>
                            setOpenOptionMenu((prev) =>
                              prev?.field === field && prev.optionId === option.id
                                ? null
                                : { field, optionId: option.id },
                            )
                          }
                          className="flex h-8 w-8 items-center justify-center rounded-full text-[#6f7680] transition hover:bg-white"
                        >
                          <FiMoreVertical size={16} />
                        </button>

                        {openOptionMenu?.field === field && openOptionMenu.optionId === option.id && (
                          <div className="absolute right-0 top-full z-9999 mt-1 w-28 rounded-xl border border-[#d8dde4] bg-white p-1 shadow-md">
                            <button
                              type="button"
                              disabled={isDeleting[field]}
                              onClick={() => deleteOption(field, option)}
                              className="block w-full rounded-lg px-3 py-2 cursor-pointer text-center text-sm text-[#cf3e36] transition hover:bg-[#f8f9fb]"
                            >
                              {isDeleting[field] ? "Deleting..." : "Delete"}
                            </button>
                            <button
                              type="button"
                              onClick={() => setOpenOptionMenu(null)}
                              className="block w-full rounded-lg px-3 py-2 cursor-pointer text-center text-sm text-[#2f343a] transition hover:bg-[#f8f9fb]"
                            >
                              Cancel
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => setShowAddInput((prev) => ({ ...prev, [field]: !prev[field] }))}
                    className="inline-flex h-8 items-center gap-2 rounded-full border border-[#d8dde4] bg-white px-3 text-sm text-[#2f343a]"
                  >
                    <FiPlus size={14} />
                    Add new Option
                  </button>

                  {showAddInput[field] && (
                    <div className="mt-3">
                      <input
                        value={newOptionValue[field]}
                        onChange={(e) =>
                          setNewOptionValue((prev) => ({ ...prev, [field]: e.target.value }))
                        }
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            void addNewOption(field);
                          }
                        }}
                        placeholder={`Enter ${labels[field].toLowerCase()} name`}
                        className="h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm text-[#3a4048] outline-none"
                      />

                      {field === "foodType" ? (
                        <>
                          <input
                            value={newFoodTypeTitle}
                            onChange={(e) => setNewFoodTypeTitle(e.target.value)}
                            placeholder="Enter food type title"
                            className="mt-3 h-11 w-full rounded-xl border border-[#d8dde4] bg-white px-3 text-sm text-[#3a4048] outline-none"
                          />
                          <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setNewFoodTypeIcon(e.target.files?.[0] ?? null)}
                            className="mt-3 block w-full rounded-xl border border-[#d8dde4] bg-white px-3 py-2 text-sm text-[#3a4048]"
                          />
                        </>
                      ) : null}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3">
                    <button
                      type="button"
                      disabled={isSaving[field] || isLoading}
                      onClick={() => void addNewOption(field)}
                      className="h-9 min-w-28 rounded-xl bg-[#b76424] px-5 text-sm font-medium text-white"
                    >
                      {isSaving[field] ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowAddInput((prev) => ({ ...prev, [field]: false }));
                        setNewOptionValue((prev) => ({ ...prev, [field]: "" }));
                        if (field === "foodType") {
                          setNewFoodTypeTitle("");
                          setNewFoodTypeIcon(null);
                        }
                        setOpenField(null);
                      }}
                      className="h-9 min-w-26 rounded-xl border border-[#d8dde4] bg-white px-5 text-sm font-medium text-[#2f343a]"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              className="h-11 min-w-38 rounded-xl bg-[#b76424] px-6 text-sm font-medium text-white"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => {
                setFormValues(emptyForm);
                setOpenField(null);
              }}
              className="h-11 min-w-30 rounded-xl border border-[#d8dde4] bg-white px-6 text-sm font-medium text-[#2f343a]"
            >
              Cancel
            </button>
          </div> */}
        </div>
      </section>
    </div>
  );
}
