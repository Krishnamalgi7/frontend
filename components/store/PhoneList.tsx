"use client";

import { useCallback, useEffect, useState } from "react";

import Loader from "../Loader";

import PhoneCard from "./PhoneCard";
import PhoneFilters from "./PhoneFilters";
import type { PhoneFilterValues } from "./PhoneFilters";

type MasterItem = {
  _id: string;
  name?: string;
  value?: string;
  isActive: boolean;
};

type Phone = {
  _id: string;
  name: string;

  brand:
    | string
    | {
        _id: string;
        name: string;
      };

  variant:
    | string
    | {
        _id: string;
        name: string;
      };

  ram:
    | string
    | {
        _id: string;
        value: string;
      };

  rom:
    | string
    | {
        _id: string;
        value: string;
      };

  price: number;
  quantity?: number;
  colorId?: string | { _id: string; name: string };
  discountPercentage?: number;
  discountPrice?: number;
  totalPrice?: number;
  description: string;
  image: string;
  isNewPhone: boolean;
  averageRating?: number;
ratingCount?: number;
};

type PhoneFilters = {
  brands: MasterItem[];
  variants: MasterItem[];
  rams: MasterItem[];
  roms: MasterItem[];

  price: {
    min: number;
    max: number;
  };
};

export default function PhoneList() {
  const [phones, setPhones] = useState<Phone[]>([]);

  const [filters, setFilters] = useState<PhoneFilters>({
    brands: [],
    variants: [],
    rams: [],
    roms: [],
    price: {
      min: 0,
      max: 0,
    },
  });

  const [loading, setLoading] = useState(true);

  const [isFetching, setIsFetching] = useState(false);

  const [error, setError] = useState("");

  // Pagination

  const [currentPage, setCurrentPage] = useState(1);

  const [totalPages, setTotalPages] = useState(0);

  // Search

  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Selected master-data IDs

  const [selectedBrand, setSelectedBrand] = useState("");

  const [selectedVariant, setSelectedVariant] = useState("");

  const [selectedRam, setSelectedRam] = useState("");

  const [selectedRom, setSelectedRom] = useState("");

  const [selectedRating, setSelectedRating] = useState("");

  const [priceSort, setPriceSort] = useState<
  "" | "low-high" | "high-low"
>("");

  const handleFiltersChange = useCallback((filters: PhoneFilterValues) => {
    setSearchTerm(filters.search);
    setSelectedBrand(filters.brand);
    setSelectedVariant(filters.variant);
    setSelectedRam(filters.ram);
    setSelectedRom(filters.rom);
    setSelectedRating(filters.rating);
    setPriceRange([filters.priceMin, filters.priceMax]);
    setPriceChanged(filters.priceChanged);
    setCurrentPage(1);
    setPriceSort(filters.priceSort);
  }, []);

  // Price

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const [priceChanged, setPriceChanged] = useState(false);

  /*
   * ------------------------------------------------
   * BUILD API PARAMETERS
   * ------------------------------------------------
   */

  const buildParams = () => {
    const params = new URLSearchParams();

    params.set("page", String(currentPage));

    // 6 phones per page
    params.set("limit", "6");

    if (debouncedSearch.trim()) {
      params.set("search", debouncedSearch.trim());
    }

    if (selectedBrand) {
      params.set("brand", selectedBrand);
    }

    if (selectedVariant) {
      params.set("variant", selectedVariant);
    }

    if (selectedRam) {
      params.set("ram", selectedRam);
    }

    if (selectedRom) {
      params.set("rom", selectedRom);
    }

    if (priceChanged) {
      params.set("minPrice", String(priceRange[0]));

      params.set("maxPrice", String(priceRange[1]));
    }

    if (priceSort) {
  params.set("priceSort", priceSort);
}

    if (selectedRating) {
  params.set("minRating", selectedRating);
}

    return params;
  };

  /*
   * ------------------------------------------------
   * RESET PAGE
   * ------------------------------------------------
   */

  // const resetToFirstPage = () => {
  //   setCurrentPage(1);
  // };

  const changePage = (page: number) => {
    setCurrentPage(page);

    document.getElementById("phones")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  /*
   * ------------------------------------------------
   * CLEAR FILTERS
   * ------------------------------------------------
   */

  const clearFilters = () => {
    setSearchTerm("");

    setDebouncedSearch("");

    setSelectedBrand("");

    setSelectedVariant("");

    setSelectedRam("");

    setSelectedRom("");

    setSelectedRating("");

    setPriceChanged(false);

    setCurrentPage(1);

    setPriceSort("");

    if (filters.price.max > 0) {
      setPriceRange([filters.price.min, filters.price.max]);
    } else {
      setPriceRange([0, 0]);
    }
  };

  /*
   * ------------------------------------------------
   * FETCH PHONES
   * ------------------------------------------------
   */

  useEffect(() => {
    const controller = new AbortController();
    const fetchPhones = async () => {
      try {

        setIsFetching(true);

        setError("");

        const params = buildParams();

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones?${params.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          throw new Error("Failed to fetch phones");
        }

        const data = await response.json();

        setPhones(data.phones || []);

        setTotalPages(data.pagination?.totalPages || 0);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }

        console.error("Error fetching phones:", error);
        setError("Unable to load phones.");
      } finally {
        setLoading(false);

        setIsFetching(false);
      }
    };
    fetchPhones();

    return () => {
      controller.abort();
    };
  }, [
    currentPage,
    debouncedSearch,
    selectedBrand,
    selectedVariant,
    selectedRam,
    selectedRom,
    selectedRating,
    priceRange,
    priceChanged,
    priceSort,
  ]);

  /*
   * ------------------------------------------------
   * SEARCH DEBOUNCE
   * ------------------------------------------------
   */

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [searchTerm]);

  /*
   * ------------------------------------------------
   * HELPERS
   * ------------------------------------------------
   */

  const getBrandName = (brand: Phone["brand"]) => {
    if (typeof brand === "string") {
      return brand;
    }

    return brand?.name || "";
  };

  /*
   * ------------------------------------------------
   * ACTIVE FILTER CHECK
   * ------------------------------------------------
   */

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedBrand !== "" ||
    selectedVariant !== "" ||
    selectedRam !== "" ||
    selectedRom !== "" ||
    priceChanged;

  /*
   * ------------------------------------------------
   * PRICE
   * ------------------------------------------------
   */

  const maxPrice = filters.price.max;

  if (loading) {
    return <Loader />;
  }

  return (
    <section
      id="phones"
      className="px-6 py-12 md:px-12 lg:px-24"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* HEADING */}

        <h2
          className="text-3xl font-bold"
          style={{
            color: "var(--text-primary)",
          }}
        >
          Explore Our Phones
        </h2>

        {/* FILTER ROW */}

        <PhoneFilters onChange={handleFiltersChange} />

        {/* FETCHING INDICATOR */}

        {isFetching && !loading && (
          <div
            className="mb-3 flex items-center justify-end gap-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            <span
              className="h-2 w-2 animate-pulse rounded-full"
              style={{
                backgroundColor: "var(--accent-color)",
              }}
            />
            Updating results...
          </div>
        )}

        {/* PHONE GRID */}

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {error && (
            <p
              className="col-span-full text-center"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {error}
            </p>
          )}

          {!loading &&
            !error &&
            phones.map((phone) => (
              <PhoneCard
                key={phone._id}
                id={phone._id}
                brand={getBrandName(phone.brand)}
                name={phone.name}
                description={phone.description}
                price={phone.price}
                quantity={phone.quantity}
                color={
  typeof phone.colorId === "string"
    ? phone.colorId
    : phone.colorId?.name
}

averageRating={phone.averageRating}
ratingCount={phone.ratingCount}

                discountPercentage={phone.discountPercentage}
                discountPrice={phone.discountPrice}
                totalPrice={phone.totalPrice}
                image={phone.image}
                isNew={phone.isNewPhone}
              />
            ))}

          {!loading && !error && phones.length === 0 && (
            <p
              className="col-span-full py-10 text-center"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              No phones found matching your filters.
            </p>
          )}
        </div>

        {/* PAGINATION */}

        {!loading && !error && totalPages > 1 && (
          <div className="mt-10 flex items-center justify-center gap-4">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => changePage(currentPage - 1)}
              className="cursor-pointer rounded-xl border px-5 py-3 transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              Previous
            </button>

            <span
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              Page {currentPage} of {totalPages}
            </span>

            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() => changePage(currentPage + 1)}
              className="cursor-pointer rounded-xl border px-5 py-3 transition disabled:cursor-not-allowed disabled:opacity-40"
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
