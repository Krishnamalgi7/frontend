"use client";

import PhoneSelector from "../../../../components/admin/billing/PhoneSelector";

import { CircleChevronLeft, Minus, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CustomerDetailsForm from "../../../../components/admin/billing/CustomerDetailsForm";
import InvoicePreview, {
  type Invoice,
} from "../../../../components/admin/billing/InvoicePreview";

export default function BillingPage() {
  const router = useRouter();

  const getPhoneValue = (
    value?: string | { _id: string; name?: string; value?: string },
  ) => {
    if (!value) {
      return "—";
    }

    if (typeof value === "object") {
      return value.value || value.name || "—";
    }

    return value;
  };

  const [customerDetails, setCustomerDetails] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
  });

  type SelectedItem = {
    phoneId: string;
    quantity: number;
    phone: {
      _id: string;
      name: string;
      brand?: string | { _id: string; name?: string; value?: string };
      ram?: string | { _id: string; name?: string; value?: string };
      rom?: string | { _id: string; name?: string; value?: string };
      totalPrice: number;
      quantity: number;
    };
  };

  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [invoice, setInvoice] = useState<Invoice | null>(null);

  const handleGenerateInvoice = async () => {
    
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/create-bill`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            customerName: customerDetails.customerName,
            customerPhone: customerDetails.customerPhone,
            customerEmail: customerDetails.customerEmail,
            customerAddress: customerDetails.customerAddress,
            items: selectedItems.map((item) => ({
              phoneId: item.phoneId,
              quantity: item.quantity,
            })),
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to generate invoice");
      }

      setInvoice(data.invoice);

    } catch (error) {
      console.error("Generate invoice error:", error);
    }
  };

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
          onClick={() => router.push("/admin/billing")}
          className="mb-5 flex cursor-pointer items-center gap-2 text-sm font-medium transition-colors hover:text-[var(--accent-color)]"
        >
          <CircleChevronLeft size={17} />
          Back to Billing
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

        {/* BILLING CONTENT */}

        <div
          className="rounded-2xl border p-6"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-xl font-semibold">Create Invoice</h2>

          <p
            className="mt-2 text-sm"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Billing details will be added here.
          </p>

          <div className="mt-5">
            <PhoneSelector
              onSelect={(phone) => {
                setSelectedItems((currentItems) => {
                  const existingItem = currentItems.find(
                    (item) => item.phoneId === phone._id,
                  );

                  if (existingItem) {
                    return currentItems.map((item) =>
                      item.phoneId === phone._id
                        ? {
                            ...item,
                            quantity: 1,
                            phone,
                          }
                        : item,
                    );
                  }

                  return [
                    ...currentItems,
                    {
                      phoneId: phone._id,
                      quantity: 1,
                      phone,
                    },
                  ];
                });
              }}
            />
          </div>

          <div className="mt-6">
            <h3 className="text-lg font-semibold">Selected Items</h3>

            {selectedItems.length === 0 ? (
              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                No phones selected yet.
              </p>
            ) : (
              <div className="mt-3 space-y-3">
                {selectedItems.map((item) => (
                  <div
                    key={item.phoneId}
                    className="rounded-2xl border p-5"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="min-w-0">
                        <p className="font-semibold">{item.phone.name}</p>

                        <p
                          className="mt-1 text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          {getPhoneValue(item.phone.brand)} •{" "}
                          {getPhoneValue(item.phone.ram)} •{" "}
                          {getPhoneValue(item.phone.rom)}
                        </p>

                        <p className="mt-2 font-semibold">
                          ₹
                          {Math.floor(
                            Number(item.phone.totalPrice),
                          ).toLocaleString("en-IN")}
                        </p>
                      </div>

                      <div className="flex shrink-0 flex-col items-start gap-3 sm:items-end">
                        <p
                          className="text-sm"
                          style={{
                            color: "var(--text-secondary)",
                          }}
                        >
                          Stock: {item.phone.quantity}
                        </p>

                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            disabled={item.quantity <= 1}
                            onClick={() => {
                              setSelectedItems((currentItems) =>
                                currentItems.map((currentItem) =>
                                  currentItem.phoneId === item.phoneId
                                    ? {
                                        ...currentItem,
                                        quantity: currentItem.quantity - 1,
                                      }
                                    : currentItem,
                                ),
                              );
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                            style={{
                              borderColor: "var(--border-color)",
                            }}
                            aria-label="Decrease quantity"
                          >
                            <Minus size={16} />
                          </button>

                          <span className="min-w-8 text-center font-semibold">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            disabled={item.quantity >= item.phone.quantity}
                            onClick={() => {
                              setSelectedItems((currentItems) =>
                                currentItems.map((currentItem) =>
                                  currentItem.phoneId === item.phoneId
                                    ? {
                                        ...currentItem,
                                        quantity: currentItem.quantity + 1,
                                      }
                                    : currentItem,
                                ),
                              );
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border transition-opacity disabled:cursor-not-allowed disabled:opacity-40"
                            style={{
                              borderColor: "var(--border-color)",
                            }}
                            aria-label="Increase quantity"
                          >
                            <Plus size={16} />
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedItems((currentItems) =>
                                currentItems.filter(
                                  (currentItem) =>
                                    currentItem.phoneId !== item.phoneId,
                                ),
                              );
                            }}
                            className="flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors hover:border-red-500 hover:text-red-500"
                            style={{
                              borderColor: "var(--border-color)",
                            }}
                            aria-label="Remove selected phone"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-6">
            <CustomerDetailsForm
              value={customerDetails}
              onChange={setCustomerDetails}
            />
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={handleGenerateInvoice}
              className="cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold transition-colors bg-[var(--text-primary)] text-[var(--bg-primary)] hover:!bg-[var(--accent-color)]"
            >
              Generate Invoice
            </button>
          </div>

          {invoice && <InvoicePreview invoice={invoice} />}
        </div>
      </div>
    </main>
  );
}
