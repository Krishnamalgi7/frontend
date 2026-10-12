"use client";

type CustomerDetails = {
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerAddress: string;
};

type CustomerDetailsFormProps = {
  value: CustomerDetails;
  onChange: (value: CustomerDetails) => void;
};

export default function CustomerDetailsForm({
  value,
  onChange,
}: CustomerDetailsFormProps) {
  const updateField = (field: keyof CustomerDetails, fieldValue: string) => {
    onChange({
      ...value,
      [field]: fieldValue,
    });
  };

  return (
    <div
      className="rounded-2xl border p-6"
      style={{
        backgroundColor: "var(--bg-secondary)",
        borderColor: "var(--border-color)",
      }}
    >
      <h2 className="text-xl font-semibold">Customer Details</h2>

      <p
        className="mt-1 text-sm"
        style={{
          color: "var(--text-secondary)",
        }}
      >
        Enter the customer information for this invoice.
      </p>

      <div className="mt-6 grid grid-cols-1 gap-5 md:grid-cols-2">
        <div>
          <label className="mb-2 block text-sm font-medium">
            Customer Name
          </label>

          <input
            type="text"
            value={value.customerName}
            onChange={(event) => {
              const name = event.target.value.replace(/[^a-zA-Z\s]/g, "");
              updateField("customerName", name);
            }}
            placeholder="Enter customer name"
            className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-primary)",
            }}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium">Phone</label>

          <div
            className="flex w-full overflow-hidden rounded-xl border "
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-primary)",
            }}
          >
            {/* Country code */}
            <div
              className="flex items-center px-5 py-3 text-sm "
              style={{
                backgroundColor: "var(--bg-secondary)",
                color: "var(--text-primary)",
              }}
            >
              +91
            </div>

            {/* Phone number */}
            <input
              type="tel"
              value={value.customerPhone}
              onChange={(event) => {
                const phone = event.target.value
                  .replace(/\D/g, "")
                  .slice(0, 10);

                updateField("customerPhone", phone);
              }}
              placeholder="Enter 10 digit number"
              maxLength={10}
              inputMode="numeric"
              pattern="[0-9]{10}"
              className="min-w-0 flex-1 bg-transparent px-5 py-3 text-sm outline-none"
              style={{
                color: "var(--text-primary)",
              }}
            />
          </div>

          {value.customerPhone.length > 0 &&
            value.customerPhone.length !== 10 && (
              <p
                className="mt-1 text-xs"
                style={{ color: "var(--text-secondary)" }}
              >
                Phone number must be exactly 10 digits.
              </p>
            )}
        </div>

        <div>
  <label className="mb-2 block text-sm font-medium">
    Email
  </label>

  <input
    type="email"
    value={value.customerEmail}
    onChange={(event) =>
      updateField("customerEmail", event.target.value)
    }
    placeholder="Enter email address"
    className="w-full rounded-xl border px-4 py-3 text-sm outline-none transition"
    style={{
      borderColor: "var(--border-color)",
      backgroundColor: "var(--bg-primary)",
      color: "var(--text-primary)",
    }}
    required
  />

  {value.customerEmail.length > 0 &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.customerEmail) && (
      <p
        className="mt-1 text-xs"
        style={{ color: "var(--text-secondary)" }}
      >
        Please enter a valid email address.
      </p>
    )}
</div>

        <div>
          <label className="mb-2 block text-sm font-medium">Address</label>

          <textarea
            value={value.customerAddress}
            onChange={(event) =>
              updateField("customerAddress", event.target.value)
            }
            placeholder="Enter customer address"
            rows={4}
            className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none transition"
            style={{
              borderColor: "var(--border-color)",
              backgroundColor: "var(--bg-primary)",
            }}
          />
        </div>
      </div>
    </div>
  );
}
