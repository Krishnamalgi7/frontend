"use client";

import { ArrowLeft, CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import PhoneForm from "../../../../components/admin/PhoneForm";
import { Minus, Plus } from "lucide-react";

export default function AddPhonePage() {
  const router = useRouter();

  return (
    <main
        className="min-h-screen px-6 py-8"
        style={{
          background: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <CircleChevronLeft size={18} />
          Back to dashboard
        </button>

        {/* PAGE TITLE */}
        <h1 className="mb-6 text-2xl font-bold">Add your Phone</h1>
    
    
        {/* EXISTING PHONE FORM */}
        <PhoneForm
          editingPhone={null}
          onEditComplete={() => router.push("/admin/phones")}
        />
      </div>
    </main>
  );
}
