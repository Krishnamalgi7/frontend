"use client";

import Loader from "../Loader";
import { useEffect, useRef, useState } from "react";
import {
  Minus,
  Plus,
  Smartphone,
  Tag,
  Grid2X2,
  ChevronDown,
  Trash2,
  X,
} from "lucide-react";

type Phone = {
  _id: string;
  name: string;

  brand:
    | string
    | {
        _id: string;
        name: string;
      };

  brandId?: string | { _id: string; name: string };

  variant:
    | string
    | {
        _id: string;
        name: string;
      };

  variantId?: string | { _id: string; name: string };

  ram:
    | string
    | {
        _id: string;
        value: string;
      };

  ramId?: string | { _id: string; value: string };

  rom:
    | string
    | {
        _id: string;
        value: string;
      };

  romId?: string | { _id: string; value: string };

  colorId?: string | { _id: string; name: string };
  color?: string | { _id: string; name: string };
  price: number;
  quantity?: number;
  discountPercentage?: number;
  discountPrice?: number;
  totalPrice?: number;
  discountId?: string | null;
  description: string;
  image: string;
  imageUrl?: string | null;
  images?: string[];
  imageFileId?: string | null;
  isNewPhone: boolean;
  averageRating?: number;
};

type PhoneFormProps = {
  editingPhone: Phone | null;
  onEditComplete?: () => void;
};

type MasterItem = {
  _id: string;
  name?: string;
  value?: string;
  percentage?: number;
  isActive: boolean;
};

