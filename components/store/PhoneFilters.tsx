"use client";

import { ChevronDown, Search, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

type MasterItem = {
  _id: string;
  name?: string;
  value?: string;
  isActive: boolean;
};

type PhoneFiltersResponse = {
  brands: MasterItem[];
  compatibleBrands: MasterItem[];
  variants: MasterItem[];
  rams: MasterItem[];
  roms: MasterItem[];
  price: {
    min: number;
    max: number;
  };
};

export type PhoneFilterValues = {
  search: string;
  brand: string;
  variant: string;
  ram: string;
  rom: string;
  rating: string;
  priceMin: number;
  priceMax: number;
  priceChanged: boolean;
  priceSort: "" | "low-high" | "high-low";
};

type PhoneFiltersProps = {
  onChange: (filters: PhoneFilterValues) => void;
};

export default function PhoneFilters({ onChange }: PhoneFiltersProps) {
  /*
   * ------------------------------------------------
   * FILTER STATE
   * ------------------------------------------------
   */

  const [searchTerm, setSearchTerm] = useState("");

  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [selectedBrand, setSelectedBrand] = useState("");

  const [isBrandAutoSelected, setIsBrandAutoSelected] = useState(false);

  const [autoSelectedBrandName, setAutoSelectedBrandName] = useState("");

  const [selectedVariant, setSelectedVariant] = useState("");

  const [selectedRam, setSelectedRam] = useState("");

  const [selectedRom, setSelectedRom] = useState("");

  const [selectedRating, setSelectedRating] = useState("");

  const [openFilter, setOpenFilter] = useState<
    "brand" | "variant" | "ram" | "rom" | "rating" | null
  >(null);

  const [filters, setFilters] = useState<PhoneFiltersResponse>({
    brands: [],
    compatibleBrands: [],
    variants: [],
    rams: [],
    roms: [],
    price: {
      min: 0,
      max: 0,
    },
  });

  /*
   * ------------------------------------------------
   * PRICE
   * ------------------------------------------------
   */

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const [priceChanged, setPriceChanged] = useState(false);

  const [priceSort, setPriceSort] = useState<
  "" | "low-high" | "high-low"
>("");

  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const priceFilterRef = useRef<HTMLDivElement>(null);

  const brandFilterRef = useRef<HTMLDivElement>(null);
  const variantFilterRef = useRef<HTMLDivElement>(null);
  const ramFilterRef = useRef<HTMLDivElement>(null);
  const romFilterRef = useRef<HTMLDivElement>(null);
  const ratingFilterRef = useRef<HTMLDivElement>(null);

  /*
   * ------------------------------------------------
   * SEND FILTERS TO PARENT
   * ------------------------------------------------
   */

  useEffect(() => {
    onChange({
      search: debouncedSearch,
      brand: selectedBrand,
      variant: selectedVariant,
      ram: selectedRam,
      rom: selectedRom,
      rating: selectedRating,
      priceMin: priceRange[0],
      priceMax: priceRange[1],
      priceChanged,
      priceSort
    });
  }, [
    debouncedSearch,
    selectedBrand,
    selectedVariant,
    selectedRam,
    selectedRom,
    selectedRating,
    priceRange,
    priceChanged,
    priceSort,
    onChange,
  ]);

  /*
   * ------------------------------------------------
   * FETCH FILTER OPTIONS
   * ------------------------------------------------
   */

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();

        if (selectedBrand && !isBrandAutoSelected) {
          params.set("brandId", selectedBrand);
        }

        if (isBrandAutoSelected) {
          params.set("excludeBrand", "true");
        }

        if (selectedVariant) {
          params.set("variantId", selectedVariant);
        }

        if (selectedRam) {
          params.set("ramId", selectedRam);
        }

        if (selectedRom) {
          params.set("romId", selectedRom);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones/filters?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch phone filters");
        }

        const data: PhoneFiltersResponse = await response.json();

        setFilters(data);

        /*
         * -----------------------------------------
         * AUTO SELECT BRAND
         * -----------------------------------------
         */

        if (selectedVariant && !selectedBrand) {
          if (data.compatibleBrands.length === 1) {
            setSelectedBrand(data.compatibleBrands[0]._id);
            setAutoSelectedBrandName(data.compatibleBrands[0].name || "");
            setIsBrandAutoSelected(true);
          }
        }

        /*
         * -----------------------------------------
         * PRICE RANGE
         * -----------------------------------------
         */

        setPriceRange((current) => {
          if (!priceChanged) {
            return [data.price.min, data.price.max];
          }

          return [
            Math.max(current[0], data.price.min),
            Math.min(current[1], data.price.max),
          ];
        });

        if (data.rams.length === 1) {
          setSelectedRam((current) =>
            current === data.rams[0]._id ? current : data.rams[0]._id,
          );
        } else if (
          selectedRam &&
          !data.rams.some((ram) => ram._id === selectedRam)
        ) {
          setSelectedRam("");
        }

        if (data.roms.length === 1) {
          setSelectedRom((current) =>
            current === data.roms[0]._id ? current : data.roms[0]._id,
          );
        } else if (
          selectedRom &&
          !data.roms.some((rom) => rom._id === selectedRom)
        ) {
          setSelectedRom("");
        }
      } catch (error) {
        console.error("Error fetching phone filters:", error);
      }
    };

    fetchFilters();
  }, [
    selectedBrand,
    selectedVariant,
    selectedRam,
    selectedRom,
    isBrandAutoSelected,
  ]);

  /*
 * ------------------------------------------------
 * FETCH VARIANTS FOR SELECTED BRAND
 * ------------------------------------------------
 */

