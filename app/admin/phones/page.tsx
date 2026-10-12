"use client";

import { CircleChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import ManagePhoneList from "../../../components/admin/ManagePhoneList";

export default function ManagePhonesPage() {
  const router = useRouter();

  return (
    <main
      className="min-h-screen py-8 px-6"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* BACK TO DASHBOARD outer Manage Phones */}
        <button
          type="button"
          onClick={() => router.push("/admin/dashboard")}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <CircleChevronLeft size={18} />
          Back to Dashboard
        </button>

        <ManagePhoneList
          onEdit={(phone) => {
            router.push(`/admin/phones/edit/${phone._id}`);
          }}
          refreshKey={0}
        />
      </div>
    </main>
  );
}