export default function PhoneForm({
  editingPhone,
  onEditComplete,
}: PhoneFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    variant: "",
    ram: "",
    rom: "",
    color: "",
    price: "",
    quantity: "",
    discount: " ",
    description: "",
    imageUrl: "",
    isNewPhone: false,
    averageRating: "",
  });

  const [imageFile, setImageFile] = useState<File | null>(null);

  const [additionalImageFiles, setAdditionalImageFiles] = useState<
    (File | null)[]
  >([null, null, null, null]);

  const [existingAdditionalImages, setExistingAdditionalImages] = useState<
    (string | null)[]
  >([null, null, null, null]);

  const [removedAdditionalImages, setRemovedAdditionalImages] = useState<
    string[]
  >([]);

  const [imageType, setImageType] = useState<"upload" | "url">("upload");

  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [imageRemoved, setImageRemoved] = useState(false);

  const [status, setStatus] = useState("");

  const [brands, setBrands] = useState<MasterItem[]>([]);

  const [variants, setVariants] = useState<MasterItem[]>([]);

  const [rams, setRams] = useState<MasterItem[]>([]);

  const [colors, setColors] = useState<MasterItem[]>([]);

  const [openDropdown, setOpenDropdown] = useState<
    "brand" | "variant" | "ram" | "rom" | "color" | "discount" | null
  >(null);

  const brandDropdownRef = useRef<HTMLDivElement>(null);
  const variantDropdownRef = useRef<HTMLDivElement>(null);
  const ramDropdownRef = useRef<HTMLDivElement>(null);
  const romDropdownRef = useRef<HTMLDivElement>(null);
  const colorDropdownRef = useRef<HTMLDivElement>(null);
  const discountDropdownRef = useRef<HTMLDivElement>(null);

  const [roms, setRoms] = useState<MasterItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [discounts, setDiscounts] = useState<MasterItem[]>([]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      const clickedInsideDropdown =
        brandDropdownRef.current?.contains(target) ||
        variantDropdownRef.current?.contains(target) ||
        ramDropdownRef.current?.contains(target) ||
        romDropdownRef.current?.contains(target) ||
        colorDropdownRef.current?.contains(target) ||
        discountDropdownRef.current?.contains(target);

      if (!clickedInsideDropdown) {
        setOpenDropdown(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * ------------------------------------------------
   * LOAD EDITING PHONE
   * ------------------------------------------------
   */

  useEffect(() => {
    if (editingPhone) {
      setFormData({
        name: editingPhone.name,

        brand:
          typeof editingPhone.brandId === "string"
            ? editingPhone.brandId
            : editingPhone.brandId?._id ||
              (typeof editingPhone.brand === "string"
                ? editingPhone.brand
                : editingPhone.brand?._id || ""),

        variant:
          typeof editingPhone.variantId === "string"
            ? editingPhone.variantId
            : editingPhone.variantId?._id ||
              (typeof editingPhone.variant === "string"
                ? editingPhone.variant
                : editingPhone.variant?._id || ""),

        ram:
          typeof editingPhone.ramId === "string"
            ? editingPhone.ramId
            : editingPhone.ramId?._id ||
              (typeof editingPhone.ram === "string"
                ? editingPhone.ram
                : editingPhone.ram?._id || ""),

        rom:
          typeof editingPhone.romId === "string"
            ? editingPhone.romId
            : editingPhone.romId?._id ||
              (typeof editingPhone.rom === "string"
                ? editingPhone.rom
                : editingPhone.rom?._id || ""),

        color:
          typeof editingPhone.colorId === "string"
            ? editingPhone.colorId
            : editingPhone.colorId?._id ||
              (typeof editingPhone.color === "string"
                ? editingPhone.color
                : editingPhone.color?._id || ""),

        price: formatPrice(String(editingPhone.price)),

        quantity: String(editingPhone.quantity || ""),

        description: editingPhone.description,

        imageUrl: editingPhone.imageUrl || "",

        isNewPhone: editingPhone.isNewPhone,
        averageRating: String(editingPhone.averageRating ?? ""),
        discount: editingPhone.discountId || "",
      });

      setImageFile(null);

      setImageType(editingPhone.imageUrl ? "url" : "upload");

      const existingImages = editingPhone.images || [];

      setExistingAdditionalImages([
        existingImages[0] || null,
        existingImages[1] || null,
        existingImages[2] || null,
        existingImages[3] || null,
      ]);

      setAdditionalImageFiles([null, null, null, null]);
      setRemovedAdditionalImages([]);

      setImagePreview(editingPhone.image);

      setImageRemoved(false);
      setStatus("");
    } else {
      setFormData({
        name: "",
        brand: "",
        variant: "",
        ram: "",
        rom: "",
        color: "",
        price: "",
        quantity: "",
        description: "",
        imageUrl: "",
        isNewPhone: false,
        averageRating: "",
        discount: "",
      });

      setImageFile(null);
      setImagePreview(null);
      setImageType("upload");
      setImageRemoved(false);
      setStatus("");
    }
  }, [editingPhone]);

  /*
   * ------------------------------------------------
   * FETCH BRAND / VARIANT / RAM / ROM
   * ------------------------------------------------
   */

  useEffect(() => {
    const fetchMasterData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem("adminToken");

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [
          brandsResponse,
          variantsResponse,
          ramsResponse,
          romsResponse,
          discountsResponse,
          colorsResponse,
        ] = await Promise.all([
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/brands?page=1&limit=100`,
            {
              headers,
            },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/variants?page=1&limit=100`,
            {
              headers,
            },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/rams?page=1&limit=100`,
            {
              headers,
            },
          ),

          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/roms?page=1&limit=100`,
            {
              headers,
            },
          ),
          fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/settings/discount?status=active&limit=100`,
            {
              headers,
            },
          ),

          fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/colors`, {
            headers,
          }),
        ]);

        const [
          brandsData,
          variantsData,
          ramsData,
          romsData,
          discountsData,
          colorsData,
        ] = await Promise.all([
          brandsResponse.json(),
          variantsResponse.json(),
          ramsResponse.json(),
          romsResponse.json(),
          discountsResponse.json(),
          colorsResponse.json(),
        ]);

        if (
          !brandsResponse.ok ||
          !variantsResponse.ok ||
          !ramsResponse.ok ||
          !romsResponse.ok ||
          !discountsResponse.ok ||
          !colorsResponse.ok
        ) {
          throw new Error("Failed to fetch master data");
        }

        setBrands(brandsData.items || []);

        setVariants(variantsData.items || []);

        setRams(ramsData.items || []);

        setRoms(romsData.items || []);

        setDiscounts(discountsData.items || []);

        setColors(colorsData.colors || []);
      } catch (error) {
        console.error("Master data error:", error);

        setStatus("Failed to load phone options.");
      } finally {
        setLoading(false);
      }
    };

    fetchMasterData();
  }, []);

  const formatPrice = (value: string) => {
    const numericValue = value.replace(/\D/g, "");

    if (!numericValue) {
      return "";
    }

    return Number(numericValue).toLocaleString("en-IN");
  };
  /*
   * ------------------------------------------------
   * HANDLE INPUT
   * ------------------------------------------------
   */

  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >,
  ) => {
    const { name, value, type } = event.target;

    setFormData({
      ...formData,

      [name]:
        type === "checkbox"
          ? (event.target as HTMLInputElement).checked
          : name === "price"
            ? formatPrice(value)
            : value,
    });

    if (name === "imageUrl" && value) {
      setImagePreview(value);
      setImageRemoved(false);
    }
  };

  /*
   * ------------------------------------------------
   * HANDLE IMAGE FILE
   * ------------------------------------------------
   */

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setImageFile(file);

    setImageRemoved(false);

    const previewUrl = URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  const handleAdditionalImageChange = (
    index: number,
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] || null;

    if (!file) {
      return;
    }

    setAdditionalImageFiles((current) => {
      const updated = [...current];
      updated[index] = file;
      return updated;
    });
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImageFiles((current) => {
      const updated = [...current];
      updated[index] = null;
      return updated;
    });

    const fileInput = document.getElementById(
      `additional-phone-image-${index}`,
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  const handleRemoveExistingAdditionalImage = (index: number) => {
  const image = existingAdditionalImages[index];

  if (!image) {
    return;
  }

  setRemovedAdditionalImages((current) => [...current, image]);

  setExistingAdditionalImages((current) => {
    const updated = [...current];
    updated[index] = null;
    return updated;
  });
};

  /*
   * ------------------------------------------------
   * REMOVE IMAGE
   * ------------------------------------------------
   */

  const handleRemoveImage = () => {
    setImageFile(null);

    setImagePreview(null);

    setImageRemoved(true);

    setFormData((current) => ({
      ...current,
      imageUrl: "",
    }));

    const fileInput = document.getElementById(
      "phone-image",
    ) as HTMLInputElement | null;

    if (fileInput) {
      fileInput.value = "";
    }
  };

  /*
   * ------------------------------------------------
   * RESET FORM
   * ------------------------------------------------
   */

  const resetForm = () => {
    setFormData({
      name: "",
      brand: "",
      variant: "",
      ram: "",
      rom: "",
      price: "",
      quantity: "",
      discount: "",
      color: "",
      description: "",
      imageUrl: "",
      isNewPhone: false,
      averageRating: "",
    });

    setImageFile(null);

    setImagePreview(null);

    setImageType("upload");

    setImageRemoved(false);

    setStatus("");
  };

  /*
   * ------------------------------------------------
   * SUBMIT
   * ------------------------------------------------
   */

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setStatus(editingPhone ? "Updating phone..." : "Adding phone...");

      const data = new FormData();

      data.append("name", formData.name);

      /*
       * Send reference IDs
       */
      data.append("brandId", formData.brand);

      data.append("variantId", formData.variant);

      data.append("ramId", formData.ram);

      data.append("romId", formData.rom);

      data.append("colorId", formData.color);

      data.append("discountId", formData.discount);

      data.append("price", formData.price.replace(/,/g, ""));

      data.append("quantity", formData.quantity);

      data.append("averageRating", formData.averageRating);

      data.append("description", formData.description);

      data.append("isNewPhone", String(formData.isNewPhone));

      /*
       * Upload image
       */
      if (imageType === "upload" && imageFile) {
        data.append("image", imageFile);
      }

      additionalImageFiles.forEach((file) => {
        if (file) {
          data.append("images", file);
        }
      });

      /*
       * Image URL
       */
      if (imageType === "url" && formData.imageUrl) {
        data.append("imageUrl", formData.imageUrl);
      }

      /*
       * Image removed
       */
      if (imageRemoved) {
        data.append("imageRemoved", "true");
      }

      
if (removedAdditionalImages.length > 0) {
  const normalizedImages = removedAdditionalImages.map((image) => {
    try {
      return decodeURIComponent(new URL(image).pathname);
    } catch {
      return image;
    }
  });

  data.append(
    "removedAdditionalImages",
    JSON.stringify(normalizedImages),
  );
}



      const url = editingPhone
        ? `${process.env.NEXT_PUBLIC_API_URL}/api/phones/${editingPhone._id}`
        : `${process.env.NEXT_PUBLIC_API_URL}/api/phones`;

      const method = editingPhone ? "PUT" : "POST";

      const token = localStorage.getItem("adminToken");

      // for (const [key, value] of data.entries()) {
      //   console.log(key, value);
      // }

      const response = await fetch(url, {
        method,

        headers: {
          Authorization: `Bearer ${token}`,
        },

        body: data,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Operation failed");
      }

      setStatus(
        editingPhone
          ? "Phone updated successfully."
          : "Phone added successfully.",
      );

      resetForm();

      if (editingPhone) {
        onEditComplete?.();
        return;
      }

      // Add Phone successful
      onEditComplete?.();
    } catch (error) {
      console.error("Phone form error:", error);

      setStatus(
        editingPhone ? "Failed to update phone." : "Failed to add phone.",
      );
    }
  };

  if (loading) {
    return <Loader />;
  }

  /*
   * ------------------------------------------------
   * UI
   * ------------------------------------------------
   */

  return (
    <section
      className="rounded-2xl border p-5"
      style={{
        backgroundColor: "var(--bg-secondary)",

        color: "var(--text-primary)",

        borderColor: "var(--border-color)",

        boxShadow: "0 10px 30px rgba(0, 0, 0, 0.08)",
      }}
    >
      {/* TITLE */}

      <form onSubmit={handleSubmit} className="space-y-4 p-2">
        {/* NAME / BRAND / VARIANT */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* PHONE NAME */}

          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Phone name"
            required
            className="w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
            style={{
              backgroundColor: "var(--bg-primary)",

              color: "var(--text-primary)",

              borderColor: "var(--border-color)",

              outlineColor: "var(--accent-color)",
            }}
          />

          {/* BRAND */}

          <div ref={brandDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "brand" ? null : "brand",
                )
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {brands.find((brand) => brand._id === formData.brand)?.name ||
                  "Select Brand"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "brand" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "brand" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {brands
                  .filter((brand) => brand.isActive)
                  .map((brand) => (
                    <button
                      key={brand._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          brand: brand._id,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {brand.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* VARIANT */}

          <div ref={variantDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "variant" ? null : "variant",
                )
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {variants.find((variant) => variant._id === formData.variant)
                  ?.name || "Select Variant"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "variant" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "variant" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {variants
                  .filter((variant) => variant.isActive)
                  .map((variant) => (
                    <button
                      key={variant._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          variant: variant._id,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="block w-full  px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {variant.name}
                    </button>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* RAM / ROM / PRICE */}

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {/* RAM */}

          <div ref={ramDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) => (current === "ram" ? null : "ram"))
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {rams.find((ram) => ram._id === formData.ram)?.value ||
                  "Select RAM"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "ram" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "ram" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {rams
                  .filter((ram) => ram.isActive)
                  .map((ram) => (
                    <button
                      key={ram._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          ram: ram._id,
                        }));

                        setOpenDropdown(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {ram.value}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* ROM */}

          <div ref={romDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) => (current === "rom" ? null : "rom"))
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {roms.find((rom) => rom._id === formData.rom)?.value ||
                  "Select ROM"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "rom" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "rom" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {roms
                  .filter((rom) => rom.isActive)
                  .map((rom) => (
                    <button
                      key={rom._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          rom: rom._id,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="block w-full  px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {rom.value}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* COLOR */}

          <div ref={colorDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "color" ? null : "color",
                )
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {colors.find((color) => color._id === formData.color)?.name ||
                  "Select Color"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "color" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "color" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                {colors
                  .filter((color) => color.isActive)
                  .map((color) => (
                    <button
                      key={color._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          color: color._id,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {color.name}
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* DISCOUNT */}

          <div ref={discountDropdownRef} className="relative w-full">
            <button
              type="button"
              onClick={() =>
                setOpenDropdown((current) =>
                  current === "discount" ? null : "discount",
                )
              }
              className="flex w-full cursor-pointer items-center justify-between rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
                outlineColor: "var(--accent-color)",
              }}
            >
              <span>
                {discounts.find(
                  (discount) => discount._id === formData.discount,
                )
                  ? `${
                      discounts.find(
                        (discount) => discount._id === formData.discount,
                      )?.percentage
                    }% OFF`
                  : "No Discount"}
              </span>

              <ChevronDown
                size={16}
                className={`transition-transform ${
                  openDropdown === "discount" ? "rotate-180" : ""
                }`}
              />
            </button>

            {openDropdown === "discount" && (
              <div
                className="absolute left-0 top-full z-50 mt-1 w-full overflow-hidden rounded-lg border shadow-lg"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <button
                  type="button"
                  onClick={() => {
                    setFormData((current) => ({
                      ...current,
                      discount: "",
                    }));
                    setOpenDropdown(null);
                  }}
                  className="flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-sm transition 
             hover:bg-[#2563eb] hover:text-white focus:outline-none focus:ring-2 
             focus:ring-[#2563eb] focus:ring-offset-1"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  <Trash2 size={16} />
                  Remove Discount
                </button>

                {discounts
                  .filter((discount) => discount.isActive)
                  .map((discount) => (
                    <button
                      key={discount._id}
                      type="button"
                      onClick={() => {
                        setFormData((current) => ({
                          ...current,
                          discount: discount._id,
                        }));
                        setOpenDropdown(null);
                      }}
                      className="block w-full px-3 py-2.5 text-left text-sm transition hover:bg-[#2563eb]"
                      style={{
                        color: "var(--text-primary)",
                      }}
                    >
                      {discount.percentage}% OFF
                    </button>
                  ))}
              </div>
            )}
          </div>

          {/* PRICE */}
          <div
            className="flex w-full items-center rounded-lg border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  price: String(
                    Math.max(0, parseInt(current.price || "0", 10) - 1),
                  ),
                }))
              }
              className="flex h-full cursor-pointer items-center justify-center px-4 py-2.5 transition hover:opacity-70"
              style={{
                color: "var(--text-primary)",
              }}
            >
              <Minus size={18} />
            </button>

            <input
              name="price"
              type="text"
              inputMode="numeric"
              pattern="[0-9,]*"
              min="0"
              value={formData.price}
              onChange={handleChange}
              onWheel={(event) => event.currentTarget.blur()}
              placeholder="Price"
              required
              className="w-full bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  price: String(parseInt(current.price || "0", 10) + 1),
                }))
              }
              className="flex h-full cursor-pointer items-center justify-center px-4 py-2.5 transition hover:opacity-70"
              style={{
                color: "var(--text-primary)",
              }}
            >
              <Plus size={18} />
            </button>
          </div>

          {/* QUANTITY */}
          <div
            className="flex w-full items-center rounded-lg border"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <button
              type="button"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  quantity: String(
                    Math.max(0, parseInt(current.quantity || "0", 10) - 1),
                  ),
                }))
              }
              className="flex h-full cursor-pointer items-center justify-center px-4 py-2.5 transition hover:opacity-70"
              style={{
                color: "var(--text-primary)",
              }}
            >
              <Minus size={18} />
            </button>

            <input
              name="quantity"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={formData.quantity}
              onChange={handleChange}
              onWheel={(event) => event.currentTarget.blur()}
              placeholder="Quantity"
              required
              className="w-full bg-transparent text-center text-sm outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
              style={{
                color: "var(--text-primary)",
              }}
            />

            <button
              type="button"
              onClick={() =>
                setFormData((current) => ({
                  ...current,
                  quantity: String(parseInt(current.quantity || "0", 10) + 1),
                }))
              }
              className="flex h-full cursor-pointer items-center justify-center px-4 py-2.5 transition hover:opacity-70"
              style={{
                color: "var(--text-primary)",
              }}
            >
              <Plus size={18} />
            </button>
          </div>        
        </div>

        {/* DESCRIPTION */}

        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          rows={3}
          required
          className="w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition focus:ring-1"
          style={{
            backgroundColor: "var(--bg-primary)",

            color: "var(--text-primary)",

            borderColor: "var(--border-color)",

            outlineColor: "var(--accent-color)",
          }}
        />

        {/* PHONE IMAGE */}

        <div>
          {/* <p
            className="mb-2 text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Phone Image
          </p> */}

          {/* IMAGE TYPE */}

          <div className="mb-3 flex gap-5 text-sm">
            {/* UPLOAD */}

            <label
              className="flex cursor-pointer items-center gap-2"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="radio"
                name="imageType"
                checked={imageType === "upload"}
                onChange={() => {
                  setImageType("upload");

                  if (!imageFile && editingPhone) {
                    setImagePreview(editingPhone.image);
                  }
                }}
                className="cursor-pointer accent-[var(--accent-color)]"
              />
              Upload from computer
            </label>

            {/* URL */}

            <label
              className="flex cursor-pointer items-center gap-2"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              <input
                type="radio"
                name="imageType"
                checked={imageType === "url"}
                onChange={() => {
                  setImageType("url");

                  if (formData.imageUrl) {
                    setImagePreview(formData.imageUrl);
                  } else {
                    setImagePreview(null);
                  }
                }}
                className="cursor-pointer accent-[var(--accent-color)]"
              />
              Use image URL
            </label>
          </div>

          {/* IMAGE SLOT SELECTOR */}

          <div className="mt-5">
            <p
              className="mb-3 text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              Product Images
            </p>

            <div className="grid grid-cols-5 gap-3">
              {/* PRIMARY IMAGE */}
              <label
                htmlFor="primary-image-slot"
                className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-2 text-center transition hover:opacity-80"
                style={{
                  borderColor: "var(--accent-color)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                {imageFile ? (
                  <img
                    src={URL.createObjectURL(imageFile)}
                    alt="Primary phone image"
                    className="h-full w-full rounded-lg object-contain"
                  />
                ) : (
                  <>
                    <div
                      className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--accent-color)",
                      }}
                    >
                      ↑
                    </div>
                    <span className="text-sm font-semibold">Primary Image</span>
                    <span
                      className="mt-1 text-xs"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      PNG, JPG or WEBP
                    </span>
                  </>
                )}

                <input
                  id="primary-image-slot"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="sr-only"
                />
              </label>

              {/* ADDITIONAL IMAGES */}
              {additionalImageFiles.map((file, index) => (
                <label
                  key={index}
                  htmlFor={`additional-phone-image-${index}`}
                  className="relative flex aspect-square cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed p-2 text-center transition hover:opacity-80"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  {file ? (
                    <img
                      src={URL.createObjectURL(file)}
                      alt={`Additional image ${index + 1}`}
                      className="h-full w-full object-contain"
                    />
                  ) : existingAdditionalImages[index] ? (
  <>
    <img
      src={
        existingAdditionalImages[index]?.startsWith("http")
          ? existingAdditionalImages[index]!
          : `${process.env.NEXT_PUBLIC_API_URL}${existingAdditionalImages[index]}`
      }
      alt={`Additional image ${index + 1}`}
      className="h-full w-full object-contain"
    />

    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        handleRemoveExistingAdditionalImage(index);
      }}
      className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition hover:opacity-70"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
        borderColor: "var(--border-color)",
      }}
      aria-label={`Remove existing additional image ${index + 1}`}
    >
      <X size={14} />
    </button>
  </>
) : (
                    <>
                      <span
                        className="mb-2 flex h-9 w-9 items-center justify-center rounded-full"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--accent-color)",
                        }}
                      >
                        ↑
                      </span>

                      <span
                        className="text-xs font-semibold"
                        style={{
                          color: "var(--text-primary)",
                        }}
                      >
                        More Image
                      </span>
                      <span
                        className="mt-1 text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        PNG, JPG or WEBP
                      </span>
                    </>
                  )}

                  <input
                    id={`additional-phone-image-${index}`}
                    type="file"
                    accept="image/*"
                    onChange={(event) =>
                      handleAdditionalImageChange(index, event)
                    }
                    className="sr-only"
                  />
                </label>
              ))}
            </div>

            <p
              className="mt-2 text-xs"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              The primary image appears on the phone card. Add up to 4
              additional images for the phone gallery.
            </p>
          </div>

          {/* URL INPUT */}

          {imageType === "url" && (
            <input
              name="imageUrl"
              value={formData.imageUrl}
              onChange={handleChange}
              placeholder="https://example.com/phone-image.jpg"
              type="url"
              required
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-1"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            />
          )}

          {/* IMAGE PREVIEW */}

          {imagePreview && (
            <div
              className="mt-4 rounded-xl border p-4"
              style={{
                backgroundColor: "var(--bg-primary)",

                borderColor: "var(--border-color)",
              }}
            >
              <div className="mb-3 flex items-center justify-between">
                <p
                  className="text-sm font-semibold"
                  style={{
                    color: "var(--text-primary)",
                  }}
                >
                  Primary Image Preview
                </p>

                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="cursor-pointer rounded-full border px-3 py-1 text-xs font-semibold transition hover:opacity-70"
                  style={{
                    color: "var(--text-primary)",

                    borderColor: "var(--border-color)",

                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  Remove Image
                </button>
              </div>

              <div className="flex h-48 items-center justify-center overflow-hidden rounded-lg">
                <img
                  src={imagePreview}
                  alt="Phone preview"
                  className="h-full max-w-full object-contain"
                />
              </div>
            </div>
          )}

          {/* ADDITIONAL IMAGE PREVIEW */}

          {additionalImageFiles.some((file) => file) && (
            <div
              className="mt-4 rounded-xl border p-4"
              style={{
                backgroundColor: "var(--bg-primary)",
                borderColor: "var(--border-color)",
              }}
            >
              <p
                className="mb-3 text-sm font-semibold"
                style={{
                  color: "var(--text-primary)",
                }}
              >
                Additional Image Preview
              </p>

              <div className="grid grid-cols-4 gap-3">
                {additionalImageFiles.map((file, index) =>
                  file ? (
                    <div
                      key={index}
                      className="relative flex aspect-square items-center justify-center overflow-hidden rounded-lg border"
                      style={{
                        borderColor: "var(--border-color)",
                        backgroundColor: "var(--bg-secondary)",
                      }}
                    >
                      <img
                        src={URL.createObjectURL(file)}
                        alt={`Additional image ${index + 1}`}
                        className="h-full w-full object-contain"
                      />

                      <span
                        className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full px-2 py-1 text-[10px] font-semibold"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                        }}
                      >
                        Image {index + 1}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(index)}
                        className="absolute right-2 top-2 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border transition hover:opacity-70"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          borderColor: "var(--border-color)",
                        }}
                        aria-label={`Remove additional image ${index + 1}`}
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ) : null,
                )}
              </div>
            </div>
          )}
        </div>

        {/* NEW PHONE */}

        <label
          className="flex cursor-pointer items-center gap-2 text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          <input
            name="isNewPhone"
            type="checkbox"
            checked={formData.isNewPhone}
            onChange={handleChange}
            className="cursor-pointer accent-[var(--accent-color)]"
          />

          <span>New Phone</span>
        </label>

        {/* SUBMIT */}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="theme-accent-hover cursor-pointer rounded-full px-5 py-2.5 text-sm font-semibold transition"
            style={{
              backgroundColor: "var(--text-primary)",

              color: "var(--bg-primary)",

              border: "1px solid var(--border-color)",
            }}
          >
            {editingPhone ? "Update Phone" : "Add Phone"}
          </button>

          {status && (
            <p
              className="text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              {status}
            </p>
          )}
        </div>
      </form>
    </section>
  );
}
