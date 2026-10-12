"use client";

import Loader from "../../../components/Loader";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowBigLeft } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/admin/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Invalid email or password");
        return;
      }

      localStorage.setItem("adminToken", data.token);
      localStorage.setItem("admin", JSON.stringify(data.admin));

      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Admin login error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
  return <Loader />;
}

  return (
    <main
      className="flex min-h-screen items-center justify-center px-4"
      style={{ backgroundColor: "var(--bg-primary)" }}
    >
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Admin Login</h1>

          <p
            className="mt-2 text-sm"
            style={{ color: "var(--text-secondary)" }}
          >
            Sign in to manage Phone Store Nova
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="space-y-5 rounded-xl border p-6 shadow-sm"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <div>
            <label htmlFor="email" className="mb-2 block text-sm font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter admin email"
              required
              className="w-full rounded-lg border px-4 py-2.5 outline-none"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              required
              className="w-full rounded-lg border px-4 py-2.5 outline-none"
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="theme-accent-hover cursor-pointer w-full rounded-lg px-4 py-2.5 font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor: "var(--text-primary)",
              color: "var(--bg-primary)",
            }}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <button
          type="button"
          onClick={() => router.push("/")}
          className="theme-accent-text-hover mt-3 flex w-full cursor-pointer items-center justify-center gap-2 text-sm font-medium transition hover:underline"
          style={{
            color: "var(--text-secondary)",
          }}
        >
          <ArrowBigLeft size={18} strokeWidth={2} />
          Back to Home
        </button>
      </div>
    </main>
  );
}
