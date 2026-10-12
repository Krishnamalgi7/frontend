"use client";

import { ArrowLeft, CircleChevronLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loader from "../../../components/Loader";

type Contact = {
  _id: string;
  name: string;
  phone: string;
  message: string;
  status: "pending" | "completed";
};

export default function CustomerQueriesPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);

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

                  <p className="mt-4 text-sm leading-6">{contact.message}</p>

                  {contact.status === "pending" && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleCompleteQuery(contact._id)}
                        className="cursor-pointer rounded-lg border px-4 py-2 text-sm font-medium transition hover:bg-green-500 hover:text-white"
                        style={{
                          borderColor: "var(--border-color)",
                        }}
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
