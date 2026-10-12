"use client";
import Loader from "../Loader";

import { useEffect, useRef, useState } from "react";
import {
  House,
  Smartphone,
  Info,
  Mail,
  Settings,
  Menu,
  X,
  LogIn,
  LayoutDashboard,
  Sun,
} from "lucide-react";

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const [theme, setTheme] = useState("default");

  const [brandName, setBrandName] = useState("Phone Store");
  const [logo, setLogo] = useState("/logo.png");
  const [adminName, setAdminName] = useState("");
  const [loading, setLoading] = useState(true);
  const settingsRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  /*
   * ---------------------------------------------
   * LOGIN
   * ---------------------------------------------
   */

  const handleLogin = () => {
    window.location.href = "/admin/login";
  };

  useEffect(() => {
    const adminData = localStorage.getItem("admin");

    if (adminData) {
      try {
        const admin = JSON.parse(adminData);
        setAdminName(admin.name);
      } catch (error) {
        console.error("Failed to read admin data:", error);
        setAdminName("");
      }
    } else {
      setAdminName("");
    }
  }, []);

  /*
   * ---------------------------------------------
   * NAVIGATION
   * ---------------------------------------------
   */

  const handleNavClick = () => {
    setIsMenuOpen(false);
  };

  /*
   * ---------------------------------------------
   * THEME
   * ---------------------------------------------
   */

  const changeTheme = () => {
    const nextTheme =
      theme === "default" ? "dark" : theme === "dark" ? "ocean" : "default";

    setTheme(nextTheme);

    localStorage.setItem("theme", nextTheme);

    if (nextTheme === "default") {
      document.documentElement.removeAttribute("data-theme");
    } else {
      document.documentElement.setAttribute("data-theme", nextTheme);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");

    if (!savedTheme || savedTheme === "default") {
      setTheme("default");
      document.documentElement.removeAttribute("data-theme");
      return;
    }

    setTheme(savedTheme);
    document.documentElement.setAttribute("data-theme", savedTheme);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  /*
   * ---------------------------------------------
   * CLOSE SETTINGS WHEN CLICKING OUTSIDE
   * ---------------------------------------------
   */

  useEffect(() => {
    const fetchStoreBranding = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/store-settings`,
        );

        if (!response.ok) {
          throw new Error("Failed to fetch store Data");
        }

        const data = await response.json();

        setBrandName(data.brandName);
        setLogo(`${process.env.NEXT_PUBLIC_API_URL}${data.logo}`);
      } catch (error) {
        console.error("Failed to fetch store D:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStoreBranding();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="relative mx-auto mt-4 flex w-full max-w-6xl items-center gap-3">
      <nav
        className="flex min-w-0 flex-1 items-center justify-between rounded-full border px-7 py-4 shadow-sm"
        style={{
          backgroundColor: "var(--bg-primary)",

          borderColor: "var(--border-color)",

          color: "var(--text-primary)",
        }}
      >
        {/* LOGO */}

        <a href="#home" className="flex items-center gap-3">
          <img
            src={logo || "/logo.png"}
            alt={brandName}
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logo.png";
            }}
            className="h-10 w-auto object-contain rounded-xl"
          />

          <span
            className="text-2xl font-bold"
            style={{
              color: "var(--text-primary)",
            }}
          >
            {brandName}
          </span>
        </a>

        {/* =================================================
            DESKTOP NAVIGATION
        ================================================== */}

        <div className="ml-auto hidden items-center gap-5 md:flex">
          {/* HOME */}

          <a
            href="#home"
            className="nav-link flex items-center gap-2 transition"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <House size={18} />
            Home
          </a>

          {/* PHONES */}

          <a
            href="#phones"
            className="nav-link flex items-center gap-2 transition"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Smartphone size={18} />
            Phones
          </a>

          {/* ABOUT */}

          <a
            href="#about"
            className="nav-link flex items-center gap-2 transition"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Info size={18} />
            About
          </a>

          {/* CONTACT */}

          <a
            href="#contact"
            className="nav-link flex items-center gap-2 transition"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Mail size={18} />
            Contact
          </a>
        </div>

        <div ref={settingsRef} className="relative z-[100] ml-5 ">
          {/* Theme button */}
          <button
            type="button"
            onClick={() => changeTheme()}
            className="cursor-pointer rounded-full p-3 shadow-md transition hover:bg-gray-100 hover:text-yellow-600"
            style={{
              backgroundColor: "var(--bg-primary)",

              color: "var(--text-primary)",
            }}
            aria-label="Open settings"
          >
            <Sun size={22} />
          </button>

          {/* =================================================
            MOBILE MENU BUTTON
          ================================================== */}

          <button
            type="button"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-auto cursor-pointer rounded-full p-2 transition hover:bg-gray-100 hover:text-yellow-600 md:hidden"
            aria-label="Toggle navigation"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {adminName ? (
        <div className="flex items-center gap-2">
          <div
            className="hidden items-center gap-2 md:flex border rounded-full px-2 py-3 font-medium transition cursor-pointer "
            onClick={() => (window.location.href = "/admin/dashboard")}
            style={{
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            Welcome, {adminName}
            <button
              type="button"
              className="flex cursor-pointer items-center justify-center rounded-full border p-3 transition "
              style={{
                backgroundColor: "var(--bg-primary)",
                color: "var(--text-primary)",
                borderColor: "var(--border-color)",
              }}
              aria-label="Open Admin Panel"
              title="Admin Panel"
            >
              <LayoutDashboard size={20} />
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleLogin}
          className="theme-accent-hover hidden cursor-pointer items-center gap-3 rounded-full border px-5 py-4 font-medium transition md:flex"
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <LogIn size={18} />
          Login
        </button>
      )}

      {/* =================================================
          MOBILE MENU
      ================================================== */}

      {isMenuOpen && (
        <div
          ref={menuRef}
          className="absolute left-50 right-3 top-[calc(100%+15px)] z-50 rounded-2xl border p-3 shadow-lg md:hidden"
          style={{
            backgroundColor: "var(--bg-primary)",

            borderColor: "var(--border-color)",

            color: "var(--text-primary)",
          }}
        >
          <div className="flex flex-col gap-2">
            {/* HOME */}

            <a
              href="#home"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100 hover:text-yellow-600"
            >
              <House size={18} />
              Home
            </a>

            {/* PHONES */}

            <a
              href="#phones"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100 hover:text-yellow-600"
            >
              <Smartphone size={18} />
              Phones
            </a>

            {/* ABOUT */}

            <a
              href="#about"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100 hover:text-yellow-600"
            >
              <Info size={18} />
              About
            </a>

            {/* CONTACT */}

            <a
              href="#contact"
              onClick={handleNavClick}
              className="flex items-center gap-3 rounded-xl px-4 py-3 transition hover:bg-gray-100 hover:text-yellow-600"
            >
              <Mail size={18} />
              Contact
            </a>

            {adminName ? (
              <div
                className="mt-3 flex w-full items-center justify-between rounded-xl border px-4 py-3"
                onClick={() => (window.location.href = "/admin/dashboard")}
                style={{
                  backgroundColor: "var(--bg-secondary)",
                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <span className="font-medium">Welcome, {adminName}</span>

                <button
                  type="button"
                  onClick={() => (window.location.href = "/admin/dashboard")}
                  className="flex cursor-pointer items-center justify-center rounded-full border p-2 transition hover:opacity-80"
                  style={{
                    backgroundColor: "var(--bg-primary)",
                    color: "var(--text-primary)",
                    borderColor: "var(--border-color)",
                  }}
                  aria-label="Open Admin Panel"
                  title="Admin Panel"
                >
                  <LayoutDashboard size={18} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleLogin}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium transition"
                style={{
                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",
                  backgroundColor: "var(--bg-secondary)",
                }}
              >
                <LogIn size={16} />
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
