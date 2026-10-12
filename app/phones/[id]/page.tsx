"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Loader from "../../../components/Loader";

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

  brand: ReferenceValue;
  brandId?: ReferenceValue;

  variant: ReferenceValue;
  variantId?: ReferenceValue;

  ram: ReferenceValue;
  ramId?: ReferenceValue;

  rom: ReferenceValue;
  romId?: ReferenceValue;

  price: number;
  discountPercentage?: number;
  discountPrice?: number;
  totalPrice: number;
  quantity?: number;
  averageRating?: number;
  ratingCount?: number;
  colorId?: string | { _id: string; name: string };
  description: string;
  image: string;
  images?: string[];
  imageUrl?: string | null;
  isNewPhone: boolean;
};

export default function PhoneDetailsPage() {
  const params = useParams();

  const [phone, setPhone] = useState<Phone | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [imageDirection, setImageDirection] = useState<"next" | "previous">(
    "next",
  );

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones/${params.id}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch phone");
        }

        setPhone(data);
        setSelectedImage(data.image);
      } catch (error) {
        console.error("Phone details error:", error);
        setError("Unable to load phone details.");
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchPhone();
    }
  }, [params.id]);

  if (loading) {
    return <Loader />;
  }

  if (error || !phone) {
    return (
      <main
        className="flex min-h-screen items-center justify-center"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <p>{error || "Phone not found."}</p>
      </main>
    );
  }

  const colorName =
    typeof phone.colorId === "string"
      ? phone.colorId
      : phone.colorId?.name || "N/A";

  const inStock = (phone.quantity ?? 0) > 0;

  const allImages = [phone.image, ...(phone.images || [])];

  const selectedIndex = selectedImage ? allImages.indexOf(selectedImage) : 0;

  const showPreviousImage = () => {
    const previousIndex =
      selectedIndex === 0 ? allImages.length - 1 : selectedIndex - 1;

    setImageDirection("previous");
    setSelectedImage(allImages[previousIndex]);
  };

  const showNextImage = () => {
    const nextIndex =
      selectedIndex === allImages.length - 1 ? 0 : selectedIndex + 1;

    setImageDirection("next");
    setSelectedImage(allImages[nextIndex]);
  };

  return (
    <main
      className="min-h-screen px-4 py-8 lg:px-8"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <div className="mt-5 grid gap-10 lg:grid-cols-2 lg:gap-14">
          {/* LEFT — image gallery */}

          <div className="relative">
            {phone.isNewPhone && (
              <span
                className="absolute left-4 top-4 z-10 rounded-full px-3 py-1 text-xs font-semibold text-white"
                style={{ backgroundColor: "#0F1115" }}
              >
                New
              </span>
            )}

            <div
              className="flex aspect-square items-center justify-center rounded-3xl border p-8"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <img
                key={selectedImage || phone.image}
                src={selectedImage || phone.image}
                alt={phone.name}
                className={`max-h-[360px] w-full object-contain ${
                  imageDirection === "next"
                    ? "phone-image-slide-next"
                    : "phone-image-slide-previous"
                }`}
              />
            </div>

            <div className="mt-4 flex gap-3 overflow-x-auto">
              {[phone.image, ...(phone.images || [])].map((image, index) => (
                <button
                  key={`${image}-${index}`}
                  type="button"
                  onClick={() => setSelectedImage(image)}
                  className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl border p-2"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor:
                      selectedImage === image
                        ? "var(--text-primary)"
                        : "var(--border-color)",
                  }}
                >
                  <img
                    src={image || "/phone-placeholder.png"}
                    alt={`${phone.name} image ${index + 1}`}
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/phone-placeholder.png";
                    }}
                    className="h-full w-full object-contain"
                  />
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={showPreviousImage}
              className="absolute left-4 top-70 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border text-xl font-semibold cursor-pointer shadow-md"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
              aria-label="Previous image"
            >
              &lt;
            </button>

            <button
              type="button"
              onClick={showNextImage}
              className="absolute right-4 top-70 -translate-y-1/2 flex h-10 w-10 items-center justify-center rounded-full border text-xl font-semibold cursor-pointer shadow-md"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
              aria-label="Next image"
            >
              &gt;
            </button>
          </div>

          {/* RIGHT — details */}
          <div>
            <p
              className="text-sm font-medium"
              style={{ color: "var(--text-secondary)" }}
            >
              {typeof phone.brand === "object"
                ? phone.brand.name || phone.brand.value || "N/A"
                : phone.brand}
            </p>
            <h1 className="mt-1 text-3xl font-bold tracking-tight sm:text-4xl">
              {phone.name}
            </h1>

            {/* Rating */}
            <div className="mt-3 flex items-center gap-2">
              <div className="flex" style={{ color: "#E4463F" }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className="text-lg">
                    {star <= Math.round(phone.averageRating || 0) ? "★" : "☆"}
                  </span>
                ))}
              </div>
              <span
                className="text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                {phone.averageRating?.toFixed(1) || "0.0"}
                {/* {phone.ratingCount || 0} ratings) */}
              </span>
            </div>

            {/* Price */}
            <div
              className="mt-6 rounded-2xl border p-5"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-3xl font-bold">
                  ₹{Math.round(phone.totalPrice).toLocaleString("en-IN")}
                </span>

                {phone.discountPercentage && phone.discountPercentage > 0 ? (
                  <>
                    <span
                      className="text-base line-through"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      ₹{phone.price.toLocaleString("en-IN")}
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{ backgroundColor: "#FFE7E7", color: "#E4463F" }}
                    >
                      {phone.discountPercentage}% OFF
                    </span>
                  </>
                ) : null}
              </div>

              <p
                className="mt-2 text-sm font-medium"
                style={{ color: inStock ? "#1F9254" : "#E4463F" }}
              >
                {inStock ? `Quantity · ${phone.quantity} ` : "Out of stock"}
              </p>
            </div>

            {/* Technical details */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Technical Details</h2>

              <div
                className="mt-4 divide-y rounded-2xl border"
                style={{ borderColor: "var(--border-color)" }}
              >
                {[
                  {
                    label: "Brand",
                    value:
                      typeof phone.brandId === "object"
                        ? phone.brandId.name
                        : typeof phone.brand === "object"
                          ? phone.brand.name
                          : phone.brand || "N/A",
                  },
                  {
                    label: "Variant",
                    value:
                      typeof phone.variantId === "object"
                        ? phone.variantId.name
                        : typeof phone.variant === "object"
                          ? phone.variant.name
                          : phone.variant || "N/A",
                  },
                  {
                    label: "RAM",
                    value:
                      typeof phone.ramId === "object"
                        ? phone.ramId.value
                        : typeof phone.ram === "object"
                          ? phone.ram.value
                          : phone.ram || "N/A",
                  },
                  {
                    label: "ROM",
                    value:
                      typeof phone.romId === "object"
                        ? phone.romId.value
                        : typeof phone.rom === "object"
                          ? phone.rom.value
                          : phone.rom || "N/A",
                  },
                  { label: "Color", value: colorName },
                ].map((row) => (
                  <div
                    key={row.label}
                    className="flex justify-between px-4 py-3"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <span style={{ color: "var(--text-secondary)" }}>
                      {row.label}
                    </span>
                    <span className="font-medium">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="mt-8">
              <h2 className="text-lg font-semibold">Description</h2>
              <p
                className="mt-3 leading-7"
                style={{ color: "var(--text-secondary)" }}
              >
                {phone.description}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
