"use client";

import { useCallback, useEffect, useState, useRef } from "react";
import { ChevronDown, Pencil, Search, X } from "lucide-react";
import Loader from "../Loader";
import PhoneFilters from "../store/PhoneFilters";
import type { PhoneFilterValues } from "../store/PhoneFilters";

type ReferenceValue =
  | string
  | {
      _id: string;
      name?: string;
      value?: string;
    };

type Phone = {
  _id: string;
  name: string;

  brand?: ReferenceValue;
  brandId?: ReferenceValue;

  price: number;
  discountPercentage?: number;
  discountPrice?: number;
  totalPrice?: number;
  description: string;

  image: string;
  imageUrl?: string | null;
  imageFileId?: string | null;

  isNewPhone: boolean;
  isActive: boolean;

  variant?: ReferenceValue;
  variantId?: ReferenceValue;

  ram?: ReferenceValue;
  ramId?: ReferenceValue;

  rom?: ReferenceValue;
  romId?: ReferenceValue;
};

type ManagePhoneListProps = {
  onEdit: (phone: Phone) => void;
  refreshKey: number;
};

type MasterItem = {
  _id: string;
  name?: string;
  value?: string;
  isActive: boolean;
};

const getReferenceText = (value?: ReferenceValue) => {
  if (!value) {
    return "—";
  }

  if (typeof value === "string") {
    return value;
  }

  return value.name || value.value || "—";
};

