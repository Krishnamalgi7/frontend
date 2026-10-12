"use client";

import { CircleChevronLeft } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import PhoneForm from "../../../../../components/admin/PhoneForm";
import Loader from "../../../../../components/Loader";

type Phone = {
  _id: string;
  name: string;
  brand: string;
  variant: string;
  ram: string;
  rom: string;
  price: number;
  description: string;
  image: string;
  imageUrl?: string | null;
  imageFileId?: string | null;
  isNewPhone: boolean;
};

export default function EditPhonePage() {
  const router = useRouter();
  const params = useParams();

  const phoneId = params.id as string;

  const [phone, setPhone] = useState<Phone | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPhone = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/phones/${phoneId}`,
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch phone");
        }

        setPhone(data);
      } catch (error) {
        console.error("Failed to fetch phone:", error);

        setError("Unable to load phone.");
      } finally {
        setLoading(false);
      }
    };

    if (phoneId) {
      fetchPhone();
    }
  }, [phoneId]);

  if (loading) {
    return <Loader />;
  }

  if (error || !phone) {
    return (
      <main
        className="min-h-screen p-8"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <button
          type="button"
          onClick={() => router.push("/admin/phones")}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <CircleChevronLeft size={18} />
          Back to Manage Phones
        </button>

        <p className="mt-8">{error || "Phone not found."}</p>
      </main>
    );
  }

  return (
    <main
      className="min-h-screen px-6 py-10"
      style={{
        background: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <div className="mx-auto max-w-6xl">
        {/* BACK */}
        <button
          type="button"
          onClick={() => router.push("/admin/phones")}
          className="mb-6 flex cursor-pointer items-center gap-2 text-sm font-semibold transition hover:opacity-70"
          style={{
            color: "var(--text-primary)",
          }}
        >
          <CircleChevronLeft size={18} />
          Back to Manage Phones
        </button>

        {/* EXISTING EDIT FORM */}
        <PhoneForm
          editingPhone={phone}
          onEditComplete={() => router.push("/admin/phones")}
        />
      </div>
    </main>
  );
}
