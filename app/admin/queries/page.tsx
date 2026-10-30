"use client";

import {
  ArrowLeft,
  ChevronDown,
  CircleChevronLeft,
  Pencil,
  Search,
  Send,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../../components/Loader";
import { io } from "socket.io-client";

type Contact = {
  _id: string;
  name: string;
  phone: string;
  message: string;
  reply?: string;
  status: "pending" | "in_progress" | "completed";
};

export default function CustomerQueriesPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<Record<string, string>>(
    {},
  );
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [openStatusId, setOpenStatusId] = useState<string | null>(null);
  const statusDropdownRef = useRef<HTMLDivElement>(null);
  const isFirstSearchRender = useRef(true);

  const [statusFilter, setStatusFilter] = useState("all");
  const [isStatusFilterOpen, setIsStatusFilterOpen] = useState(false);

  const statusFilterLabel =
    statusFilter === "pending"
      ? "Pending"
      : statusFilter === "in_progress"
        ? "In Progress"
        : statusFilter === "completed"
          ? "Completed"
          : "All Statuses";

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const params = new URLSearchParams({
        search: searchTerm.trim(),
        status: statusFilter,
        page: String(currentPage),
        limit: "10",
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to fetch customer queries");
      }

      const data = await response.json();

      setContacts(data.contacts);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error("Failed to fetch customer queries:", error);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
  const socket = io(
    process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  );

  socket.on("new-contact-message", () => {
    fetchQueries();
  });

  return () => {
    socket.disconnect();
  };
}, []);

  useEffect(() => {
    if (!openStatusId) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setOpenStatusId(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [openStatusId]);

  // Search and pagination
  useEffect(() => {
    const timer = setTimeout(() => {
      const fetchData = async () => {
        try {
          const token = localStorage.getItem("adminToken");

          if (!token) {
            router.replace("/admin/login");
            return;
          }

          const params = new URLSearchParams({
            search: searchTerm.trim(),
            status: statusFilter,
            page: String(currentPage),
            limit: "10",
          });

          const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/contacts?${params.toString()}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          );

          if (!response.ok) {
            throw new Error("Failed to fetch customer queries");
          }

          const data = await response.json();

          setContacts(data.contacts);
          setTotalPages(data.totalPages);
        } catch (error) {
          console.error("Failed to fetch customer queries:", error);
        } finally {
          setLoading(false);
        }
      };

      fetchData();
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm, currentPage, router, statusFilter]);

  const handleStatusChange = async (
    contactId: string,
    status: "pending" | "in_progress" | "completed",
  ) => {
    const token = localStorage.getItem("adminToken");
    if (!token) return;

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contactId}/status`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      },
    );

    if (response.ok) await fetchQueries();
  };

  const handleCompleteQuery = async (contactId: string) => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contactId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      );

      if (!response.ok) {
        throw new Error("Failed to update query status");
      }

      await fetchQueries();
    } catch (error) {
      console.error("Failed to complete customer query:", error);
    }
  };

  const handleSendReply = async (contactId: string) => {
    const reply = replyDrafts[contactId]?.trim();

    if (!reply) {
      setReplyFeedback((previous) => ({
        ...previous,
        [contactId]: "Please enter a reply.",
      }));
      return;
    }

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      setSendingReplyId(contactId);
      setReplyFeedback((previous) => ({
        ...previous,
        [contactId]: "",
      }));

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${contactId}/reply`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ reply }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply.");
      }

      setReplyDrafts((previous) => ({
        ...previous,
        [contactId]: "",
      }));

      setEditingReplyId(null);

      setReplyFeedback((previous) => ({
        ...previous,
        [contactId]: "Reply sent successfully.",
      }));

      await fetchQueries();
    } catch (error) {
      console.error("Failed to send customer reply:", error);

      setReplyFeedback((previous) => ({
        ...previous,
        [contactId]:
          error instanceof Error ? error.message : "Failed to send reply.",
      }));
    } finally {
      setSendingReplyId(null);
    }
  };

  return (
    <main
      className="min-h-screen"
      style={{
        backgroundColor: "var(--bg-primary)",
        color: "var(--text-primary)",
      }}
    >
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          {/* BACK TO DASHBOARD */}

          <button
            type="button"
            onClick={() => router.push("/admin/dashboard")}
            className="mb-8 flex cursor-pointer items-center gap-2 text-sm font-semibold transition-colors hover:!text-[var(--accent-color)]"
          >
            <CircleChevronLeft size={18} />
            Back to Dashboard
          </button>

          {/* HEADER */}

          <div>
            <h1 className="text-3xl font-bold">Customer Queries</h1>

            <div className="mt-2 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                View and manage messages received from customers.
              </p>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                {/* Search */}
                <div
                  className="flex h-11 w-full items-center gap-3 rounded-xl border px-4 sm:w-72"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <Search
                    size={18}
                    className="shrink-0 text-[var(--text-secondary)]"
                  />

                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    placeholder="Search by name or phone..."
                    className="w-full bg-transparent text-sm outline-none"
                    style={{ color: "var(--text-primary)" }}
                  />
                </div>

                {/* Status filter — dropdown UI only for now */}
                <div className="relative w-full sm:w-44">
                  <button
                    type="button"
                    onClick={() => setIsStatusFilterOpen((open) => !open)}
                    className="flex h-11 w-full items-center justify-between gap-2 rounded-xl border px-3 text-sm transition-colors"
                    style={{
                      backgroundColor: "var(--bg-secondary)",
                      borderColor: isStatusFilterOpen
                        ? "var(--accent-color)"
                        : "var(--border-color)",
                      color: "var(--text-primary)",
                    }}
                    aria-expanded={isStatusFilterOpen}
                    aria-label="Filter customer queries by status"
                  >
                    <span className="truncate">{statusFilterLabel}</span>

                    <ChevronDown
                      size={17}
                      className={`shrink-0 transition-transform duration-200 ${
                        isStatusFilterOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isStatusFilterOpen && (
                    <div
                      className="absolute right-0 top-full z-50 mt-2 w-full overflow-hidden rounded-xl border py-1 shadow-lg"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      {[
                        { value: "all", label: "All Statuses" },
                        { value: "pending", label: "Pending" },
                        { value: "in_progress", label: "In Progress" },
                        { value: "completed", label: "Completed" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => {
                            setStatusFilter(option.value);
                            setIsStatusFilterOpen(false);
                            setCurrentPage(1);
                          }}
                          className="flex w-full items-center px-3 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-primary)]"
                          style={{
                            color:
                              statusFilter === option.value
                                ? "var(--accent-color)"
                                : "var(--text-primary)",
                            fontWeight:
                              statusFilter === option.value ? 600 : 400,
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* QUERIES */}

          <div
            className="mt-8 overflow-hidden rounded-xl border"
            style={{
              backgroundColor: "var(--bg-secondary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div
              className="grid grid-cols-4 items-center gap-4 border-b px-6 py-5 text-sm font-bold"
              style={{
                backgroundColor: "var(--bg-secondary)",
                borderColor: "var(--border-color)",
              }}
            >
              <span>Customer Name</span>
              <span>Phone Number</span>
              <span>Query Details</span>
              <span>Current Status</span>
            </div>
            {loading ? (
              <Loader />
            ) : contacts.length === 0 ? (
              <div
                className="rounded-xl border p-6 text-center"
                style={{
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                <p
                  style={{
                    color: "var(--text-secondary)",
                  }}
                >
                  No customer queries yet.
                </p>
              </div>
            ) : (
              contacts.map((contact) => (
                <div
                  key={contact._id}
                  className="grid grid-cols-4 items-center gap-4 border-x border-b px-5 py-5 transition-colors hover:bg-sky-50/60"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <span className="min-w-0 truncate text-sm font-medium">
                    {contact.name}
                  </span>

                  <span
                    className="min-w-0 truncate text-sm"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {contact.phone}
                  </span>

                  <button
                    type="button"
                    onClick={() => router.push(`/admin/queries/${contact._id}`)}
                    className="w-fit cursor-pointer text-sm font-semibold underline underline-offset-4 transition hover:opacity-70"
                    style={{ color: "var(--accent-color)" }}
                  >
                    View Details
                  </button>

                  <span
                    className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${
                      contact.status === "pending"
                        ? "bg-red-100 text-red-700"
                        : contact.status === "in_progress"
                          ? "bg-amber-100 text-amber-800"
                          : "bg-green-100 text-green-700"
                    }`}
                  >
                    {contact.status === "pending"
                      ? "Pending"
                      : contact.status === "in_progress"
                        ? "In Progress"
                        : "Completed"}
                  </span>
                </div>
              ))
            )}
          </div>
          {!loading && totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <button
                type="button"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => page - 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: "var(--border-color)" }}
              >
                Previous
              </button>

              <span className="text-sm text-[var(--text-secondary)]">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage((page) => page + 1)}
                className="rounded-lg border px-4 py-2 text-sm font-medium disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: "var(--border-color)" }}
              >
                Next
              </button>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
