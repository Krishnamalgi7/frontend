"use client";

import { ArrowLeft, CircleChevronLeft, Pencil, Send, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../../components/Loader";

type Contact = {
  _id: string;
  name: string;
  phone: string;
  message: string;
  reply?: string;
  status: "pending" | "completed";
};

export default function CustomerQueriesPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);

  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [sendingReplyId, setSendingReplyId] = useState<string | null>(null);
  const [replyFeedback, setReplyFeedback] = useState<Record<string, string>>(
    {},
  );
  const [editingReplyId, setEditingReplyId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchQueries = async () => {
    try {
      const token = localStorage.getItem("adminToken");

      if (!token) {
        router.replace("/admin/login");
        return;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/contacts`,
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

      setContacts(data);
    } catch (error) {
      console.error("Failed to fetch customer queries:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries();
  }, []);

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

            <p
              className="mt-2 text-sm"
              style={{
                color: "var(--text-secondary)",
              }}
            >
              View and manage messages received from customers.
            </p>
          </div>

          {/* QUERIES */}

          <div className="mt-8 space-y-4">
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
                  className="rounded-xl border p-5"
                  style={{
                    backgroundColor: "var(--bg-secondary)",
                    borderColor: "var(--border-color)",
                  }}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="font-semibold">{contact.name}</h2>

                      <p
                        className="mt-1 text-sm"
                        style={{
                          color: "var(--text-secondary)",
                        }}
                      >
                        {contact.phone}
                      </p>
                    </div>

                    <span
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        backgroundColor:
                          contact.status === "completed"
                            ? "var(--bg-primary)"
                            : "var(--accent-color)",

                        color:
                          contact.status === "completed"
                            ? "var(--text-secondary)"
                            : "var(--text-primary)",
                      }}
                    >
                      {contact.status === "completed" ? "Completed" : "Pending"}
                    </span>
                  </div>

                  

                  {/* REPLY EDITOR */}
                  <div className="mt-5">
                  
                    {/* <textarea
                      id={`reply-${contact._id}`}
                      value={replyDrafts[contact._id] ?? ""}
                      onChange={(event) =>
                        setReplyDrafts((previous) => ({
                          ...previous,
                          [contact._id]: event.target.value,
                        }))
                      }
                      placeholder="Write a helpful response to your customer..."
                      rows={3}
                      maxLength={2000}
                      className="w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none transition"
                      style={{
                        backgroundColor: "var(--bg-primary)",
                        color: "var(--text-primary)",
                        borderColor: "var(--border-color)",
                      }}
                    /> */}

                   

                    {replyFeedback[contact._id] && (
                      <p
                        role="status"
                        className="mt-3 text-sm"
                        style={{
                          color: replyFeedback[contact._id].includes(
                            "successfully",
                          )
                            ? "#16A34A"
                            : "#DC2626",
                        }}
                      >
                        {replyFeedback[contact._id]}
                      </p>
                    )}
                  </div>

                  {/* CHAT CONVERSATION */}
                  {(contact.status === "pending" || contact.reply?.trim()) && (
                  <div
                    className="mt-6 space-y-4 rounded-2xl border p-4 sm:p-5"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    {/* CUSTOMER MESSAGE - LEFT */}
                    <div className="flex justify-start">
                      <div className="max-w-[85%] sm:max-w-[75%]">
                        <p
                          className="mb-1 text-right text-xs font-medium"
                          style={{ color: "var(--text-secondary)" }}
                        >
                          {contact.name} · Customer
                        </p>

                        <div
                          className="rounded-2xl rounded-tr-sm px-4 py-3"
                          style={{
                            backgroundColor: "var(--accent-color)",
                            color: "#000000",
                          }}
                        >
                          <p className="whitespace-pre-wrap text-sm leading-6">
                            {contact.message}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* ADMIN REPLY - RIGHT */}
                    {contact.reply?.trim() &&
                      editingReplyId !== contact._id && (
                        <div className="flex justify-end">
                          <div className="max-w-[85%] sm:max-w-[75%]">
                            <div className="mb-1 flex items-center gap-2">
                              <p
                                className="text-xs font-medium"
                                style={{ color: "var(--text-secondary)" }}
                              >
                                Sigmato Support
                              </p>

                              <button
                                type="button"
                                onClick={() => {
                                  setReplyDrafts((previous) => ({
                                    ...previous,
                                    [contact._id]: contact.reply ?? "",
                                  }));
                                  setEditingReplyId(contact._id);
                                  setReplyFeedback((previous) => ({
                                    ...previous,
                                    [contact._id]: "",
                                  }));
                                }}
                                title="Edit reply"
                                aria-label="Edit reply"
                                className="rounded-md p-1 transition hover:opacity-70 cursor-pointer"
                                style={{ color: "var(--accent-color)" }}
                              >
                                <Pencil size={14} />
                              </button>
                            </div>

                            <div
                              className="rounded-2xl rounded-tl-sm border px-4 py-3"
                              style={{
                                backgroundColor: "var(--bg-primary)",
                                borderColor: "var(--border-color)",
                              }}
                            >
                              <p className="whitespace-pre-wrap text-sm leading-6">
                                {contact.reply}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {/* REPLY COMPOSER */}
                    {(!contact.reply?.trim() ||
                      editingReplyId === contact._id) && (
                      <div className="pt-2">
                        <label
                          htmlFor={`reply-${contact._id}`}
                          className="mb-2 block text-sm font-semibold"
                        >
                          {contact.reply?.trim()
                            ? "Edit your reply"
                            : "Write a reply"}
                        </label>

                        <textarea
                          id={`reply-${contact._id}`}
                          value={replyDrafts[contact._id] ?? ""}
                          onChange={(event) =>
                            setReplyDrafts((previous) => ({
                              ...previous,
                              [contact._id]: event.target.value,
                            }))
                          }
                          placeholder="Write a helpful response..."
                          rows={3}
                          maxLength={2000}
                          className="w-full resize-y rounded-xl border px-4 py-3 text-sm outline-none"
                          style={{
                            backgroundColor: "var(--bg-primary)",
                            color: "var(--text-primary)",
                            borderColor: "var(--border-color)",
                          }}
                        />

                        <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                          <p
                            className="text-xs"
                            style={{ color: "var(--text-secondary)" }}
                          >
                            {(replyDrafts[contact._id] ?? "").length}/2000
                          </p>

                          <div className="flex items-center gap-2">
                            {contact.reply?.trim() && (
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingReplyId(null);
                                  setReplyDrafts((previous) => ({
                                    ...previous,
                                    [contact._id]: "",
                                  }));
                                  setReplyFeedback((previous) => ({
                                    ...previous,
                                    [contact._id]: "",
                                  }));
                                }}
                                className="flex items-center gap-1 rounded-lg border px-3 py-2 text-sm"
                                style={{ borderColor: "var(--border-color)" }}
                              >
                                <X size={15} />
                                Cancel
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleSendReply(contact._id)}
                              disabled={sendingReplyId === contact._id}
                              className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition hover:opacity-90 disabled:opacity-50"
                              style={{
                                backgroundColor: "var(--accent-color)",
                                color: "var(--text-primary)",
                              }}
                            >
                              <Send size={15} />
                              {sendingReplyId === contact._id
                                ? "Saving..."
                                : contact.reply?.trim()
                                  ? "Save Reply"
                                  : "Send Reply"}
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {replyFeedback[contact._id] && (
                      <p
                        role="status"
                        className="text-sm"
                        style={{
                          color: replyFeedback[contact._id].includes(
                            "successfully",
                          )
                            ? "#16A34A"
                            : "#DC2626",
                        }}
                      >
                        {replyFeedback[contact._id]}
                      </p>
                    )}
                  </div>
                  )}

                  {/* MARK COMPLETE */}
{contact.status === "pending" && (
  <div className="mt-4 flex justify-end">
    <button
      type="button"
      onClick={() => handleCompleteQuery(contact._id)}
      className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-green-500 hover:text-white"
      style={{ borderColor: "var(--border-color)" }}
    >
      Mark Complete
    </button>
  </div>
)}
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
