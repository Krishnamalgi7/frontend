"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, BellRing, RefreshCw } from "lucide-react";
import Loader from "../../../components/Loader";

type StockNotification = {
  _id: string;
  status: "pending" | "notified" | "cancelled";
  createdAt: string;
  notifiedAt?: string | null;
  customerId: {
    name?: string;
    email?: string;
    phone?: string;
  } | null;
  phoneId: {
    name?: string;
    quantity?: number;
  } | null;
};

type FilterStatus = "all" | "pending" | "notified" | "cancelled";

export default function StockAlertsPage() {
  const router = useRouter();

  const [notifications, setNotifications] = useState<StockNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<FilterStatus>("all");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/stock-notifications/admin/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch stock notification requests.");
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      console.error("Failed to fetch stock alerts:", error);
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load stock notification requests.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const filteredNotifications =
    filter === "all"
      ? notifications
      : notifications.filter((item) => item.status === filter);

  const pendingCount = notifications.filter(
    (item) => item.status === "pending",
  ).length;

  const notifiedCount = notifications.filter(
    (item) => item.status === "notified",
  ).length;

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <section className="px-6 py-10">
        <div className="mx-auto w-full max-w-6xl">
          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
          >
            <ArrowLeft size={18} />
            Back to Dashboard
          </button>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3">
                <BellRing size={26} />
                <h1 className="text-3xl font-bold">
                  Stock Notification Requests
                </h1>
              </div>

              <p
                className="mt-2 text-sm"
                style={{ color: "var(--text-secondary)" }}
              >
                View customers waiting for phones to come back in stock.
              </p>
            </div>

            <button
              type="button"
              onClick={fetchNotifications}
              disabled={loading}
              className="flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold cursor-pointer transition-colors hover:!text-[var(--accent-color)] disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: "var(--border-color)" }}
            >
              <RefreshCw size={16} />
              
            </button>
          </div>


          <div className="mt-6">
            {loading ? (
              <Loader />
            ) : error ? (
              <div
                className="rounded-xl border p-6"
                style={{ borderColor: "var(--border-color)" }}
              >
                <p className="text-red-500">{error}</p>
                <button
                  type="button"
                  onClick={fetchNotifications}
                  className="mt-4 rounded-lg border px-4 py-2 text-sm"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  Try Again
                </button>
              </div>
            ) : filteredNotifications.length === 0 ? (
              <div
                className="rounded-xl border p-10 text-center"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <BellRing
                  size={32}
                  className="mx-auto mb-3"
                  style={{ color: "var(--text-secondary)" }}
                />
                <h2 className="text-lg font-semibold">No requests found</h2>
                <p
                  className="mt-2 text-sm"
                  style={{ color: "var(--text-secondary)" }}
                >
                  Customer stock notification requests will appear here.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredNotifications.map((item) => (
                  <div
                    key={item._id}
                    className="rounded-2xl border p-5"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: "var(--border-color)",
                    }}
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-lg font-bold">
                          {item.phoneId?.name ?? "Phone unavailable"}
                        </h2>
                        <p
                          className="mt-1 text-sm"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Current stock: {item.phoneId?.quantity ?? "Unknown"}
                        </p>
                      </div>

                      <span
                        className="rounded-full border px-3 py-1 text-xs font-semibold capitalize"
                        style={{
                          borderColor: "var(--border-color)",
                          color:
                            item.status === "pending"
                              ? "#D97706"
                              : item.status === "notified"
                                ? "#16A34A"
                                : "var(--text-secondary)",
                        }}
                      >
                        {item.status}
                      </span>
                    </div>

                    <div
                      className="mt-4 grid gap-3 border-t pt-4 sm:grid-cols-2"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Customer
                        </p>
                        <p className="mt-1 font-medium">
                          {item.customerId?.name ?? "Customer unavailable"}
                        </p>
                        {item.customerId?.email && (
                          <p className="mt-1 text-sm">
                            {item.customerId.email}
                          </p>
                        )}
                        {item.customerId?.phone && (
                          <p className="mt-1 text-sm">
                            {item.customerId.phone}
                          </p>
                        )}
                      </div>

                      <div>
                        <p
                          className="text-xs"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          Requested on
                        </p>
                        <p className="mt-1 font-medium">
                          {new Date(item.createdAt).toLocaleString("en-IN")}
                        </p>

                        {item.notifiedAt && (
                          <>
                            <p
                              className="mt-2 text-xs"
                              style={{ color: "var(--text-secondary)" }}
                            >
                              Notified on
                            </p>
                            <p className="mt-1 text-sm">
                              {new Date(item.notifiedAt).toLocaleString(
                                "en-IN",
                              )}
                            </p>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
