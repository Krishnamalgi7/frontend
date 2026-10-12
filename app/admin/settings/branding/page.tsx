"use client";

import { ArrowLeft, CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

import StoreBrandingForm from "./StoreBrandingForm";

export default function StoreBrandingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* BACK */}

        <button
          type="button"
          onClick={() => router.push("/admin/settings")}
          className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent-color)]"
        >
          <CircleChevronLeft size={17} />
          Back to Settings
        </button>

        {/* HEADER */}

        <div className="mb-8">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{
              color: "var(--accent-primary)",
            }}
          >
            Settings
          </p>

          <h1 className="text-3xl font-bold">Store Data</h1>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Manage your store name and logo.
          </p>
        </div>

        {/* BRANDING FORM */}

        <StoreBrandingForm />
      </div>
    </main>
  );
}