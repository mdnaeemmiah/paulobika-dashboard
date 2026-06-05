"use client";

import { FormEvent, ReactNode, useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiEdit2,
  FiFileText,
  FiHelpCircle,
  FiPlus,
  FiRefreshCw,
  FiSave,
  FiShield,
  FiTrash2,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";
import baseApi from "@/src/api/baseApi";
import { ENDPOINTS } from "@/src/api/endPoints";

type SettingKey = "terms" | "privacy" | "faq";

type SettingSection = {
  id: number | string;
  title: string;
  content: string;
  order: number;
};

type SettingPayload = {
  title: string;
  content: string;
  order: number;
};

type RawSettingSection = Partial<SettingSection> & {
  _id?: string;
  pk?: number | string;
};

type SettingsResponse =
  | RawSettingSection[]
  | {
      results?: RawSettingSection[];
      data?: RawSettingSection[] | { results?: RawSettingSection[] };
    };

const settingTabs: Array<{
  key: SettingKey;
  label: string;
  endpoint: string;
  icon: ReactNode;
}> = [
  {
    key: "terms",
    label: "Terms",
    endpoint: ENDPOINTS.terms,
    icon: <FiFileText size={18} />,
  },
  {
    key: "privacy",
    label: "Privacy",
    endpoint: ENDPOINTS.privacy,
    icon: <FiShield size={18} />,
  },
  {
    key: "faq",
    label: "FAQ",
    endpoint: ENDPOINTS.faq,
    icon: <FiHelpCircle size={18} />,
  },
];

const emptyForm: SettingPayload = {
  title: "",
  content: "",
  order: 1,
};

const samplePayload: SettingPayload = {
  title: "Introduction",
  content: "This is the terms introduction section.2",
  order: 1,
};

const getErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string; detail?: string; error?: string } | undefined;
    return data?.message || data?.detail || data?.error || fallback;
  }

  return fallback;
};

const getSectionsFromResponse = (response: SettingsResponse): RawSettingSection[] => {
  if (Array.isArray(response)) {
    return response;
  }

  if (Array.isArray(response.results)) {
    return response.results;
  }

  if (Array.isArray(response.data)) {
    return response.data;
  }

  if (response.data && "results" in response.data && Array.isArray(response.data.results)) {
    return response.data.results;
  }

  return [];
};

const normalizeSections = (response: SettingsResponse): SettingSection[] => {
  return getSectionsFromResponse(response)
    .map((item, index) => ({
      id: item.id ?? item.pk ?? item._id ?? index + 1,
      title: item.title ?? "Untitled",
      content: item.content ?? "",
      order: Number(item.order ?? index + 1),
    }))
    .sort((first, second) => first.order - second.order);
};

const buildDetailUrl = (endpoint: string, id: string | number) => `${endpoint}${id}/`;

