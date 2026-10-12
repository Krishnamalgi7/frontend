"use client";

import { ChevronRight, CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BillingPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen px-6 py-8"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 flex w-fit cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
        >
          <CircleChevronLeft size={18} />
          Back to Dashboard
        </button>
        {/* HEADER */}

        <div className="mb-10">
          <p
            className="mb-2 text-sm font-semibold uppercase tracking-wider"
            style={{
              color: "var(--accent-primary)",
            }}
          >
            Administration
          </p>

          <h1 className="text-3xl font-bold">Billing</h1>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Generate and manage customer invoices.
          </p>
        </div>

        {/* BILLING OPTIONS */}

        <div className="space-y-4">
          {/* BILLING HISTORY */}

          {/* CREATE INVOICE */}

          <button
            type="button"
            onClick={() => router.push("/admin/settings/billing")}
            className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)",
            }}
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Create Invoice</h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Generate a new customer invoice
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
            onClick={() => router.push("/admin/billing/history")}
            className="group flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
            style={{
              borderColor: "var(--border-color)",
              background: "var(--bg-secondary)",
            }}
          >
            <div className="min-w-0 flex-1">
              <h2 className="text-lg font-semibold">Billing History</h2>

              <p
                className="mt-1 text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                View previously generated invoices
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
        </div>
      </div>
    </main>
  );
}
