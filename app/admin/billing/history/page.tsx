"use client";

import { useEffect, useRef, useState } from "react";

import {
  CircleChevronLeft,
  Download,
  X,
  Eye,
  RotateCcw,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  Invoice as InvoiceDetails,
  InvoicePreviewRef,
} from "@/components/admin/billing/InvoicePreview";
import InvoicePreview from "@/components/admin/billing/InvoicePreview";

type Invoice = {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerPhone: string;
  totalAmount: number;
};

export default function BillingHistoryPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceDetails | null>(
    null,
  );

  const [downloadInvoice, setDownloadInvoice] = useState<InvoiceDetails | null>(
    null,
  );

  const invoicePreviewRef = useRef<InvoicePreviewRef>(null);

  const handleInvoiceClick = async (invoiceNumber: string) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${encodeURIComponent(invoiceNumber)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch invoice");
      }

      setSelectedInvoice(data.invoice);
    } catch (error) {
      console.error("Failed to fetch invoice:", error);
    }
  };

  const handleDownloadInvoice = async (invoiceNumber: string) => {
    try {
      const token = localStorage.getItem("adminToken");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/${encodeURIComponent(invoiceNumber)}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to fetch invoice");
      }

      setDownloadInvoice(data.invoice);
    } catch (error) {
      console.error("Failed to download invoice:", error);
    }
  };

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/invoices/history?page=${currentPage}&limit=10&search=${encodeURIComponent(search)}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to fetch invoices");
        }

        setInvoices(data.invoices || []);
        setTotalPages(data.pagination?.totalPages || 0);
      } catch (error) {
        console.error("Failed to fetch billing history:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInvoices();
  }, [search, currentPage]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  useEffect(() => {
    if (!downloadInvoice) {
      return;
    }

    const timer = setTimeout(() => {
      invoicePreviewRef.current?.downloadInvoice();
    }, 300);

    return () => clearTimeout(timer);
  }, [downloadInvoice]);

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

        <div className="mb-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div>
              <p
                className="mb-2 text-sm font-semibold uppercase tracking-wider"
                style={{
                  color: "var(--accent-primary)",
                }}
              >
                Administration
              </p>

              <h1 className="text-3xl font-bold">Billing History</h1>

              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                View previously generated invoices.
              </p>
            </div>

            <div className="flex items-center gap-3 md:mr-20 md:mt-6">
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search"
                  className="w-45 rounded-xl border py-3 pl-11 pr-4 text-sm outline-none transition focus:ring-1"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                    color: "var(--text-primary)",
                  }}
                />
              </div>

              <button
                type="button"
                onClick={() => setSearch("")}
                className={`theme-accent-hover flex cursor-pointer items-center justify-center rounded-xl p-3 transition ${
                  search ? "visible" : "invisible"
                }`}
                style={{
                  backgroundColor: "var(--bg-primary)",
                  color: "var(--text-primary)",
                }}
                aria-label="Reset search"
                title="Reset search"
              >
                <RotateCcw size={18} />
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <p>Loading invoices...</p>
        ) : invoices.length === 0 ? (
          <p
            style={{
              color: "var(--text-secondary)",
            }}
          >
            No invoices found.
          </p>
        ) : (
          <>
            <div className="space-y-3 md:hidden">
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceNumber}
                  className="rounded-2xl border p-4"
                  style={{
                    borderColor: "var(--border-color)",
                    backgroundColor: "var(--bg-secondary)",
                  }}
                >
                  <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Customer
                      </p>
                      <p className="mt-1 font-semibold">
                        {invoice.customerName}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Invoice
                      </p>

                      <button
                        type="button"
                        onClick={() =>
                          handleInvoiceClick(invoice.invoiceNumber)
                        }
                        className="mt-1 cursor-pointer text-left font-semibold hover:underline"
                        style={{ color: "var(--accent-color)" }}
                      >
                        {invoice.invoiceNumber}
                      </button>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Date
                      </p>
                      <p className="mt-1">
                        {new Date(invoice.invoiceDate).toLocaleDateString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Phone
                      </p>
                      <p className="mt-1">{invoice.customerPhone}</p>
                    </div>

                    <div>
                      <p
                        className="text-xs"
                        style={{ color: "var(--text-secondary)" }}
                      >
                        Amount
                      </p>
                      <p className="mt-1 font-semibold">
                        ₹{" "}
                        {Math.round(invoice.totalAmount).toLocaleString(
                          "en-IN",
                        )}
                      </p>
                    </div>

                    <div className="flex items-end justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleDownloadInvoice(invoice.invoiceNumber)
                        }
                        className="theme-accent-hover flex cursor-pointer items-center justify-center rounded-xl p-2.5 transition"
                        style={{
                          backgroundColor: "var(--bg-primary)",
                          color: "var(--text-primary)",
                          border: "1px solid var(--border-color)",
                        }}
                        aria-label={`Download ${invoice.invoiceNumber}`}
                        title="Download invoice"
                      >
                        <Download size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div
              className="hidden overflow-x-auto rounded-2xl border md:block"
              style={{
                borderColor: "var(--border-color)",
                backgroundColor: "var(--bg-secondary)",
              }}
            >
              {/* TABLE HEADER */}
              <div
                className="grid min-w-[800px] grid-cols-[1.3fr_1.2fr_1fr_1.3fr_180px] gap-6 border-b px-5 py-4 text-sm font-bold"
                style={{
                  borderColor: "var(--border-color)",
                  color: "var(--text-secondary)",
                }}
              >
                <div>Customer Name</div>
                <div>Invoice Number</div>
                <div>Date</div>

                <div>Phone</div>
                <div className="text-left px-6">Amount</div>
              </div>

              {/* INVOICE ROWS */}
              {invoices.map((invoice) => (
                <div
                  key={invoice.invoiceNumber}
                  className="grid min-w-[800px] grid-cols-[1.3fr_1.2fr_1fr_1.3fr_180px] gap-6 border-b px-5 py-4 text-sm last:border-b-0"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div>{invoice.customerName}</div>

                  <button
                    type="button"
                    onClick={() => handleInvoiceClick(invoice.invoiceNumber)}
                    className="cursor-pointer text-left font-semibold hover:underline"
                    style={{ color: "var(--accent-color)" }}
                  >
                    {invoice.invoiceNumber}
                  </button>

                  <div>
                    {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
                  </div>

                  <div>{invoice.customerPhone}</div>

                  <div className="flex items-center justify-end gap-10 pr-2">
                    <span className="font-semibold">
                      ₹{" "}
                      {Math.round(invoice.totalAmount).toLocaleString("en-IN")}
                    </span>

                    <button
                      type="button"
                      onClick={() =>
                        handleDownloadInvoice(invoice.invoiceNumber)
                      }
                      className="theme-accent-hover flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        border: "1px solid var(--border-color)",
                      }}
                    >
                      <Download size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {downloadInvoice && (
        <div className="fixed -left-[10000px] top-0">
          <InvoicePreview ref={invoicePreviewRef} invoice={downloadInvoice} />
        </div>
      )}

      {selectedInvoice && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-6"
          onClick={() => setSelectedInvoice(null)}
        >
          <div
            className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl bg-white p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="ml-25 flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Eye size={17} />
                Preview
              </h2>

              <button
                type="button"
                onClick={() => setSelectedInvoice(null)}
                className="theme-accent-hover flex cursor-pointer items-center justify-center rounded-full p-2 transition"
                style={{
                  color: "var(--text-primary)",
                }}
                aria-label="Close invoice preview"
              >
                <X size={20} />
              </button>
            </div>

            <InvoicePreview ref={invoicePreviewRef} invoice={selectedInvoice} />
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2 cursor-pointer">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((page) => page - 1)}
            className="rounded-lg cursor-pointer border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--bg-secondary)]"
          >
            Previous
          </button>

          {Array.from({ length: totalPages }, (_, index) => index + 1).map(
            (page) => (
              <button
                key={page}
                type="button"
                onClick={() => setCurrentPage(page)}
                className={`h-9 min-w-9 rounded-lg px-3 text-sm font-semibold transition ${
                  currentPage === page
                    ? "bg-[var(--accent-color)] text-white"
                    : "border hover:bg-[var(--bg-secondary)]"
                }`}
              >
                {page}
              </button>
            ),
          )}

          <button
            type="button"
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage((page) => page + 1)}
            className="rounded-lg border px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-40 hover:bg-[var(--bg-secondary)] cursor-pointer"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
