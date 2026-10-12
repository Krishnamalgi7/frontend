"use client";

import {
  FormEvent,
  useEffect,
  useState,
} from "react";

export default function AdminSignupModal() {
  const [showSignup, setShowSignup] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  /*
   * ---------------------------------------------
   * CHECK IF ADMIN EXISTS
   * ---------------------------------------------
   */

  useEffect(() => {
    const checkAdmin = async () => {
      try {
        const response =
          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/admin/status`,
          );

        const data =
          await response.json();

        if (
          response.ok &&
          data.exists === false
        ) {
          setShowSignup(true);
        }
      } catch (error) {
        console.error(
          "Admin status check error:",
          error,
        );
      }
    };

    checkAdmin();
  }, []);

  /*
   * ---------------------------------------------
   * REGISTER ADMIN
   * ---------------------------------------------
   */

  const handleSignup = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const response =
        await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/admin/signup`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              name,
              email,
              password,
            }),
          },
        );

      const data =
        await response.json();

      if (!response.ok) {
        setError(
          data.message ||
            "Failed to create admin account",
        );

        return;
      }

      /*
       * Registration successful
       */

      setShowSignup(false);

      setName("");
      setEmail("");
      setPassword("");

      /*
       * Tell Navbar that admin status
       * has changed.
       */

      window.dispatchEvent(
        new Event(
          "admin-status-changed",
        ),
      );
    } catch (error) {
      console.error(
        "Admin signup error:",
        error,
      );

      setError(
        "Unable to connect to the server",
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ---------------------------------------------
   * UI
   * ---------------------------------------------
   */

  if (!showSignup) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm"
    >
      <div
        className="w-full max-w-md rounded-2xl border p-6 shadow-2xl"
        style={{
          backgroundColor:
            "var(--bg-secondary)",

          color:
            "var(--text-primary)",

          borderColor:
            "var(--border-color)",
        }}
      >
        {/* HEADER */}

        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold">
            Create Admin Account
          </h2>

          <p
            className="mt-2 text-sm"
            style={{
              color:
                "var(--text-secondary)",
            }}
          >
            Set up the administrator
            account for Phone Store
          </p>
        </div>

        {/* FORM */}

        <form
          onSubmit={handleSignup}
          className="space-y-4"
        >
          {/* NAME */}

          <div>
            <label
              htmlFor="admin-name"
              className="mb-2 block text-sm font-medium"
            >
              Name
            </label>

            <input
              id="admin-name"
              type="text"
              value={name}
              onChange={(event) =>
                setName(
                  event.target.value,
                )
              }
              placeholder="Enter admin name"
              required
              className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:ring-1"
              style={{
                backgroundColor:
                  "var(--bg-primary)",

                color:
                  "var(--text-primary)",

                borderColor:
                  "var(--border-color)",

                outlineColor:
                  "var(--accent-color)",
              }}
            />
          </div>

          {/* EMAIL */}

          <div>
            <label
              htmlFor="admin-email"
              className="mb-2 block text-sm font-medium"
            >
              Email
            </label>

            <input
              id="admin-email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(
                  event.target.value,
                )
              }
              placeholder="Enter admin email"
              required
              className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:ring-1"
              style={{
                backgroundColor:
                  "var(--bg-primary)",

                color:
                  "var(--text-primary)",

                borderColor:
                  "var(--border-color)",

                outlineColor:
                  "var(--accent-color)",
              }}
            />
          </div>

          {/* PASSWORD */}

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-sm font-medium"
            >
              Password
            </label>

            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(
                  event.target.value,
                )
              }
              placeholder="Enter password"
              required
              className="w-full rounded-lg border px-4 py-2.5 outline-none transition focus:ring-1"
              style={{
                backgroundColor:
                  "var(--bg-primary)",

                color:
                  "var(--text-primary)",

                borderColor:
                  "var(--border-color)",

                outlineColor:
                  "var(--accent-color)",
              }}
            />
          </div>

          {/* ERROR */}

          {error && (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-500">
              {error}
            </p>
          )}

          {/* SUBMIT */}

          <button
            type="submit"
            disabled={loading}
            className="theme-accent-hover w-full cursor-pointer rounded-lg px-4 py-2.5 font-medium shadow-sm transition disabled:cursor-not-allowed disabled:opacity-60"
            style={{
              backgroundColor:
                "var(--text-primary)",

              color:
                "var(--bg-primary)",
            }}
          >
            {loading
              ? "Creating account..."
              : "Create Admin Account"}
          </button>
        </form>

        {/* INFO */}

        <p
          className="mt-4 text-center text-xs"
          style={{
            color:
              "var(--text-secondary)",
          }}
        >
          Only one administrator account
          can be registered.
        </p>
      </div>
    </div>
  );
}