export default function SettingsPage() {
  const [activeKey, setActiveKey] = useState<SettingKey>("terms");
  const [sections, setSections] = useState<Record<SettingKey, SettingSection[]>>({
    terms: [],
    privacy: [],
    faq: [],
  });
  const [form, setForm] = useState<SettingPayload>(emptyForm);
  const [editingItem, setEditingItem] = useState<SettingSection | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | number | null>(null);
  const [error, setError] = useState("");

  const activeTab = useMemo(
    () => settingTabs.find((tab) => tab.key === activeKey) ?? settingTabs[0],
    [activeKey],
  );

  const activeSections = sections[activeKey];

  const fetchSections = useCallback(async (key: SettingKey) => {
    const tab = settingTabs.find((item) => item.key === key) ?? settingTabs[0];
    await Promise.resolve();
    setIsLoading(true);
    setError("");

    try {
      const response = await baseApi.get<SettingsResponse>(tab.endpoint);
      setSections((previous) => ({
        ...previous,
        [key]: normalizeSections(response.data),
      }));
    } catch (fetchError) {
      const message = getErrorMessage(fetchError, `Failed to load ${tab.label}`);
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      void fetchSections(activeKey);
    }, 0);

    return () => window.clearTimeout(timeoutId);
  }, [activeKey, fetchSections]);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingItem(null);
  };

  const handleTabChange = (key: SettingKey) => {
    setActiveKey(key);
    resetForm();
  };

  const handleEdit = (item: SettingSection) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      content: item.content,
      order: item.order,
    });
  };

  const handleUseSample = () => {
    setForm(samplePayload);
    setEditingItem(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.title.trim() || !form.content.trim()) {
      toast.error("Title and content are required");
      return;
    }

    setIsSaving(true);
    setError("");

    const payload: SettingPayload = {
      title: form.title.trim(),
      content: form.content.trim(),
      order: Number(form.order) || 1,
    };

    try {
      if (editingItem) {
        await baseApi.patch(buildDetailUrl(activeTab.endpoint, editingItem.id), payload);
        toast.success(`${activeTab.label} section updated`);
      } else {
        await baseApi.post(activeTab.endpoint, payload);
        toast.success(`${activeTab.label} section created`);
      }

      resetForm();
      await fetchSections(activeKey);
    } catch (saveError) {
      const message = getErrorMessage(saveError, `Failed to save ${activeTab.label}`);
      setError(message);
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (item: SettingSection) => {
    const shouldDelete = window.confirm(`Delete "${item.title}"?`);
    if (!shouldDelete) {
      return;
    }

    setDeletingId(item.id);
    setError("");

    try {
      await baseApi.delete(buildDetailUrl(activeTab.endpoint, item.id));
      toast.success(`${activeTab.label} section deleted`);
      if (editingItem?.id === item.id) {
        resetForm();
      }
      await fetchSections(activeKey);
    } catch (deleteError) {
      const message = getErrorMessage(deleteError, `Failed to delete ${activeTab.label}`);
      setError(message);
      toast.error(message);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen">
      <section className="overflow-hidden rounded-2xl border border-[#d8dde4] bg-[#f3f4f6]">
        <div className="bg-[#b76424] px-4 py-3">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-[22px] leading-none font-semibold text-white sm:text-[26px]">
                Settings
              </h2>
              <p className="mt-1 text-sm text-white/85">Manage Terms, Privacy, and FAQ content.</p>
            </div>
            <button
              type="button"
              onClick={() => void fetchSections(activeKey)}
              className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-white/35 bg-white/15 px-3 text-sm font-medium text-white transition hover:bg-white/25 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isLoading}
            >
              <FiRefreshCw className={isLoading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>
        </div>

        <div className="p-3 sm:p-4">
          <div className="grid gap-4 xl:grid-cols-[260px_minmax(0,1fr)]">
            <aside className="rounded-xl border border-[#d8dde4] bg-white p-2">
              {settingTabs.map((tab) => {
                const isActive = tab.key === activeKey;
                return (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => handleTabChange(tab.key)}
                    className={`mb-2 flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition last:mb-0 ${
                      isActive
                        ? "bg-[#f6ebe3] text-[#b76424]"
                        : "text-[#454b54] hover:bg-[#f7f8fa]"
                    }`}
                  >
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-[#b76424] shadow-sm">
                      {tab.icon}
                    </span>
                    <span className="text-[15px] font-semibold">{tab.label}</span>
                  </button>
                );
              })}
            </aside>

            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_390px]">
              <div className="rounded-xl border border-[#d8dde4] bg-white">
                <div className="flex flex-col gap-2 border-b border-[#e2e6ec] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-[#2f343a]">{activeTab.label} Sections</h3>
                    <p className="text-sm text-[#7d8592]">Endpoint: {activeTab.endpoint}</p>
                  </div>
                  <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#edf7f1] px-3 py-1 text-xs font-semibold text-[#2f8f5b]">
                    <FiCheckCircle />
                    GET enabled
                  </span>
                </div>

                {error ? (
                  <div className="mx-4 mt-4 flex items-center gap-2 rounded-lg border border-[#f4caca] bg-[#fde8e8] px-3 py-2 text-sm text-[#cf3f3f]">
                    <FiAlertCircle />
                    {error}
                  </div>
                ) : null}

                <div className="p-4">
                  {isLoading ? (
                    <div className="flex min-h-80 items-center justify-center text-sm text-[#7d8592]">
                      Loading {activeTab.label.toLowerCase()} sections...
                    </div>
                  ) : activeSections.length === 0 ? (
                    <div className="flex min-h-80 flex-col items-center justify-center rounded-xl border border-dashed border-[#d8dde4] bg-[#f7f8fa] px-4 text-center">
                      <FiFileText className="text-3xl text-[#b76424]" />
                      <p className="mt-3 text-base font-semibold text-[#2f343a]">No sections found</p>
                      <p className="mt-1 max-w-md text-sm leading-6 text-[#7d8592]">
                        Add title, content, and order from the form to create the first section.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {activeSections.map((item) => (
                        <article
                          key={`${activeKey}-${item.id}`}
                          className="rounded-xl border border-[#e0e5ea] bg-[#fbfbfc] p-4 transition hover:border-[#d1a17a]"
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div className="min-w-0">
                              <div className="mb-2 flex flex-wrap items-center gap-2">
                                <span className="rounded-full bg-[#f6ebe3] px-2.5 py-1 text-xs font-semibold text-[#b76424]">
                                  Order {item.order}
                                </span>
                                <span className="text-xs text-[#8a929e]">ID: {item.id}</span>
                              </div>
                              <h4 className="text-base font-semibold text-[#2f343a]">{item.title}</h4>
                              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-[#555e6b]">{item.content}</p>
                            </div>
                            <div className="flex shrink-0 items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEdit(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#d8dde4] text-[#3b82f6] transition hover:bg-[#eff6ff]"
                                aria-label={`Edit ${item.title}`}
                              >
                                <FiEdit2 />
                              </button>
                              <button
                                type="button"
                                onClick={() => void handleDelete(item)}
                                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[#f4caca] text-[#cf3f3f] transition hover:bg-[#fde8e8] disabled:cursor-not-allowed disabled:opacity-60"
                                disabled={deletingId === item.id}
                                aria-label={`Delete ${item.title}`}
                              >
                                <FiTrash2 />
                              </button>
                            </div>
                          </div>
                        </article>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="rounded-xl border border-[#d8dde4] bg-white">
                <div className="border-b border-[#e2e6ec] px-4 py-3">
                  <h3 className="text-lg font-semibold text-[#2f343a]">
                    {editingItem ? `Edit ${activeTab.label}` : `Add ${activeTab.label}`}
                  </h3>
                  <p className="text-sm text-[#7d8592]">POST for new sections, PATCH for updates.</p>
                </div>

                <div className="space-y-4 p-4">
                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#394150]">Title</span>
                    <input
                      type="text"
                      value={form.title}
                      onChange={(event) => setForm((previous) => ({ ...previous, title: event.target.value }))}
                      className="h-11 w-full rounded-lg border border-[#d8dde4] bg-[#fbfbfc] px-3 text-sm text-[#2f343a] outline-none transition focus:border-[#b76424] focus:bg-white"
                      placeholder="Introduction"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#394150]">Content</span>
                    <textarea
                      value={form.content}
                      onChange={(event) => setForm((previous) => ({ ...previous, content: event.target.value }))}
                      className="min-h-55 w-full resize-y rounded-lg border border-[#d8dde4] bg-[#fbfbfc] px-3 py-2 text-sm leading-6 text-[#2f343a] outline-none transition focus:border-[#b76424] focus:bg-white"
                      placeholder="This is the terms introduction section.2"
                    />
                  </label>

                  <label className="block">
                    <span className="mb-1.5 block text-sm font-medium text-[#394150]">Order</span>
                    <input
                      type="number"
                      min="1"
                      value={form.order}
                      onChange={(event) =>
                        setForm((previous) => ({ ...previous, order: Number(event.target.value) }))
                      }
                      className="h-11 w-full rounded-lg border border-[#d8dde4] bg-[#fbfbfc] px-3 text-sm text-[#2f343a] outline-none transition focus:border-[#b76424] focus:bg-white"
                    />
                  </label>

        

                  <div className="flex flex-col gap-2 sm:flex-row">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-lg bg-[#b76424] px-4 text-sm font-semibold text-white transition hover:bg-[#9e561f] disabled:cursor-not-allowed disabled:opacity-70"
                    >
                      {editingItem ? <FiSave /> : <FiPlus />}
                      {isSaving ? "Saving..." : editingItem ? "Update Section" : "Create Section"}
                    </button>
                    {editingItem ? (
                      <button
                        type="button"
                        onClick={resetForm}
                        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg border border-[#d8dde4] px-4 text-sm font-semibold text-[#454b54] transition hover:bg-[#f7f8fa]"
                      >
                        <FiX />
                        Cancel
                      </button>
                    ) : null}
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