export default function ManagePhoneList({
  onEdit,
  refreshKey,
}: ManagePhoneListProps) {
  const [phones, setPhones] = useState<Phone[]>([]);

  const [loading, setLoading] = useState(true);


  const [searchTerm, setSearchTerm] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");

  const [selectedVariant, setSelectedVariant] = useState("");
  const [selectedRam, setSelectedRam] = useState("");
  const [selectedRom, setSelectedRom] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [priceRange, setPriceRange] = useState<[number, number]>([0, 0]);

  const [priceChanged, setPriceChanged] = useState(false);


  const [brandVariants, setBrandVariants] = useState<MasterItem[]>([]);
  const handleFiltersChange = useCallback((filters: PhoneFilterValues) => {
    setSearchTerm(filters.search);
    setSelectedBrand(filters.brand);
    setSelectedVariant(filters.variant);
    setSelectedRam(filters.ram);
    setSelectedRom(filters.rom);
    setPriceRange([filters.priceMin, filters.priceMax]);
    setPriceChanged(filters.priceChanged);
  }, []);

  const [filters, setFilters] = useState<{
    brands: MasterItem[];
    variants: MasterItem[];
    rams: MasterItem[];
    roms: MasterItem[];
    price: {
      min: number;
      max: number;
    };
  }>({
    brands: [],
    variants: [],
    rams: [],
    roms: [],
    price: {
      min: 0,
      max: 0,
    },
  });

  const [updatingId, setUpdatingId] = useState<string | null>(null);

  /*
   * -----------------------------------------
   * SEARCH DEBOUNCE
   * -----------------------------------------
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
   * -----------------------------------------
   * FETCH PHONES
   * -----------------------------------------
   */

  useEffect(() => {
    const fetchPhones = async () => {
      try {
        //         if (phones.length === 0 && !isFetching) {
        //   setLoading(true);
        // }

 

        const params = new URLSearchParams();

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

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch phones");
        }

        const data = await response.json();

        setPhones(data.phones || []);
      } catch (error) {
        console.error("Error fetching phones:", error);
      } finally {
        setLoading(false);

      }
    };

    fetchPhones();
  }, [
    refreshKey,
    debouncedSearch,
    selectedBrand,
    selectedVariant,
    selectedRam,
    selectedRom,
    priceRange[0],
    priceRange[1],
    priceChanged,
  ]);

  /*
   * -----------------------------------------
   * FETCH FILTER OPTIONS
   * -----------------------------------------
   */

  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const params = new URLSearchParams();

        if (selectedBrand) {
          params.set("brandId", selectedBrand);
        }

        if (selectedVariant) {
          params.set("variantId", selectedVariant);
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones/filters?${params.toString()}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch phone filters");
        }

        const data = await response.json();

        setFilters(data);

        if (data.rams.length === 1) {
          setSelectedRam(data.rams[0]._id);
        } else if (data.rams.length > 1) {
          setSelectedRam("");
        }

        if (data.roms.length === 1) {
          setSelectedRom(data.roms[0]._id);
        } else if (data.roms.length > 1) {
          setSelectedRom("");
        }
      } catch (error) {
        console.error("Error fetching phone filters:", error);
      }
    };

    fetchFilters();
  }, [selectedBrand, selectedVariant]);

  /*
   * -----------------------------------------
   * FETCH VARIANTS BY BRAND
   * -----------------------------------------
   */

  useEffect(() => {
    const fetchVariantsByBrand = async () => {
      if (!selectedBrand) {
        setBrandVariants([]);
        return;
      }

      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones/variants?brandId=${selectedBrand}`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch variants");
        }

        const data = await response.json();

        setBrandVariants(data);
        setSelectedVariant((currentVariant) => {
          const stillValid = data.some(
            (variant: MasterItem) => variant._id === currentVariant,
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
   * -----------------------------------------
   * RESET DEPENDENT FILTERS
   * -----------------------------------------
   */

  // useEffect(() => {
  //   setSelectedVariant("");
  //   setSelectedRam("");
  //   setSelectedRom("");
  // }, [selectedBrand]);

  /*
   * -----------------------------------------
   * SET INITIAL PRICE RANGE
   * -----------------------------------------
   */

  useEffect(() => {
    if (filters.price.max > 0 && !priceChanged) {
      setPriceRange([0, filters.price.max]);
    }
  }, [filters.price.max, priceChanged]);

  /*
   * -----------------------------------------
   * TOGGLE ACTIVE / INACTIVE
   * -----------------------------------------
   */
  const togglePhoneStatus = async (phone: Phone) => {
    try {
      setUpdatingId(phone._id);

      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/phones/${phone._id}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update phone status");
      }

      setPhones((currentPhones) =>
        currentPhones.map((currentPhone) =>
          currentPhone._id === phone._id
            ? {
                ...currentPhone,
                isActive: data.phone?.isActive ?? !currentPhone.isActive,
              }
            : currentPhone,
        ),
      );
    } catch (error) {
      console.error("Toggle phone status error:", error);
    } finally {
      setUpdatingId(null);
    }
  };

  /*
   * -----------------------------------------
   * LOADING
   * -----------------------------------------
   */
  if (loading) {
    return <Loader />;
  }

  /*
   * -----------------------------------------
   * UI
   * -----------------------------------------
   */
  return (
    <section className="mt-6">
      {/* FILTERS from PhoneFilters component */}
      <PhoneFilters onChange={handleFiltersChange} />

      <div className="mt-8 space-y-4">
        {phones.length === 0 ? (
          <div
            className="rounded-2xl border p-8 text-center"
            style={{
              backgroundColor: "var(--bg-secondary)",
              color: "var(--text-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            No phones found.
          </div>
        ) : (
          phones.map((phone) => {
            const brand = phone.brandId || phone.brand;

            const variant = phone.variantId || phone.variant;

            const ram = phone.ramId || phone.ram;

            const rom = phone.romId || phone.rom;

            return (
              <div
                key={phone._id}
                className="flex flex-col gap-5 rounded-2xl border p-5 transition sm:flex-row sm:items-center sm:gap-6"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {/* IMAGE */}
                <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl">
  <img
    src={phone.image || "/phone-placeholder.png"}
    alt={phone.name}
    onError={(event) => {
      event.currentTarget.onerror = null;
      event.currentTarget.src = "/phone-placeholder.png";
    }}
    className="h-full w-full object-contain"
  />
</div>

                {/* DETAILS */}
                <div className="flex-1">
                  <p
                    className="text-sm"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    {getReferenceText(brand)}
                  </p>

                  <h3
                    className="text-xl font-bold"
                    style={{
                      color: "var(--text-primary)",
                    }}
                  >
                    {phone.name}
                  </h3>

                  <div className="mt-1">
                    {phone.discountPercentage &&
                    phone.discountPercentage > 0 ? (
                      <>
                        <div className="flex items-center gap-2">
                          <span
                            className="text-sm line-through"
                            style={{
                              color: "var(--text-secondary)",
                            }}
                          >
                            ₹{phone.price.toLocaleString("en-IN")}
                          </span>

                          <span
                            className="text-sm font-medium"
                            style={{
                              color: "var(--text-primary)",
                            }}
                          >
                            {phone.discountPercentage}% OFF
                          </span>
                        </div>

                        <span
                          className="mt-1 block font-medium"
                          style={{
                            color: "var(--text-primary)",
                          }}
                        >
                          ₹
                          {Math.round(phone.totalPrice ?? phone.price).toLocaleString(
                            "en-IN",
                          )}
                        </span>
                      </>
                    ) : (
                      <span
                        style={{
                          color: "var(--text-secondary)",
                        }}
                      >
                        ₹{phone.price.toLocaleString("en-IN")}
                      </span>
                    )}
                  </div>

                  <div
                    className="mt-2 flex flex-wrap gap-2 text-xs"
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span>{getReferenceText(variant)}</span>

                    <span>•</span>

                    <span>{getReferenceText(ram)} RAM</span>

                    <span>•</span>

                    <span>{getReferenceText(rom)} ROM</span>
                  </div>
                </div>

                {/* ACTIONS */}
                <div className="flex shrink-0 items-center gap-3">
                  {/* EDIT */}
                  <button
                    type="button"
                    onClick={() => onEdit(phone)}
                    className="theme-accent-hover flex cursor-pointer items-center gap-2 rounded-full px-5 py-2.5 text-sm font-semibold transition "
                    style={{
                      backgroundColor: "var(--text-primary)",
                      color: "var(--bg-primary)",
                    }}
                  >
                    <Pencil size={15} />
                    Edit Phone
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}
