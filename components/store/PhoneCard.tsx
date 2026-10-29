import Link from "next/link";

import { ExternalLink } from "lucide-react";

type PhoneCardProps = {
  id: string;
  brand: string;
  name: string;
  description: string;
  price: number;
  quantity?: number;
  color?: string;
  averageRating?: number;
  ratingCount?: number;
  discountPercentage?: number;
  discountPrice?: number;
  totalPrice?: number;
  image: string;
  isNew?: boolean;
};

function PhoneCard({
  id,
  brand,
  name,
  description,
  price,
  discountPercentage,
  discountPrice,
  totalPrice,
  image,
  isNew,
  quantity,
  color,
  averageRating,
  ratingCount,
}: PhoneCardProps) {
  return (
    <div
      className="relative rounded-3xl border p-6 shadow-sm"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
        color: "var(--text-primary)",
      }}
    >
      {/* New badge */}

      {isNew && (
        <span className="absolute left-4 top-4 rounded-full bg-black px-3 py-1 text-xs font-semibold text-white">
          New
        </span>
      )}

      {/* Phone image */}

      <div
        className="flex h-64 items-center justify-center rounded-xl"
        style={{
          backgroundColor: "var(--bg-primary)",
        }}
      >
        <img
          src={image || "/phone-placeholder.png"}
          alt={name}
          onError={(event) => {
            event.currentTarget.onerror = null;
            event.currentTarget.src = "/phone-placeholder.png";
          }}
          className="h-full w-full rounded-xl object-contain"
        />
      </div>

      {/* Brand */}

      <p
        className="mt-5 text-sm font-medium"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        {brand}
      </p>

      {/* Name */}

      <h3
        className="text-xl font-bold"
        style={{
          color: "var(--text-primary)",
        }}
      >
        {name}
      </h3>

      {/* Description */}

      <p
        className="line-clamp-3"
        style={{
          color: "var(--text-secondary)",
          textAlign: "justify",
          textJustify: "inter-word",
          hyphens: "auto",
          textAlignLast: "left",
        }}
      >
        {description}
      </p>

      {/* Price */}

      <div className="mt-4">
        {discountPercentage && discountPercentage > 0 ? (
          <>
            <div className="flex items-center gap-3">
              <p className="text-sm text-gray-500 line-through">
                ₹{price.toLocaleString("en-IN")}
              </p>

              <span
                className="rounded-full px-2 py-0.5 text-xs font-semibold"
                style={{ backgroundColor: "#FFE7E7", color: "#E4463F" }}
              >
                {discountPercentage}% OFF
              </span>
            </div>

            <p className="mt-1 text-xl font-bold">
              ₹{Math.round(totalPrice ?? 0).toLocaleString("en-IN")}
            </p>
          </>
        ) : (
          <p className="text-xl font-bold">₹{price.toLocaleString("en-IN")}</p>
        )}
      </div>

      {/* Product Metadata */}

      <div
        className="mt-4 flex items-center justify-between border-y py-3"
        style={{
          borderColor: "var(--border-color)",
        }}
      >
        <div>
          <p
            className="text-xs"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Quantity
          </p>

          <p
            className="mt-1 text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {(quantity ?? 0) === 0 ? (
              <span className="font-bold text-red-600">Out of Stock</span>
            ) : (
              quantity
            )}
          </p>
        </div>

        <div>
          <p
            className="text-xs"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Color
          </p>

          <p
            className="mt-1 text-sm font-semibold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {color || "N/A"}
          </p>
        </div>

        <div>
          <p
            className="text-xs"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Rating
          </p>

          <div className="mt-1 flex items-center gap-1.5">
            <span className="text-sm tracking-wide">
              {[1, 2, 3, 4, 5].map((star) => (
                <span key={star}>
                  {star <= Math.round(averageRating ?? 0) ? "★" : "☆"}
                </span>
              ))}
            </span>

            <span
              className="text-sm font-semibold"
              style={{
                color: "var(--text-primary)",
              }}
            >
              {averageRating?.toFixed(1) || "0.0"}
            </span>
          </div>
        </div>
      </div>

      {/* View button */}
      <Link
        href={`/phones/${id}`}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-4 flex w-35 cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-center text-sm font-semibold transition theme-accent-hover"
        style={{
          backgroundColor: "var(--text-primary)",
          color: "var(--bg-primary)",
        }}
      >
        View Phone
        <ExternalLink size={16} strokeWidth={2} />
      </Link>
    </div>
  );
}

export default PhoneCard;
