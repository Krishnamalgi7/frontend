"use client";

import {
  House,
  MessageSquare,
  Smartphone,
  LogOut,
  Settings,
  Plus,
  LayoutDashboard,
  Menu,
  X,
  Sun,
  Receipt,
  BellRing,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);
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

  const [theme, setTheme] = useState("default");

  const [pendingStockAlerts, setPendingStockAlerts] = useState(0);

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
    const fetchPendingStockAlerts = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setPendingStockAlerts(0);
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
          return;
        }

        const notifications = await response.json();

        if (Array.isArray(notifications)) {
          setPendingStockAlerts(
            notifications.filter((item) => item.status === "pending").length,
          );
        }
      } catch (error) {
        console.error("Failed to fetch pending stock alerts:", error);
      }
    };

    fetchPendingStockAlerts();

    const intervalId = window.setInterval(fetchPendingStockAlerts, 30000);

    return () => window.clearInterval(intervalId);
  }, []);

  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("admin");

    router.replace("/");
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setIsMenuOpen(false);
  };

  return (
    <div className="mx-auto mt-4 w-full max-w-6xl px-3 md:px-0">
      <nav
        className="relative flex items-center justify-between rounded-full border px-5 py-3 shadow-sm md:px-7 md:py-4"
        style={{
          backgroundColor: "var(--bg-primary)",
          borderColor: "var(--border-color)",
          color: "var(--text-primary)",
        }}
      >
        {/* ADMIN LOGO */}
        <h1 className="text-xl font-bold">Admin</h1>

        {/* DESKTOP NAVIGATION */}
        <div className="ml-auto hidden items-center gap-5 md:flex">
          {/* HOME */}
          <button
            type="button"
            onClick={() => handleNavigation("/")}
            className="nav-link flex cursor-pointer items-center gap-2 transition"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <House size={17} />
            Home
          </button>

          {/* DASHBOARD */}
          <button
            type="button"
            onClick={() => handleNavigation("/admin/dashboard")}
            className={`nav-link flex cursor-pointer items-center gap-2 transition ${
              pathname === "/admin/dashboard" ? "active" : ""
            }`}
            style={{
              color: "var(--text-primary)",
            }}
          >
            <LayoutDashboard size={17} />
            Dashboard
          </button>

          {/* SHOW PHONES */}
          <button
            type="button"
            onClick={() => handleNavigation("/admin/phones")}
            className={`nav-link flex cursor-pointer items-center gap-2 transition ${
              pathname === "/admin/phones" ||
              pathname.startsWith("/admin/phones/edit/")
                ? "active"
                : ""
            }`}
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Smartphone size={17} />
            Show Phones
          </button>

          {/* Billing*/}
          <button
            type="button"
            onClick={() => router.push("/admin/billing")}
            className={`nav-link flex cursor-pointer items-center gap-2 transition ${
              pathname.startsWith("/admin/billing") ||
              pathname === "/admin/settings/billing"
                ? "active"
                : ""
            }`}
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Receipt size={17} />
            Billing
          </button>

          {/* VIEW QUERIES */}
          <button
            type="button"
            onClick={() => handleNavigation("/admin/queries")}
            className={`nav-link flex cursor-pointer items-center gap-2 transition ${
              pathname.startsWith("/admin/queries") ? "active" : ""
            }`}
            style={{
              color: "var(--text-primary)",
            }}
          >
            <MessageSquare size={17} />
            View Queries
          </button>

          {/* SETTINGS */}
          <button
            type="button"
            onClick={() => handleNavigation("/admin/settings")}
            className={`nav-link flex cursor-pointer items-center gap-2 transition ${
              (pathname.startsWith("/admin/settings") &&
                pathname !== "/admin/settings/billing") ||
              pathname === "/admin/phones/add"
                ? "active"
                : ""
            }`}
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Settings size={17} />
            Settings
          </button>

          {/* STOCK ALERTS */}
          <button
            type="button"
            onClick={() => handleNavigation("/admin/stock-alerts")}
            className={`group relative flex h-10 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border transition-all duration-200 hover:scale-105 ${
              pathname.startsWith("/admin/stock-alerts") ? "active" : ""
            }`}
            style={{
              color: "var(--text-primary)",
              borderColor: pathname.startsWith("/admin/stock-alerts")
                ? "var(--accent-color)"
                : "transparent",
              backgroundColor: pathname.startsWith("/admin/stock-alerts")
                ? "var(--bg-secondary)"
                : "transparent",
            }}
            aria-label={`Stock alerts, ${pendingStockAlerts} pending requests`}
            title={`${pendingStockAlerts} pending stock requests`}
          >
            <BellRing
              size={20}
              className="transition-transform duration-200 group-hover:rotate-[-10deg]"
            />

            {pendingStockAlerts > 0 && (
              <span
                className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-bold leading-none"
                style={{
                  backgroundColor: "var(--accent-color)",
                  color: "#111111",
                  borderColor: "var(--bg-primary)",
                }}
              >
                {pendingStockAlerts > 99 ? "99+" : pendingStockAlerts}
              </span>
            )}
          </button>

          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={() => {
              const themes = ["default", "dark", "ocean"];
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];

              setTheme(nextTheme);
              localStorage.setItem("theme", nextTheme);

              if (nextTheme === "default") {
                document.documentElement.removeAttribute("data-theme");
              } else {
                document.documentElement.setAttribute("data-theme", nextTheme);
              }
            }}
            className="flex cursor-pointer items-center justify-center rounded-full border p-2 transition"
            style={{
              color: "var(--text-primary)",
              borderColor: "var(--border-color)",
            }}
            aria-label="Change theme"
          >
            <Sun size={18} />
          </button>
        </div>

        {/* DESKTOP LOGOUT */}
        <button
          type="button"
          onClick={handleLogout}
          className="hidden cursor-pointer items-center gap-3 rounded-full border px-5 py-3 ml-4 font-medium transition hover:!border-red-500 hover:!bg-red-500 hover:!text-white md:flex"
          style={{
            backgroundColor: "var(--bg-primary)",
            color: "var(--text-primary)",
            borderColor: "var(--border-color)",
          }}
        >
          <LogOut size={18} />
          Logout
        </button>

        {/* MOBILE MENU BUTTON & Theme*/}
        <div className="flex items-center gap-2 md:hidden">
          {/* THEME TOGGLE */}
          <button
            type="button"
            onClick={() => {
              const themes = ["default", "dark", "ocean"];
              const currentIndex = themes.indexOf(theme);
              const nextTheme = themes[(currentIndex + 1) % themes.length];

              setTheme(nextTheme);
              localStorage.setItem("theme", nextTheme);

              if (nextTheme === "default") {
                document.documentElement.removeAttribute("data-theme");
              } else {
                document.documentElement.setAttribute("data-theme", nextTheme);
              }
            }}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2"
            aria-label="Change theme"
            style={{
              color: "var(--text-primary)",
            }}
          >
            <Sun size={22} />
          </button>

          {/* MENU */}
          <button
            type="button"
            onClick={() => setIsMenuOpen((current) => !current)}
            className="flex cursor-pointer items-center justify-center rounded-lg p-2"
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
            style={{
              color: "var(--text-primary)",
            }}
          >
            {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>

        {/* MOBILE View*/}

        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute left-30 right-0 top-[calc(100%+15px)] z-50 rounded-2xl border p-3 shadow-lg md:hidden"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
            }}
          >
            <div className="flex flex-col gap-1">
              {/* HOME */}
              <button
                type="button"
                onClick={() => handleNavigation("/")}
                className={`flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname === "/" ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <House size={18} />
                Home
              </button>

              {/* DASHBOARD */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/dashboard")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname === "/admin/dashboard" ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <LayoutDashboard size={18} />
                Dashboard
              </button>

              {/* BILLING */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/billing")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname.startsWith("/admin/billing") ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <Receipt size={18} />
                Billing
              </button>

              {/* SHOW PHONES */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/phones")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname === "/admin/phones" ||
                  pathname.startsWith("/admin/phones/edit/")
                    ? "active"
                    : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <Smartphone size={18} />
                Show Phones
              </button>

              {/* SETTINGS */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/settings")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname.startsWith("/admin/settings") ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <Settings size={18} />
                Settings
              </button>

              {/* VIEW QUERIES */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/queries")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname.startsWith("/admin/queries") ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <MessageSquare size={18} />
                View Queries
              </button>

              {/* STOCK ALERTS */}
              <button
                type="button"
                onClick={() => handleNavigation("/admin/stock-alerts")}
                className={`nav-link flex items-center justify-left gap-3 rounded-xl px-4 py-2 text-left transition focus:bg-blue-300 focus:text-white${
                  pathname.startsWith("/admin/stock-alerts") ? "active" : ""
                }`}
                style={{
                  color: "var(--text-primary)",
                }}
              >
                <BellRing size={18} />
                Stock Alerts
              </button>

              {/* LOGOUT */}
              <button
                type="button"
                onClick={handleLogout}
                className="mt-2 flex items-center justify-left gap-3 rounded-xl border px-4 py-3 text-left font-medium transition hover:!border-red-500 hover:!bg-red-500 hover:!text-white"
                style={{
                  color: "var(--text-primary)",
                  borderColor: "var(--border-color)",
                }}
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        )}
      </nav>
    </div>
  );
}
