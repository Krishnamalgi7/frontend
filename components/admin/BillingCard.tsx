"use client";

import { ChevronRight} from "lucide-react";

type BillingCardProps = {
  onClick: () => void;
};

export default function BillingCard({ onClick }: BillingCardProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="group mb-4 flex w-full cursor-pointer items-center gap-5 rounded-2xl border p-5 text-left transition-all duration-200 hover:-translate-y-[1px] hover:shadow-sm"
      style={{
        borderColor: "var(--border-color)",
        background: "var(--bg-secondary)",
      }}
    >

      <div className="min-w-0 flex-1">
        <h2 className="text-lg font-semibold">Billing</h2>

        <p
          className="mt-1 text-sm"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          Generate and manage customer invoices.
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
  );
}