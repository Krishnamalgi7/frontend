"use client";

import Loader from "../../../components/Loader";
import BillingCard from "../../../components/admin/BillingCard";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ChevronRight,
  ImagePlus,
  Pencil,
  Plus,
  Search,
  X,
  Upload,
  CircleChevronLeft,
  ChevronDown,
  ChevronLeft,
} from "lucide-react";

type SectionType =
  | "brands"
  | "variants"
  | "rams"
  | "roms"
  | "colors"
  | "discount";

type StatusFilter = "all" | "active" | "inactive";

type MasterItem = {
  _id: string;
  name?: string;
  value?: string;
  isActive: boolean;
  percentage?: number; // For discount
};

type Pagination = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

type MetaData = {
  total: number;
  active: number;
  inactive: number;
};

const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`;

const sections = [
  {
    key: "brands" as SectionType,
    title: "Brands",
    description: "Manage phone brands",
  },
  {
    key: "variants" as SectionType,
    title: "Variants",
    description: "Manage phone variants",
  },
  {
    key: "rams" as SectionType,
    title: "RAM",
    description: "Manage RAM options",
  },
  {
    key: "roms" as SectionType,
    title: "ROM",
    description: "Manage storage options",
  },

  {
    key: "colors" as SectionType,
    title: "Colors",
    description: "Manage phone colors",
  },

  {
    key: "discount" as SectionType,
    title: "Discount",
    description: "Manage discount options",
  },
];

export default function AdminSettingsPage() {
  const router = useRouter();

  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [openSection, setOpenSection] = useState<SectionType | null>(null);

  const [items, setItems] = useState<MasterItem[]>([]);

  const [meta, setMeta] = useState<Record<SectionType, MetaData>>({
    brands: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    variants: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    rams: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    roms: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    colors: {
      total: 0,
      active: 0,
      inactive: 0,
    },
    discount: {
      total: 0,
      active: 0,
      inactive: 0,
    },
  });

  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<StatusFilter>("all");

  const [loading, setLoading] = useState(false);

  const [sectionLoading, setSectionLoading] = useState(false);

  const [metaLoading, setMetaLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [message, setMessage] = useState("");

  const [brandName, setBrandName] = useState("");
  const [logo, setLogo] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState("");
  const [brandingSaving, setBrandingSaving] = useState(false);

  const handleSaveBranding = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      setBrandingSaving(true);

      const data = new FormData();

      data.append("brandName", brandName);

      if (logo) {
        data.append("logo", logo);
      }

      const response = await fetch(`${API_BASE_URL}/store-settings`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update branding");
      }

      setMessage("Store Data updated successfully.");
    } catch (error) {
      console.error("Save branding error:", error);

      setMessage("Failed to update store Data.");
    } finally {
      setBrandingSaving(false);
    }
  };

  const [editing, setEditing] = useState<{
    id: string;
    value: string;
  } | null>(null);

  const [confirmItem, setConfirmItem] = useState<MasterItem | null>(null);

  /*
   * ------------------------------------------------
   * FETCH METADATA
   * ------------------------------------------------
   *
   * Gets only counts.
   *
   * It does NOT download all brands/variants/RAM/ROM.
   */

  const fetchMeta = async () => {
    try {
      setMetaLoading(true);

      const responses = await Promise.all([
        fetch(`${API_BASE_URL}/brands/meta`),
        fetch(`${API_BASE_URL}/variants/meta`),
        fetch(`${API_BASE_URL}/rams/meta`),
        fetch(`${API_BASE_URL}/roms/meta`),
        fetch(`${API_BASE_URL}/colors/all`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }),
        fetch(`${API_BASE_URL}/settings/discount/meta`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
          },
        }),
      ]);

      if (responses.some((response) => !response.ok)) {
        throw new Error("Failed to fetch metadata");
      }

      const [brands, variants, rams, roms, colors, discount] =
        await Promise.all(responses.map((response) => response.json()));

      setMeta({
        brands,
        variants,
        rams,
        roms,
        colors: {
          total: colors.items?.length || 0,
          active:
            colors.items?.filter((color: MasterItem) => color.isActive)
              .length || 0,
          inactive:
            colors.items?.filter((color: MasterItem) => !color.isActive)
              .length || 0,
        },
        discount,
      });
    } catch (error) {
      console.error("Failed to fetch metadata:", error);
    } finally {
      setMetaLoading(false);
    }
  };

  /*
   * ------------------------------------------------
   * INITIAL METADATA LOAD
   * ------------------------------------------------
   */

  useEffect(() => {
    fetchMeta();
  }, []);

  /*
   * ------------------------------------------------
   * FETCH ITEMS
   * ------------------------------------------------
   *
   * Only the currently selected section
   * is fetched.
   */

  const fetchItems = async (section: SectionType, page = 1) => {
    try {
      setLoading(true);
      setMessage("");

      const params = new URLSearchParams({
        page: String(page),
        limit: "10",
        search: search.trim(),
        status,
      });

      const endpoint =
        section === "discount"
          ? `${API_BASE_URL}/settings/discount`
          : section === "colors"
            ? `${API_BASE_URL}/colors/all`
            : `${API_BASE_URL}/${section}`;

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers:
          section === "discount" || section === "colors"
            ? {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              }
            : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to load data");
      }

      setItems(data.items || []);

      setPagination(
        data.pagination || {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        },
      );
    } catch (error) {
      console.error("Failed to fetch settings data:", error);

      setMessage("Failed to load data.");
    } finally {
      setLoading(false);
      setSectionLoading(false);
    }
  };

  /*
   * ------------------------------------------------
   * OPEN SECTION
   * ------------------------------------------------
   */

  useEffect(() => {
    if (!openSection) {
      return;
    }

    setSectionLoading(true);

    const timer = setTimeout(() => {
      fetchItems(openSection, 1);
    }, 300);

    return () => {
      clearTimeout(timer);
    };
  }, [openSection, search, status]);

  /*
   * ------------------------------------------------
   * GET DISPLAY VALUE
   * ------------------------------------------------
   */

  const getDisplayValue = (item: MasterItem) => {
    if (openSection === "discount") {
      return `${item.percentage} %`;
    }

    return item.name || item.value || "";
  };

  /*
   * ------------------------------------------------
   * CHECK DUPLICATE
   * ------------------------------------------------
   *
   * Used before adding a new value.
   */

  const checkDuplicate = async (value: string) => {
    if (!openSection) {
      return false;
    }

    try {
      const params = new URLSearchParams({
        page: "1",
        limit: "10",
        search: value,
        status: "all",
      });

      const endpoint =
        openSection === "discount"
          ? `${API_BASE_URL}/settings/discount`
          : `${API_BASE_URL}/${openSection}`;

      const response = await fetch(`${endpoint}?${params.toString()}`, {
        headers:
          openSection === "discount"
            ? {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              }
            : undefined,
      });

      const data = await response.json();

      if (!response.ok) {
        return false;
      }

      const existingItems = data.items || [];

      return existingItems.some(
        (item: MasterItem) =>
          getDisplayValue(item).trim().toLowerCase() ===
          value.trim().toLowerCase(),
      );
    } catch (error) {
      console.error("Duplicate check failed:", error);

      return false;
    }
  };

  /*
   * ------------------------------------------------
   * ADD ITEM
   * ------------------------------------------------
   */

  const handleAdd = async () => {
    if (!openSection) {
      return;
    }

    const value = search.trim();

    if (!value) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      /*
       * Check if exact value already exists.
       */

      const alreadyExists = await checkDuplicate(value);

      if (alreadyExists) {
        setMessage(`"${value}" already exists.`);

        return;
      }

      const isNameField =
        openSection === "brands" ||
        openSection === "variants" ||
        openSection === "colors";

      const body = isNameField ? { name: value } : { value };

      const endpoint =
        openSection === "discount"
          ? `${API_BASE_URL}/settings/discount`
          : `${API_BASE_URL}/${openSection}`;

      const requestBody =
        openSection === "discount"
          ? {
              percentage: Number(value),
            }
          : body;

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to add item.");

        return;
      }

      setMessage(data.message || "Added successfully.");

      setSearch("");

      /*
       * Refresh list.
       */

      await fetchItems(openSection, 1);

      /*
       * Refresh counts.
       */

      await fetchMeta();
    } catch (error) {
      console.error("Failed to add item:", error);

      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * UPDATE ITEM
   * ------------------------------------------------
   */

  const handleUpdate = async () => {
    if (!openSection || !editing) {
      return;
    }

    const value = editing.value.trim();

    if (!value) {
      setMessage("Value cannot be empty.");

      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const isNameField =
        openSection === "brands" || openSection === "variants";

      const body = isNameField ? { name: value } : { value };

      const response = await fetch(
        `${API_BASE_URL}/${openSection}/${editing.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update item.");

        return;
      }

      setEditing(null);

      setMessage(data.message || "Updated successfully.");

      await fetchItems(openSection, pagination.page);

      await fetchMeta();
    } catch (error) {
      console.error("Failed to update item:", error);

      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * ACTIVATE / DEACTIVATE
   * ------------------------------------------------
   */
  const confirmToggle = async () => {
    if (!confirmItem) {
      return;
    }

    await handleToggle(confirmItem);

    setConfirmItem(null);
  };

  const handleToggle = async (item: MasterItem) => {
    if (!openSection) {
      return;
    }

    try {
      setSaving(true);
      setMessage("");

      const endpoint =
        openSection === "discount"
          ? `${API_BASE_URL}/settings/discount/${item._id}/status`
          : openSection === "colors"
            ? `${API_BASE_URL}/colors/${item._id}/toggle`
            : `${API_BASE_URL}/${openSection}/${item._id}`;

      const response = await fetch(endpoint, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          ...(openSection === "discount" || openSection === "colors"
            ? {
                Authorization: `Bearer ${localStorage.getItem("adminToken")}`,
              }
            : {}),
        },
        body: JSON.stringify({
          isActive: !item.isActive,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setMessage(data.message || "Failed to update status.");

        return;
      }

      await fetchItems(openSection, pagination.page);

      await fetchMeta();
    } catch (error) {
      console.error("Failed to update status:", error);

      setMessage("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  /*
   * ------------------------------------------------
   * BACK TO SETTINGS
   * ------------------------------------------------
   */

  const handleBack = () => {
    setOpenSection(null);
    setItems([]);
    setSearch("");
    setStatus("all");
    setMessage("");
    setEditing(null);

    /*
     * Refresh counts when returning.
     */

    fetchMeta();
  };

  /*
   * ------------------------------------------------
   * CLEAR SEARCH
   * ------------------------------------------------
   */

  const clearSearch = () => {
    setSearch("");
  };

  const currentSection = sections.find(
    (section) => section.key === openSection,
  );

  if (metaLoading) {
    return <Loader />;
  }

  /*
   * =================================================
   * MANAGEMENT VIEW
   * =================================================
   */

  if (openSection) {
    return (
      <main
        className="min-h-screen px-6 py-10"
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl">
          {/* BACK TO settings */}

          <button
            type="button"
            onClick={handleBack}
            className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent-color)]"
          >
            <CircleChevronLeft size={17} />
            Back to Settings
          </button>

          {/* HEADER */}

          <div className="mb-10">
            <p
              className="mb-2 text-sm font-semibold uppercase tracking-wider"
              style={{
                color: "var(--accent-primary)",
              }}
            >
              Settings
            </p>

            <h1 className="text-3xl font-bold">{currentSection?.title}</h1>

            <p
              className="mt-2 text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {currentSection?.description}
            </p>
          </div>

          {/* MESSAGE */}

          {message && (
            <div
              className="mb-6 flex items-center justify-between rounded-xl border px-4 py-3 text-sm"
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-secondary)",
              }}
            >
              <span>{message}</span>

              <button
                type="button"
                onClick={() => setMessage("")}
                className="cursor-pointer rounded-full p-1 transition-opacity hover:opacity-60"
              >
                <X size={16} />
              </button>
            </div>
          )}

          {/* SEARCH + STATUS */}

          <div className="mb-6 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                style={{
                  color: "var(--text-secondary)",
                }}
              />

              <input
                type="text"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleAdd();
                  }
                }}
                placeholder={`Search or add ${currentSection?.title.toLowerCase()}...`}
                className="w-full rounded-xl border py-3 pl-11 pr-11 outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              />

              {search && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer rounded-full p-1 transition-opacity hover:opacity-60"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div ref={statusDropdownRef} className="relative">
              <button
                type="button"
                onClick={() => setStatusDropdownOpen((current) => !current)}
                className="flex w-full min-w-[150px] cursor-pointer items-center justify-between gap-3 rounded-xl border px-4 py-3 outline-none"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                }}
              >
                <span>
                  {status === "all"
                    ? "All"
                    : status === "active"
                      ? "Active"
                      : "Inactive"}
                </span>

                <ChevronDown
                  size={17}
                  className={`transition-transform ${
                    statusDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {statusDropdownOpen && (
                <div
                  className="absolute left-0 top-full z-20 mt-2 w-full min-w-[150px] overflow-hidden rounded-xl border shadow-lg "
                  style={{
                    borderColor: "var(--border-color)",
                    background: "var(--bg-secondary)",
                  }}
                >
                  {(["all", "active", "inactive"] as StatusFilter[]).map(
                    (option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => {
                          setStatus(option);
                          setStatusDropdownOpen(false);
                        }}
                        className="w-full  px-4 py-3 text-left text-sm transition-colors hover:bg-[var(--bg-primary)] hover:bg-blue-500 hover:text-white"
                        style={{
                          color: "var(--text-primary)",
                        }}
                      >
                        {option === "all"
                          ? "All"
                          : option === "active"
                            ? "Active"
                            : "Inactive"}
                      </button>
                    ),
                  )}
                </div>
              )}
            </div>

            {search.trim() && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={saving}
                className="flex cursor-pointer items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                style={{
                  background: "var(--accent-primary)",
                  color: "var(--button-text)",
                }}
              >
                <Plus size={17} />
                Add
              </button>
            )}
          </div>

          {/* RESULTS */}

          {sectionLoading || loading ? (
            <Loader />
          ) : items.length === 0 ? (
            <div
              className="rounded-2xl border p-10 text-center"
              style={{
                borderColor: "var(--border-color)",
                background: "var(--bg-secondary)",
              }}
            >
              <p className="font-medium">No results found.</p>

              {search.trim() && (
                <p
                  className="mt-2 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  If this is a new value, click Add to create "{search.trim()}".
                </p>
              )}
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => {
                const value = getDisplayValue(item);

                const isEditing = editing?.id === item._id;

                return (
                  <div
                    key={item._id}
                    className="flex items-center gap-3 rounded-xl border px-4 py-3 transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
                    style={{
                      borderColor: "var(--border-color)",
                      background: "var(--bg-secondary)",
                    }}
                  >
                    {/* VALUE */}

                    {isEditing ? (
                      <input
                        type="text"
                        value={editing.value}
                        onChange={(event) =>
                          setEditing((current) =>
                            current
                              ? {
                                  ...current,
                                  value: event.target.value,
                                }
                              : null,
                          )
                        }
                        onKeyDown={(event) => {
                          if (event.key === "Enter") {
                            handleUpdate();
                          }

                          if (event.key === "Escape") {
                            setEditing(null);
                          }
                        }}
                        className="min-w-0 flex-1 rounded-lg border px-3 py-2 outline-none"
                        style={{
                          borderColor: "var(--border-color)",
                          background: "var(--bg-primary)",
                          color: "var(--text-primary)",
                        }}
                        autoFocus
                      />
                    ) : (
                      <span className="min-w-0 flex-1 font-medium">
                        {value}
                      </span>
                    )}

                    {/* STATUS */}

                    <span
                      className="rounded-full px-3 py-1 text-xs font-semibold"
                      style={{
                        background: item.isActive
                          ? "rgba(34,197,94,0.12)"
                          : "rgba(239,68,68,0.12)",
                        color: item.isActive ? "#16a34a" : "#dc2626",
                      }}
                    >
                      {item.isActive ? "Active" : "Inactive"}
                    </span>

                    {/* ACTIONS */}

                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={handleUpdate}
                          disabled={saving}
                          className="cursor-pointer rounded-lg px-3 py-2 text-sm font-semibold disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            background: "var(--accent-primary)",
                            color: "var(--button-text)",
                          }}
                        >
                          Save
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditing(null)}
                          className="cursor-pointer rounded-lg border px-3 py-2 text-sm transition-opacity hover:opacity-70"
                          style={{
                            borderColor: "var(--border-color)",
                          }}
                        >
                          Cancel
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => setConfirmItem(item)}
                          disabled={saving}
                          className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-medium transition-opacity hover:opacity-70 disabled:cursor-not-allowed disabled:opacity-50"
                          style={{
                            borderColor: "var(--border-color)",
                          }}
                        >
                          {item.isActive ? "Deactivate" : "Activate"}
                        </button>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* PAGINATION */}

          {!loading && pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <p
                className="text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Showing {(pagination.page - 1) * pagination.limit + 1}–
                {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
                of {pagination.total}
              </p>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => fetchItems(openSection, pagination.page - 1)}
                  disabled={pagination.page === 1 || loading}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  Previous
                </button>

                <button
                  type="button"
                  onClick={() => fetchItems(openSection, pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || loading}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-sm disabled:cursor-not-allowed disabled:opacity-40"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Confirmation Popup */}
        {confirmItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div
              className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
                color: "var(--text-primary)",
              }}
            >
              <h2 className="text-xl font-bold">
                {confirmItem.isActive
                  ? "Confirm Deactivation"
                  : "Confirm Activation"}
              </h2>

              <p
                className="mt-3 text-sm leading-6"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Are you sure you want to{" "}
                {confirmItem.isActive ? "deactivate" : "activate"}{" "}
                <span
                  className="font-semibold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  "{getDisplayValue(confirmItem)}"
                </span>
                ?
              </p>

              <div className="mt-6 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setConfirmItem(null)}
                  className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-70"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={confirmToggle}
                  disabled={saving}
                  className={`cursor-pointer rounded-lg px-4 py-2 text-sm font-medium transition ${
                    confirmItem.isActive
                      ? "bg-red-600 text-white hover:bg-red-700"
                      : "bg-green-600 text-white hover:bg-green-700"
                  } disabled:cursor-not-allowed disabled:opacity-50`}
                >
                  {confirmItem.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    );
  }

  /*
   * =================================================
   * SETTINGS LANDING PAGE
   * =================================================
   */

  return (
    <main
      className="min-h-screen px-6 py-8"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}

        <div className="mb-10">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <CircleChevronLeft size={18} />
            Back to Dashboard
          </button>

          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{
              color: "var(--accent-primary)",
            }}
          >
            Administration
          </p>

          <h1 className="text-3xl font-bold">Settings</h1>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Manage phone master data.
          </p>
        </div>

        {/* STORE Data CARD */}
        <button
          type="button"
          onClick={() => router.push("/admin/settings/branding")}
          className="group mb-4 flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-secondary)",
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Store Data</h2>
            </div>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Manage your store data
            </p>
          </div>

          <ChevronRight
            size={21}
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            style={{
              color: "var(--text-secondary)",
            }}
          />
        </button>

        <button
          type="button"
          onClick={() => router.push("/admin/phones/add")}
          className="group mb-4 flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
          style={{
            borderColor: "var(--border-color)",
            background: "var(--bg-secondary)",
          }}
        >
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-semibold">Add Phone</h2>
            </div>

            <p
              className="mt-1 text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Add a new phone to your inventory
            </p>
          </div>

          <ChevronRight
            size={21}
            className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
            style={{
              color: "var(--text-secondary)",
            }}
          />
        </button>

        
        {/* SETTINGS CARDS */}

        <div className="space-y-4">
          {sections.map((section) => {
            const sectionMeta = meta[section.key] ?? {
              total: 0,
              active: 0,
              inactive: 0,
            };

            return (
              <button
                key={section.key}
                type="button"
                onClick={() => setOpenSection(section.key)}
                className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
                style={{
                  borderColor: "var(--border-color)",
                  background: "var(--bg-secondary)",
                }}
              >
                {/* LEFT */}

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-lg font-semibold">{section.title}</h2>

                    <span
                      className="rounded-full px-2.5 py-1 text-xs font-semibold"
                      style={{
                        background: "rgba(255,193,7,0.12)",
                        color: "var(--accent-primary)",
                      }}
                    >
                      {metaLoading ? "..." : sectionMeta.total}
                    </span>
                  </div>

                  <p
                    className="mt-1 text-sm"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {section.description}
                  </p>

                  <p
                    className="mt-1 text-xs"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {metaLoading
                      ? "Loading..."
                      : `${sectionMeta.active} active · ${sectionMeta.inactive} inactive`}
                  </p>
                </div>

                {/* ARROW */}

                <ChevronRight
                  size={21}
                  className="shrink-0 transition-transform duration-200 group-hover:translate-x-1"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
