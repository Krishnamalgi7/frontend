"use client";

import { forwardRef, useImperativeHandle, useRef } from "react";

export type InvoiceItem = {
  phoneId: string;
  itemDescription: string;
  quantity: number;
  originalPrice: number;
  discount: number;
  priceAfterDiscount: number;
  taxableAmount: number;
};

export type Invoice = {
  invoiceNumber: string;
  invoiceDate: string;
  storeName: string;
  storeLogo?: string;
  storeAddress: string;
  storePhone: string;
  storeGstNumber: string;

  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;

  items: InvoiceItem[];

  gstPercentage: number;
  gstAmount: number;
  taxableSubtotal: number;
  roundedOff: number;
  totalAmount: number;
  amountInWords: string;
};

type InvoicePreviewProps = {
  invoice: Invoice;
};

export type InvoicePreviewRef = {
  downloadInvoice: () => Promise<void>;
};

const InvoicePreview = forwardRef<InvoicePreviewRef, InvoicePreviewProps>(
  ({ invoice }, ref) => {
    const invoiceRef = useRef<HTMLDivElement>(null);

    useImperativeHandle(ref, () => ({
      downloadInvoice: handleDownloadInvoice,
    }));

    const handleDownloadInvoice = async () => {
      if (!invoiceRef.current) {
        return;
      }

      const html2pdf = (await import("html2pdf.js")).default as any;

      const options = {
        margin: 0,
        filename: `${invoice.invoiceNumber}.pdf`,
        image: {
          type: "jpeg" as const,
          quality: 0.98,
        },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
        },
        jsPDF: {
          unit: "mm",
          format: "a4",
          orientation: "portrait",
        },
      };

      await html2pdf().set(options).from(invoiceRef.current).save();
    };

    useImperativeHandle(ref, () => ({
      downloadInvoice: handleDownloadInvoice,
    }));

    return (
      <>
        <div
          ref={invoiceRef}
          className="mx-auto mt-6 min-h-[285mm] w-[200mm] rounded-2xl border bg-white p-6 text-black"
          style={{
            borderColor: "#d1d5db",
          }}
        >
          <div className="grid grid-cols-[1fr_auto] items-start gap-8">
            {/* Store Information */}
            <div className="flex min-w-0 items-start gap-5">
              {invoice.storeLogo && (
                <img
                  src={`${process.env.NEXT_PUBLIC_API_URL}${invoice.storeLogo}`}
                  alt={`${invoice.storeName} logo`}
                  className="h-30 w-30 shrink-0 rounded-xl object-contain mt-6"
                />
              )}

              <div className="min-w-0">
                <h2 className="text-2xl font-bold leading-tight mt-4">
                  {invoice.storeName}
                </h2>

                <p
                  className="mt-2 max-w-2xl text-sm leading-5"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  {invoice.storeAddress}
                </p>

                <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-sm">
                  <p
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span className="font-medium text-black">Phone:</span>{" "}
                    {invoice.storePhone || "—"}
                  </p>

                  <p
                    style={{
                      color: "var(--text-secondary)",
                    }}
                  >
                    <span className="font-medium text-black">GSTIN:</span>{" "}
                    {invoice.storeGstNumber || "—"}
                  </p>
                </div>
              </div>
            </div>

            {/* Invoice Information */}
            <div className="min-w-[170px] pt-1 text-right mt-4">
              <p
                className="text-sm font-semibold uppercase tracking-widest"
                style={{
                  color: "var(--accent-primary)",
                }}
              >
                Tax Invoice
              </p>

              <h3 className="mt-2 text-1xl font-bold leading-tight">
                {invoice.invoiceNumber}
              </h3>

              <p
                className="mt-2 text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Date:{" "}
                {new Date(invoice.invoiceDate).toLocaleDateString("en-IN")}
              </p>
            </div>
          </div>

          <div
            className="my-6 border-t"
            style={{ borderColor: "var(--border-color)" }}
          />

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p
                className="text-sm"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Bill To
              </p>

              <p className="mt-1 font-semibold">{invoice.customerName}</p>

              <p className="mt-1 text-sm">{invoice.customerPhone}</p>

              <p className="mt-1 text-sm">{invoice.customerEmail}</p>

              <p className="mt-1 text-sm">{invoice.customerAddress}</p>
            </div>

            <div />
          </div>

          <div className="my-6 overflow-x-auto">
            <table className="w-full min-w-[650px] text-sm">
              <thead>
                <tr
                  className="border-y text-left"
                  style={{
                    borderColor: "var(--border-color)",
                  }}
                >
                  <th className="px-3 py-3">Item</th>
                  <th className="px-3 py-3 text-center">Qty</th>
                  <th className="px-3 py-3 text-right">Original Price</th>
                  <th className="px-3 py-3 text-right">Discount</th>
                  <th className="px-3 py-3 text-right">Net Unit Price</th>
                  <th className="px-3 py-3 text-right">Line Total</th>
                </tr>
              </thead>

              <tbody>
                {invoice.items?.map((item: any) => (
                  <tr
                    key={item.phoneId}
                    className="border-b"
                    style={{
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <td className="px-3 py-4">{item.itemDescription}</td>

                    <td className="px-3 py-4 text-center">{item.quantity}</td>

                    <td className="px-3 py-4 text-right">
                      ₹{Math.floor(item.originalPrice).toLocaleString("en-IN")}
                    </td>

                    <td className="px-3 py-4 text-right">
                      ₹{Math.floor(item.discount).toLocaleString("en-IN")}
                    </td>

                    <td className="px-3 py-4 text-right">
                      ₹
                      {Math.floor(item.priceAfterDiscount).toLocaleString(
                        "en-IN",
                      )}
                    </td>

                    <td className="px-3 py-4 text-right font-medium">
                      ₹{Math.floor(item.taxableAmount).toLocaleString("en-IN")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
            {/* Amount in Words */}
            <div>
              <p
                className="text-sm font-semibold"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                Amount in Words
              </p>

              <p className="mt-2 text-sm leading-6">{invoice.amountInWords}</p>
            </div>

            {/* Invoice Totals */}
            <div className="ml-auto w-full max-w-sm space-y-3">
              <div className="flex justify-between gap-6 text-sm">
                <span
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Subtotal
                </span>

                <span>
                  ₹{Math.floor(invoice.taxableSubtotal).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-6 text-sm">
                <span
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  GST ({invoice.gstPercentage}%)
                </span>

                <span>
                  ₹{Math.floor(invoice.gstAmount).toLocaleString("en-IN")}
                </span>
              </div>

              <div className="flex justify-between gap-6 text-sm">
                <span
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  Round Off
                </span>

                <span>
                  ₹{Math.floor(invoice.roundedOff).toLocaleString("en-IN")}
                </span>
              </div>

              <div
                className="border-t pt-3"
                style={{
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex justify-between gap-6 text-lg font-bold">
                  <span>Total</span>

                  <span>
                    ₹{Math.floor(invoice.totalAmount).toLocaleString("en-IN")}
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* Invoice Footer */}
          <div
            className="mt-10 border-t pt-6"
            style={{
              borderColor: "var(--border-color)",
            }}
          >
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Terms and Conditions */}
              <div>
                <p className="text-sm font-semibold">Terms & Conditions</p>

                <ul
                  className="mt-2 list-disc space-y-1 pl-5 text-xs"
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  <li>Goods once sold are subject to store policy.</li>
                  <li>Please retain this invoice for future reference.</li>
                  <li>Warranty is subject to the manufacturer's terms.</li>
                </ul>
              </div>

              {/* Authorized Signature */}
              <div className="flex flex-col items-end justify-end">
                <div
                  className="h-12 w-48 border-b"
                  style={{ borderColor: "var(--border-color)" }}
                />

                <p className="mt-2 text-sm font-semibold px-7">
                  Customer Signatory
                </p>
              </div>
            </div>

            {/* Thank You Message */}
            <div className="mt-8 text-center">
              <p className="text-sm font-semibold">
                Thank you for your purchase.
              </p>

              <p
                className="mt-1 text-xs"
                style={{
                  color: "var(--text-secondary)",
                }}
              >
                We appreciate your choice.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={handleDownloadInvoice}
            className="cursor-pointer rounded-xl px-6 py-3 text-sm font-semibold transition-colors bg-[var(--text-primary)] text-[var(--bg-primary)] hover:!bg-[var(--accent-color)]"
          >
            Download Invoice
          </button>
        </div>
      </>
    );
  },
);

export default InvoicePreview;
