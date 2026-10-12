"use client";

import Loader from "../../../components/Loader";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminSignupPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [adminExists, setAdminExists] = useState(false);
  const [checkingAdmin, setCheckingAdmin] = useState(true);

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/status`,
        );

        if (!response.ok) {
          setError("Failed to check admin status");
          return;
        }

        const data = await response.json();

        if (data.exists) {
          setAdminExists(true);
        }
      } catch (error) {
        console.error("Admin status check error:", error);
        setError("Unable to connect to the server");
      } finally {
        setCheckingAdmin(false);
      }
    };

    checkAdmin();
  }, []);

if (checkingAdmin) {
  return <Loader />;
}

  if (adminExists) {
    return (
      <main
        className="flex min-h-screen items-center justify-center px-4"
        style={{
          backgroundColor: "var(--bg-primary)",
          color: "var(--text-primary)",
        }}
      >
        <div
          className="w-full max-w-md rounded-2xl border p-6 shadow-xl"
          style={{
            backgroundColor: "var(--bg-secondary)",
            borderColor: "var(--border-color)",
          }}
        >
          <h2 className="text-xl font-bold text-center">
            Administrator account already exists
          </h2>

          <p
            className="mt-3 text-sm leading-6 text-center"
            style={{
              color: "var(--text-secondary)",
            }}
          >
            Please login to continue
          </p>

          <button
            type="button"
            onClick={() => router.push("/admin/login")}
            className="mx-auto block theme-accent-hover mt-6 w-1/2 cursor-pointer rounded-lg px-5 py-2.5 font-semibold transition"
            style={{
              backgroundColor: "var(--text-primary)",
              color: "var(--bg-primary)",
            }}
          >
            Click here to Login
          </button>
        </div>
      </main>
    );
  }
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Failed to create admin account");
        return;
      }

      router.push("/admin/login");
    } catch (error) {
      console.error("Admin signup error:", error);
      setError("Unable to connect to the server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold">Admin Signup</h1>

          <p className="mt-2 text-sm opacity-70">
            Create the administrator account for Phone Store
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
            <label htmlFor="name" className="mb-2 block text-sm font-medium">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter admin name"
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
            {loading ? "Creating account..." : "Create Admin Account"}
          </button>
        </form>

        <p
          className="mt-4 text-center text-sm"
          style={{ color: "var(--text-secondary)" }}
        >
          Already have an admin account?{" "}
          <button
            type="button"
            onClick={() => router.push("/admin/login")}
            className="theme-accent-text-hover cursor-pointer font-medium transition hover:underline"
            style={{
              color: "var(--text-primary)",
            }}
          >
            Sign in
          </button>
        </p>
      </div>
    </main>
  );
}
