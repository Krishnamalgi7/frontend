"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChevronDown, MessageSquareText, Send } from "lucide-react";
import Loader from "../../../../components/Loader";

export default function CustomerQueryDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const queryId = params.id as string;

  type Contact = {
    _id: string;
    name: string;
    phone: string;
    message: string;
    reply?: string;
    messages?: {
      sender: "customer" | "admin";
      text: string;
      createdAt?: string;
    }[];
    status: "pending" | "in_progress" | "completed";
    createdAt?: string;
    updatedAt?: string;
    adminNotificationReadAt?: string | null;
  };

  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reply, setReply] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [replyFeedback, setReplyFeedback] = useState("");
  const [replyError, setReplyError] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isStatusDropdownOpen, setIsStatusDropdownOpen] = useState(false);
  const statusDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isStatusDropdownOpen) return;

    const handleOutsideClick = (event: MouseEvent) => {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isStatusDropdownOpen]);
  useEffect(() => {
    const fetchContact = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          router.replace("/admin/login");
          return;
        }

        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${queryId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || "Failed to load customer query.");
        }

        setContact(data.contact);

        // Mark the admin notification as read if it is still unread.
        if (data.contact.adminNotificationReadAt == null) {
          try {
            const readResponse = await fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${queryId}/admin-notification/read`,
              {
                method: "PATCH",
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              },
            );

            if (!readResponse.ok) {
              console.error("Failed to mark query notification as read");
            }
          } catch (readError) {
            console.error(
              "Failed to mark query notification as read:",
              readError,
            );
          }
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load customer query.",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchContact();
  }, [queryId, router]);

  const handleSendReply = async () => {
    const trimmedReply = reply.trim();

    if (!trimmedReply || sendingReply) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      setSendingReply(true);
      setReplyFeedback("");
      setReplyError(false);

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${queryId}/reply`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ reply: trimmedReply }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to send reply.");
      }

      setContact(data.contact);
      setReply("");
      setReplyFeedback("Reply sent successfully.");
    } catch (err) {
      setReplyError(true);
      setReplyFeedback(
        err instanceof Error ? err.message : "Failed to send reply.",
      );
    } finally {
      setSendingReply(false);
    }
  };

  const handleStatusChange = async (
    status: "pending" | "in_progress" | "completed",
  ) => {
    if (!contact || updatingStatus || contact.status === status) return;

    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      setUpdatingStatus(true);
      setError("");

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${queryId}/status`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ status }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update status.");
      }

      setContact(data.contact);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update status.");
    } finally {
      setUpdatingStatus(false);
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
        <button
          type="button"
          onClick={() => router.push("/admin/queries")}
          className="mb-8 flex items-center gap-2 text-sm font-semibold transition-colors hover:opacity-70"
        >
          <ArrowLeft size={18} />
          Back to Customer Queries
        </button>

        <div
          className="rounded-xl border p-4 sm:p-5"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          {loading ? (
            <Loader />
          ) : error ? (
            <div className="py-8 text-center">
              <p className="text-sm text-red-500">{error}</p>

              <button
                type="button"
                onClick={() => router.push("/admin/queries")}
                className="mt-4 text-sm font-semibold underline"
                style={{ color: "var(--accent-color)" }}
              >
                Back to Customer Queries
              </button>
            </div>
          ) : contact ? (
            <>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-end"></div>

              <div
                className="mt-1 grid grid-cols-1 gap-3 border-b pb-4 sm:grid-cols-[1fr_1fr_auto]"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Customer Name
                  </p>
                  <p className=" font-semibold">{contact.name}</p>
                </div>

                <div>
                  <p
                    className="text-xs font-semibold uppercase tracking-wide"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    Phone Number
                  </p>
                  <p className=" font-semibold">{contact.phone}</p>
                </div>

                <div
                  ref={statusDropdownRef}
                  className="relative self-start sm:self-auto"
                >
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => setIsStatusDropdownOpen((open) => !open)}
                    className="flex h-9 items-center gap-2 rounded-full px-3 text-xs font-semibold transition-opacity hover:opacity-80 disabled:opacity-60 cursor-pointer"
                    style={{
                      backgroundColor:
                        contact.status === "pending"
                          ? "#FEE2E2"
                          : contact.status === "in_progress"
                            ? "#FEF3C7"
                            : "#DCFCE7",
                      color:
                        contact.status === "pending"
                          ? "#B91C1C"
                          : contact.status === "in_progress"
                            ? "#92400E"
                            : "#15803D",
                    }}
                  >
                    {contact.status === "pending"
                      ? "Pending"
                      : contact.status === "in_progress"
                        ? "In Progress"
                        : "Completed"}

                    <ChevronDown
                      size={14}
                      className={`transition-transform duration-200 ${
                        isStatusDropdownOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isStatusDropdownOpen && (
                    <div
                      className="absolute right-0 top-full z-50 mt-2 min-w-36 overflow-hidden rounded-xl border py-1 shadow-lg"
                      style={{
                        backgroundColor: "var(--bg-secondary)",
                        borderColor: "var(--border-color)",
                      }}
                    >
                      {[
                        { value: "pending", label: "Pending" },
                        { value: "in_progress", label: "In Progress" },
                        { value: "completed", label: "Completed" },
                      ].map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          disabled={updatingStatus}
                          onClick={async () => {
                            setIsStatusDropdownOpen(false);
                            await handleStatusChange(
                              option.value as
                                | "pending"
                                | "in_progress"
                                | "completed",
                            );
                          }}
                          className="block w-full px-4 py-2.5 text-left text-sm transition-colors hover:bg-[var(--bg-primary)] disabled:opacity-50"
                          style={{
                            color:
                              contact.status === option.value
                                ? "var(--accent-color)"
                                : "var(--text-primary)",
                            fontWeight:
                              contact.status === option.value ? 600 : 400,
                          }}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <section
                className="mt-4 rounded-xl border p-3"
                style={{
                  backgroundColor: "var(--bg-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <h2 className="mb-4 text-base font-bold">Conversation</h2>

                <div className="space-y-4">
                  {(contact.messages?.length
                    ? contact.messages
                    : [
                        {
                          sender: "customer" as const,
                          text: contact.message,
                          createdAt: contact.createdAt,
                        },
                        ...(contact.reply
                          ? [
                              {
                                sender: "admin" as const,
                                text: contact.reply,
                                createdAt: contact.updatedAt,
                              },
                            ]
                          : []),
                      ]
                  ).map((item, index) => (
                    <div
                      key={`${item.sender}-${item.createdAt ?? index}-${index}`}
                      className={`flex ${
                        item.sender === "admin"
                          ? "justify-end"
                          : "justify-start"
                      }`}
                    >
                      <div className="max-w-[85%]">
                        <p
                          className={`mb-1 text-xs font-medium ${
                            item.sender === "admin" ? "text-right" : "text-left"
                          }`}
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {item.sender === "admin"
                            ? "Support · Admin"
                            : `${contact.name} · Customer`}
                        </p>

                        <div
                          className={`rounded-xl border px-3 py-2 ${
                            item.sender === "admin"
                              ? "rounded-tr-sm"
                              : "rounded-tl-sm"
                          }`}
                          style={{
                            backgroundColor:
                              item.sender === "admin"
                                ? "var(--accent-color)"
                                : "var(--bg-secondary)",
                            borderColor: "var(--border-color)",
                            color:
                              item.sender === "admin"
                                ? "#FFFFFF"
                                : "var(--text-primary)",
                          }}
                        >
                          <p className="whitespace-pre-wrap break-words text-sm leading-5">
                            {item.text}
                          </p>
                        </div>

                        {item.createdAt && (
                          <p
                            className={`mt-1 text-xs ${
                              item.sender === "admin"
                                ? "text-right"
                                : "text-left"
                            }`}
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {new Date(item.createdAt).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section
                className="mt-4 border-t pt-4"
                style={{ borderColor: "var(--border-color)" }}
              >
                <h2 className="text-base font-bold">Reply to Customer</h2>

                <textarea
                  value={reply}
                  onChange={(event) => {
                    setReply(event.target.value);
                    setReplyFeedback("");
                  }}
                  placeholder="Type your reply here..."
                  rows={3}
                  maxLength={5000}
                  disabled={sendingReply}
                  className="mt-3 h-24 w-full resize-none rounded-xl border p-3 text-sm outline-none transition focus:ring-1 focus:ring-[var(--accent-color)] disabled:opacity-60"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    borderColor: "var(--border-color)",
                    color: "var(--text-primary)",
                  }}
                />

                <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p
                    className="text-xs"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    {reply.length}/5000 characters
                  </p>

                  <button
                    type="button"
                    onClick={handleSendReply}
                    disabled={!reply.trim() || sendingReply}
                    className="flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                    style={{ backgroundColor: "var(--accent-color)" }}
                  >
                    <Send size={16} />
                    {sendingReply ? "Sending..." : "Send Reply"}
                  </button>
                </div>

                {replyFeedback && (
                  <p
                    role="status"
                    className={`mt-3 text-sm ${
                      replyError ? "text-red-500" : "text-green-600"
                    }`}
                  >
                    {replyFeedback}
                  </p>
                )}
              </section>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
