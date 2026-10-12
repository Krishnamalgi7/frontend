"use client";

import { useCallback, useEffect, useState } from "react";
import {  X,  Plus } from "lucide-react";

import PhoneFilters from "../../store/PhoneFilters";
import type { PhoneFilterValues } from "../../store/PhoneFilters";

type Phone = {
  _id: string;
  name: string;
  brand?: string | { _id: string; name?: string; value?: string };
  variant?: string | { _id: string; name?: string; value?: string };
  ram?: string | { _id: string; name?: string; value?: string };
  rom?: string | { _id: string; name?: string; value?: string };
  price: number;
  discountPercentage: number;
  discountPrice: number;
  totalPrice: number;
  quantity: number;
};

type BillingPagination = {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type PhoneSelectorProps = {
  onSelect: (phone: Phone) => void;
};

export default function PhoneSelector({ onSelect }: PhoneSelectorProps) {
  const [phones, setPhones] = useState<Phone[]>([]);
  const [loading, setLoading] = useState(true);

  const [currentFilters, setCurrentFilters] =
    useState<PhoneFilterValues | null>(null);

  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);

  const [pagination, setPagination] = useState<BillingPagination | null>(null);

  const handleFiltersChange = useCallback((filters: PhoneFilterValues) => {
    setCurrentFilters(filters);
    setCurrentPage(1);
  }, []);

  useEffect(() => {
    if (!currentFilters) {
      return;
    }

    const fetchBillingPhones = async () => {
      try {
        setLoading(true);

        const token = localStorage.getItem("adminToken");

        const params = new URLSearchParams();

        params.set("page", String(currentPage));
        params.set("limit", "12");

        if (currentFilters.search.trim()) {
          params.set("search", currentFilters.search.trim());
        }

        if (currentFilters.brand) {
          params.set("brand", currentFilters.brand);
        }

        if (currentFilters.variant) {
          params.set("variant", currentFilters.variant);
        }

        if (currentFilters.ram) {
          params.set("ram", currentFilters.ram);
        }

        if (currentFilters.rom) {
          params.set("rom", currentFilters.rom);
        }

        if (currentFilters.rating) {
          params.set("rating", currentFilters.rating);
        }

        if (currentFilters.priceChanged) {
          params.set("minPrice", String(currentFilters.priceMin));
          params.set("maxPrice", String(currentFilters.priceMax));
        }

        if (currentFilters.priceSort) {
          params.set("priceSort", currentFilters.priceSort);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/phones?${params.toString()}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch billing phones");
        }

        const data = await response.json();

        setPhones(data.phones || []);
        setPagination(data.pagination || null);
      } catch (error) {
        console.error("Error fetching billing phones:", error);
        setPhones([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBillingPhones();
  }, [currentFilters, currentPage]);

  const getPhoneValue = (
    value?: string | { _id: string; name?: string; value?: string },
  ) => {
    if (!value) {
      return "—";
    }

    if (typeof value === "object") {
      return value.value || value.name || "—";
    }

    return value;
  };

  return (
    <div>
      {/* SELECTED PHONE / SELECT PHONE */}
      {/* ADD PHONE */}

<button
  type="button"
  onClick={() => setIsPhoneModalOpen(true)}
  className="group flex w-full cursor-pointer items-center gap-4 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
  style={{
    backgroundColor: "var(--bg-secondary)",
    borderColor: "var(--border-color)",
  }}
>
  <div className="min-w-0 flex-1">
    <p className="font-semibold">Add Phone</p>

    <p
      className="mt-1 text-sm"
      style={{
        color: "var(--text-secondary)",
      }}
    >
      Note: Click on add phone for invoice generation.
    </p>
  </div>

  <Plus
    size={21}
    className="shrink-0"
    style={{
      color: "var(--text-secondary)",
    }}
  />
</button>

      {/* PHONE SELECTION MODAL */}
      {isPhoneModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setIsPhoneModalOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="phone-selection-title"
            className="flex max-h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            {/* MODAL HEADER */}
            <div
              className="flex items-center justify-between border-b px-5 py-2 sm:px-6"
              style={{
                borderColor: "var(--border-color)",
              }}
            >
              <div className="min-w-0">
                {/* <h2
                  id="phone-selection-title"
                  className="text-lg font-semibold"
                >
                  Select Phone for billing 
                </h2> */}

                <p
                  className="mt-1 text-balance"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Search and filter your available inventory.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsPhoneModalOpen(false)}
                className="cursor-pointer rounded-lg p-2 transition-colors hover:bg-[var(--bg-secondary)]"
                style={{
                  color: "var(--text-secondary)",
                }}
                aria-label="Close phone selection"
              >
                <X size={20} />
              </button>
            </div>

            {/* MODAL CONTENT */}
            <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
              <PhoneFilters onChange={handleFiltersChange} />

              {loading && (
                <p
                  className="mt-5 text-sm"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Loading phones...
                </p>
              )}

              {!loading && phones.length === 0 && (
                <div
                  className="mt-5 rounded-xl border p-6 text-center text-sm"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-secondary)",
                  }}
                >
                  No available phones found.
                </div>
              )}

              {/* PHONE RESULTS */}
              <div className="mt-5 space-y-3">
                {phones.map((phone) => (
                  <div
                    key={phone._id}
                    className="rounded-2xl border p-4 transition-colors"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{phone.name}</p>

                        <p
                          className="mt-1 text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          {getPhoneValue(phone.brand)} •{" "}
                          {getPhoneValue(phone.ram)} •{" "}
                          {getPhoneValue(phone.rom)}
                        </p>
                      </div>

                      <div className="flex w-full min-w-0 flex-col gap-3 sm:w-auto sm:flex-row sm:items-center sm:justify-end">
                        <div className="min-w-0 text-left sm:text-right">
                          <p className="break-words font-semibold">
                            ₹{phone.totalPrice.toLocaleString("en-IN")}
                          </p>

                          <p
                            className="mt-1 text-sm"
                            style={{
                              color: "var(--text-secondary)",
                            }}
                          >
                            Stock: {phone.quantity}
                          </p>
                        </div>

                        {/* SELECT BUTTON */}
                        <button
                          type="button"
                          onClick={() => {
                            onSelect(phone);
setIsPhoneModalOpen(false);
                          }}
                          className="cursor-pointer rounded-full px-5 py-3 text-center text-sm font-semibold transition theme-accent-hover"
                          style={{
                            backgroundColor: "var(--text-primary)",
                            color: "var(--bg-primary)",
                          }}
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* PAGINATION */}
              {pagination && pagination.totalPages > 1 && (
                <div
                  className="mt-5 flex flex-col gap-3 border-t pt-4 sm:flex-row sm:items-center sm:justify-between"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </p>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={!pagination.hasPreviousPage}
                      onClick={() => setCurrentPage((page) => page - 1)}
                      className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
                      style={{
                        borderColor: "var(--border-color)",
                      }}
                    >
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={!pagination.hasNextPage}
                      onClick={() => setCurrentPage((page) => page + 1)}
                      className="cursor-pointer rounded-xl border px-4 py-2 text-sm transition-colors hover:bg-[var(--bg-secondary)] disabled:cursor-not-allowed disabled:opacity-50"
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
          </div>
        </div>
      )}
    </div>
  );
}