useEffect(() => {
  const fetchVariantsByBrand = async () => {
    if (!selectedBrand) {
      return;
    }

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/phones/variants?brandId=${selectedBrand}`,
      );

      if (!response.ok) {
        throw new Error("Failed to fetch variants");
      }

      const data: MasterItem[] = await response.json();

      setSelectedVariant((currentVariant) => {
        const stillValid = data.some(
          (variant) => variant._id === currentVariant,
        );

        if (stillValid) {
          return currentVariant;
        }

        if (data.length === 1) {
          return data[0]._id;
        }

        return "";
      });
    } catch (error) {
      console.error("Error fetching brand variants:", error);
    }
  };

  fetchVariantsByBrand();
}, [selectedBrand]);

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
   * CLOSE PRICE POPUP
   * ------------------------------------------------
   */

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideFilter =
        brandFilterRef.current?.contains(target) ||
        variantFilterRef.current?.contains(target) ||
        ramFilterRef.current?.contains(target) ||
        romFilterRef.current?.contains(target) ||
        priceFilterRef.current?.contains(target) ||
        ratingFilterRef.current?.contains(target);

      if (!clickedInsideFilter) {
        setOpenFilter(null);
        setShowPriceFilter(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  /*
   * ------------------------------------------------
   * CLEAR
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
    setPriceSort("");

    setPriceRange([filters.price.min, filters.price.max]);
  };

  const hasActiveFilters =
    searchTerm.trim() !== "" ||
    selectedBrand !== "" ||
    selectedVariant !== "" ||
    selectedRam !== "" ||
    selectedRom !== "" ||
    selectedRating !== "" ||
    priceChanged ||
    priceSort !== "";
;

  const maxPrice = filters.price.max + 1;

  /*
   * ------------------------------------------------
   * UI
   * ------------------------------------------------
   */

  return (
    <div className="mt-6 flex flex-wrap items-center gap-3 pb-2">
      {/* SEARCH */}

      <div
        className="flex w-full items-center gap-3 rounded-xl border px-4 py-3 sm:w-56"
        style={{
          backgroundColor: "var(--bg-secondary)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        <Search
          size={20}
          style={{
            color: "var(--text-secondary)",
          }}
        />

        <input
          type="text"
          value={searchTerm}
          onChange={(event) => {
            setSearchTerm(event.target.value);
          }}
          placeholder="Search phones..."
          className="w-full bg-transparent outline-none"
          style={{
            color: "var(--text-primary)",
          }}
        />
      </div>

      {/* BRAND */}

      <div ref={brandFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() =>
            setOpenFilter((current) => (current === "brand" ? null : "brand"))
          }
          disabled={
            !isBrandAutoSelected &&
            selectedVariant !== "" &&
            filters.brands.length === 1
          }
          className="flex w-28 cursor-pointer items-center justify-between rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>
            {selectedBrand
              ? filters.brands.find((brand) => brand._id === selectedBrand)
                  ?.name ||
                (isBrandAutoSelected ? autoSelectedBrandName : "Brand")
              : "Brand"}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              openFilter === "brand" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openFilter === "brand" && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-xl border shadow-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {filters.brands.map((brand) => (
              <button
                key={brand._id}
                type="button"
                onClick={() => {
                  setSelectedBrand(brand._id);
                  setIsBrandAutoSelected(false);
                  setSelectedVariant("");
                  setSelectedRam("");
                  setSelectedRom("");
                  setOpenFilter(null);
                }}
                className="w-full px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
              >
                {brand.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VARIANT */}

      <div ref={variantFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() =>
            setOpenFilter((current) =>
              current === "variant" ? null : "variant",
            )
          }
          disabled={false}
          className="flex w-28 cursor-pointer items-center justify-between rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>
            {selectedVariant
              ? filters.variants.find(
                  (variant) => variant._id === selectedVariant,
                )?.name || "Variant"
              : "Variant"}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              openFilter === "variant" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openFilter === "variant" && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-xl border shadow-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {filters.variants.map((variant) => (
              <button
                key={variant._id}
                type="button"
                onClick={() => {
                  
                  setSelectedVariant(variant._id);

                  if (variant._id !== selectedVariant) {
                    setSelectedBrand("");
                    setIsBrandAutoSelected(false);
                  }
                  
                  setSelectedRam("");
                  setSelectedRom("");

                  setOpenFilter(null);
                }}
                className="w-full px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
              >
                {variant.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* RAM */}

      <div ref={ramFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() =>
            setOpenFilter((current) => (current === "ram" ? null : "ram"))
          }
          disabled={filters.rams.length === 1}
          className="flex w-28 cursor-pointer items-center justify-between rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>
            {selectedRam
              ? filters.rams.find((ram) => ram._id === selectedRam)?.value ||
                "RAM"
              : "RAM"}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              openFilter === "ram" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openFilter === "ram" && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-xl border shadow-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {filters.rams.map((ram) => (
              <button
                key={ram._id}
                type="button"
                onClick={() => {
                  setSelectedRam(ram._id);
                  setOpenFilter(null);
                }}
                className="w-full px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
              >
                {ram.value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ROM */}

      <div ref={romFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() =>
            setOpenFilter((current) => (current === "rom" ? null : "rom"))
          }
          disabled={filters.roms.length === 1}
          className="flex w-28 cursor-pointer items-center justify-between rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>
            {selectedRom
              ? filters.roms.find((rom) => rom._id === selectedRom)?.value ||
                "ROM"
              : "ROM"}
          </span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              openFilter === "rom" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openFilter === "rom" && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-xl border shadow-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {/* <button
              type="button"
              onClick={() => {
                setSelectedRom("");
                setOpenFilter(null);
              }}
              className="w-full cursor-pointer px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
            >
              ROM
            </button> */}

            {filters.roms.map((rom) => (
              <button
                key={rom._id}
                type="button"
                onClick={() => {
                  setSelectedRom(rom._id);
                  setOpenFilter(null);
                }}
                className="w-full px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
              >
                {rom.value}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Rating Filter */}

      <div ref={ratingFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setOpenFilter(openFilter === "rating" ? null : "rating");
            setShowPriceFilter(false);
          }}
          className="flex w-28 cursor-pointer items-center justify-between rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>{selectedRating ? `★ ${selectedRating}` : "Rating"}</span>

          <ChevronDown
            size={16}
            className={`transition-transform ${
              openFilter === "rating" ? "rotate-180" : ""
            }`}
          />
        </button>

        {openFilter === "rating" && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-xl border shadow-lg"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            {["5", "4", "3", "2", "1"].map((rating) => (
              <button
                key={rating}
                type="button"
                onClick={() => {
                  setSelectedRating(rating);
                  setOpenFilter(null);
                }}
                className="w-full px-4 py-2 text-left transition hover:bg-blue-500 hover:text-white"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                ★ {rating}+
              </button>
            ))}
          </div>
        )}
      </div>

      {/* PRICE */}

      <div ref={priceFilterRef} className="relative shrink-0">
        <button
          type="button"
          onClick={() => {
            setOpenFilter(null);
            setShowPriceFilter((current) => !current);
          }}
          className="flex w-28 shrink-0 cursor-pointer items-center justify-left gap-7 rounded-xl border px-3 py-3 outline-none transition"
          style={{
            backgroundColor: "var(--bg-secondary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <span>Price</span>
          <ChevronDown
            size={16}
            className={`transition-transform ${
              showPriceFilter ? "rotate-180" : ""
            }`}
          />
        </button>

        {showPriceFilter && (
          <div
            className="absolute left-0 top-full z-30 mt-2 w-60 rounded-2xl border p-3 shadow-xl"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <p className="text-sm font-semibold">Price</p>

<div className="mt-3 flex gap-2">
  <button
    type="button"
    onClick={() => setPriceSort("low-high")}
    className="rounded-md border px-2 py-1 text-xs transition cursor-pointer"
    style={{
      backgroundColor:
        priceSort === "low-high"
          ? "var(--accent-color)"
          : "var(--bg-primary)",
      color:
        priceSort === "low-high"
          ? "var(--text-primary)"
          : "var(--text-primary)",
      borderColor: "var(--border-color)",
    }}
  >
    Low → High
  </button>

  <button
    type="button"
    onClick={() => setPriceSort("high-low")}
    className="rounded-md border px-2 py-1 text-xs transition cursor-pointer "
    style={{
      backgroundColor:
        priceSort === "high-low"
          ? "var(--accent-color)"
          : "var(--bg-primary)",
      color: "var(--text-primary)",
      borderColor: "var(--border-color)",
    }}
  >
    High → Low
  </button>
</div>

<div className="relative mt-4 h-6">
              <div
                className="absolute left-0 right-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                style={{
                  backgroundColor: "var(--border-color)",
                }}
              />

              <div
                className="absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full"
                style={{
                  left:
                    maxPrice > 0
                      ? `${(priceRange[0] / maxPrice) * 100}%`
                      : "0%",
                  right:
                    maxPrice > 0
                      ? `${100 - (priceRange[1] / maxPrice) * 100}%`
                      : "0%",
                  backgroundColor: "var(--accent-color)",
                }}
              />

              {/* MIN */}

              <input
                type="range"
                min={filters.price.min}
                max={maxPrice}
                value={priceRange[0]}
                onChange={(event) => {
                  const minimum = Number(event.target.value);

                  setPriceRange([
                    Math.min(minimum, priceRange[1]),
                    priceRange[1],
                  ]);

                  setPriceChanged(true);
                }}
                className="price-slider absolute inset-0 w-full"
                style={{
                  zIndex: 3,
                }}
              />

              {/* MAX */}

              <input
                type="range"
                min={filters.price.min}
                max={maxPrice}
                value={priceRange[1]}
                onChange={(event) => {
                  const maximum = Number(event.target.value);

                  setPriceRange([
                    priceRange[0],
                    Math.max(maximum, priceRange[0]),
                  ]);

                  setPriceChanged(true);
                }}
                className="price-slider absolute inset-0 w-full"
                style={{
                  zIndex: 2,
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-3">
              <div
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                ₹{priceRange[0].toLocaleString("en-IN")}
              </div>

              <span
                className="text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                to
              </span>

              <div
                className="flex-1 rounded-lg border px-3 py-2 text-sm"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-primary)",
                }}
              >
                ₹{priceRange[1].toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CLEAR */}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearFilters}
          className="flex shrink-0 cursor-pointer items-center gap-1 rounded-xl px-3 py-3 text-sm font-medium transition"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <X size={16} />
          Clear
        </button>
      )}
    </div>
  );
}
