"use client";

import Loader from "../../../components/Loader";

import {
  MessageSquare,
  Smartphone,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const router = useRouter();
  const [adminName, setAdminName] = useState("");
  const [phones, setPhones] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
const [loading, setLoading] = useState(true);
const [totalPhones, setTotalPhones] = useState(0);

  //Count phone brands
  const brandCounts = phones.reduce((counts: Record<string, number>, phone) => {
  const brand =
    typeof phone.brandId === "object"
      ? phone.brandId?.name
      : phone.brand || "Unknown";

  const brandName = brand || "Unknown";

  counts[brandName] = (counts[brandName] || 0) + 1;

  return counts;
}, {});

  //filter pending and update get in touch status
  const totalQueries = contacts.length;

  const pendingQueries = contacts.filter(
    (contact) => contact.status === "pending",
  ).length;

  const completedQueries = contacts.filter(
    (contact) => contact.status === "completed",
  ).length;

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const adminData = localStorage.getItem("admin");

    if (!token || !adminData) {
      router.replace("/admin/login");
      return;
    }

    try {
      const admin = JSON.parse(adminData);
      setAdminName(admin.name);
    } catch (error) {
      console.error("Failed to read admin data:", error);
      localStorage.removeItem("adminToken");
      localStorage.removeItem("admin");
      router.replace("/admin/login");
    }
  }, [router]);

  const fetchDashboardData = async () => {
    try {
      
      setLoading(true);
      const token = localStorage.getItem("adminToken");

      if (!token) {
        return;
      }

      const [phonesResponse, contactsResponse] = await Promise.all([
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/phones?limit=50`),
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/contacts`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (!phonesResponse.ok || !contactsResponse.ok) {
        throw new Error("Failed to fetch dashboard data");
      }

      const phonesData = await phonesResponse.json();
      const contactsData = await contactsResponse.json();

      setPhones(phonesData.phones);
      setTotalPhones(phonesData.pagination?.totalItems || 0);

      setContacts(contactsData.contacts);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }finally {
  setLoading(false);
}
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

      await fetchDashboardData();
    } catch (error) {
      console.error("Failed to complete customer query:", error);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    router.replace("/");
  };

  if (loading) {
  return <Loader />;
}

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl ">
          <h2 className="text-3xl font-bold ">Welcome, {adminName}</h2>

          <p className="mt-2" style={{ color: "var(--text-secondary)" }}>
            Manage your Phone Store administration panel.
          </p>

          <div className="mt-8">
            <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* Total Phones */}
              <div
                className="rounded-2xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--accent-color)",
                    }}
                  >
                    <Smartphone size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Total Phones</h3>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {totalPhones}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 border-t pt-4"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div className="space-y-2">
                    {Object.entries(brandCounts).map(([brand, count]) => (
                      <div
                        key={brand}
                        className="flex items-center justify-between text-sm"
                      >
                        <span style={{ color: "var(--text-secondary)" }}>
                          {brand}
                        </span>

                        <span className="font-semibold">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Customer Queries */}
              <div
                className="rounded-2xl border p-6 shadow-sm"
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-11 w-11 items-center justify-center rounded-xl"
                    style={{
                      backgroundColor: "var(--bg-primary)",
                      color: "var(--accent-color)",
                    }}
                  >
                    <MessageSquare size={22} />
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold">Customer Queries</h3>
                    <p
                      className="text-2xl font-bold"
                      style={{ color: "var(--accent-color)" }}
                    >
                      {totalQueries}
                    </p>
                  </div>
                </div>

                <div
                  className="mt-5 grid grid-cols-2 gap-4 border-t pt-4"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  <div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Pending
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {pendingQueries}
                    </p>
                  </div>

                  <div>
                    <p
                      className="text-sm"
                      style={{ color: "var(--text-secondary)" }}
                    >
                      Completed
                    </p>
                    <p className="mt-1 text-xl font-semibold">
                      {completedQueries}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
