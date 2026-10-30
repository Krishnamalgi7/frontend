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
  ChevronRight,
  Package,
  MessageSquareText,
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";

type QueryNotification = {
  _id: string;
  name: string;
  phone: string;
  message: string;
  status: "pending" | "in_progress" | "completed";
  createdAt?: string;
};

type StockNotification = {
  _id: string;
  status: "pending" | "notified" | "cancelled";
  createdAt: string;
  phoneId: {
    _id: string;
    name: string;
    quantity?: number;
  } | null;
  customerId: {
    name?: string;
  } | null;
};

export default function AdminNavbar() {
  const router = useRouter();
  const pathname = usePathname();

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }

      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target as Node)
      ) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const [theme, setTheme] = useState("default");

  const [pendingStockAlerts, setPendingStockAlerts] = useState(0);
  const [totalNotificationCount, setTotalNotificationCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [queryNotifications, setQueryNotifications] = useState<
    QueryNotification[]
  >([]);
  const [stockNotifications, setStockNotifications] = useState<
    StockNotification[]
  >([]);
  const [selectedNotification, setSelectedNotification] =
    useState<StockNotification | null>(null);

  // Pagination for
  const [queryPage, setQueryPage] = useState(1);
  const [stockPage, setStockPage] = useState(1);

  const [queryTotalPages, setQueryTotalPages] = useState(0);
  const [stockTotalPages, setStockTotalPages] = useState(0);

  const [notificationLoading, setNotificationLoading] = useState(false);

  const [readNotificationIds, setReadNotificationIds] = useState<string[]>([]);

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
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("adminToken");

        if (!token) {
          setPendingStockAlerts(0);
          setQueryNotifications([]);
          setStockNotifications([]);
          return;
        }

        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const [queryResponse, stockResponse, summaryResponse] =
          await Promise.all([
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/admin/notifications?page=${queryPage}&limit=3`,
              { headers },
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/stock-notifications/admin/pending?page=${stockPage}&limit=3`,
              { headers },
            ),
            fetch(
              `${process.env.NEXT_PUBLIC_API_URL}/api/stock-notifications/admin/summary`,
              { headers },
            ),
          ]);

        if (queryResponse.ok) {
          const queryData = await queryResponse.json();

          setQueryNotifications(
            Array.isArray(queryData.notifications)
              ? queryData.notifications
              : [],
          );

          setQueryTotalPages(queryData.pagination?.totalPages ?? 0);
        }

        if (stockResponse.ok) {
          const stockData = await stockResponse.json();

          setStockNotifications(
            Array.isArray(stockData.notifications)
              ? stockData.notifications
              : [],
          );

          setStockTotalPages(stockData.pagination?.totalPages ?? 0);
        }

        if (summaryResponse.ok) {
          const summaryData = await summaryResponse.json();
          setPendingStockAlerts(Number(summaryData.pendingStockCount) || 0);

          setTotalNotificationCount(Number(summaryData.unreadCount) || 0);
        }
      } catch (error) {
        console.error("Failed to fetch notifications:", error);
      }
    };

    fetchNotifications();

    const socket = io(
      process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
    );

    socket.on("new-stock-notification", fetchNotifications);
    socket.on("new-contact-message", fetchNotifications);
    socket.on("stock-notifications-processed", fetchNotifications);
    socket.on("admin-query-notification-read", fetchNotifications);

    return () => {
      socket.disconnect();
    };
  }, [queryPage, stockPage]);

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
        ref={notificationRef}
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

          <div className="relative">
            {/* STOCK ALERTS */}
            <button
              type="button"
              onClick={() => setIsNotificationOpen((prev) => !prev)}
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

              {totalNotificationCount > 0 && (
                <span
                  className="absolute -right-1 -top-1 flex h-[19px] min-w-[19px] items-center justify-center rounded-full border-2 px-1 text-[10px] font-bold leading-none"
                  style={{
                    backgroundColor: "var(--accent-color)",
                    color: "#111111",
                    borderColor: "var(--bg-primary)",
                  }}
                >
                  {totalNotificationCount > 99 ? "99+" : totalNotificationCount}
                </span>
              )}
            </button>
          </div>

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

        {isNotificationOpen && (
          <div
            className="fixed left-1/2 top-[120px] z-[100] flex max-h-[calc(100dvh-220px)] w-[calc(100vw-24px)] max-w-[860px] -translate-x-1/2 flex-col overflow-hidden rounded-2xl border shadow-2xl md:max-h-[calc(100dvh-220px)] md:w-[calc(100vw-48px)]"
            style={{
              backgroundColor: "var(--bg-primary)",
              borderColor: "var(--border-color)",
              color: "var(--text-primary)",
            }}
          >
            <div
              className="flex min-h-16 shrink-0 items-center justify-between border-b px-4 py-3"
              style={{ borderColor: "var(--border-color)" }}
            >
              <div className="flex flex-col gap-1">
                <h2 className="flex items-center gap-2 text-base font-semibold">
                  <MessageSquareText size={18} />
                  Notifications
                </h2>

                <p className="text-xs opacity-70">
                  Manage customer queries and stock requests
                </p>
              </div>

              <button
                type="button"
                onClick={() => setIsNotificationOpen(false)}
                className="cursor-pointer rounded-full p-2 transition-colors duration-200 hover:bg-[var(--accent-color)]"
                aria-label="Close notifications"
              >
                <X size={18} />
              </button>
            </div>

            <div className="grid min-h-0 flex-1 grid-cols-1 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:grid-cols-2">
              {/* Query notifications */}
              <section
                className="border-b p-4 md:border-b-0 md:border-r"
                style={{ borderColor: "var(--border-color)" }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <MessageSquareText size={17} />
                    Customer Queries
                  </h3>
                  <span
                    className="rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    {queryNotifications.length} Pending
                  </span>
                </div>

                {queryNotifications.length === 0 ? (
                  <p
                    className="rounded-xl p-4 text-sm opacity-60"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    No customer queries found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {queryNotifications.map((item) => (
                      <button
                        key={item._id}
                        type="button"
                        onClick={async () => {
                          const token = localStorage.getItem("adminToken");

                          try {
                            if (!token) {
                              router.replace("/admin/login");
                              return;
                            }

                            const response = await fetch(
                              `${process.env.NEXT_PUBLIC_API_URL}/api/contacts/${item._id}/admin-notification/read`,
                              {
                                method: "PATCH",
                                headers: {
                                  Authorization: `Bearer ${token}`,
                                },
                              },
                            );

                            if (!response.ok) {
                              console.error(
                                "Failed to mark query notification as read",
                              );
                            }
                          } catch (error) {
                            console.error(
                              "Failed to mark query notification as read:",
                              error,
                            );
                          }

                          setIsNotificationOpen(false);
                          router.push(`/admin/queries/${item._id}`);
                        }}
                        className="w-full rounded-xl border p-3 text-left transition hover:opacity-80"
                        style={{
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--bg-secondary)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <span className="text-sm font-medium">
                            {item.name}
                          </span>
                          <span className="shrink-0 text-xs opacity-60">
                            {item.status.replace("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 line-clamp-1 text-xs opacity-70">
                          {item.message}
                        </p>
                        <span
                          className="mt-2 inline-block text-xs font-medium cursor-pointer"
                          style={{ color: "var(--accent-color)" }}
                        >
                          View query →
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {queryTotalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={queryPage <= 1}
                      onClick={() => setQueryPage((page) => page - 1)}
                      className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      Previous
                    </button>

                    <span className="text-xs opacity-70">
                      Page {queryPage} of {queryTotalPages}
                    </span>

                    <button
                      type="button"
                      disabled={queryPage >= queryTotalPages}
                      onClick={() => setQueryPage((page) => page + 1)}
                      className="rounded-lg border px-3 py-2 text-xs disabled:opacity-40"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      Next
                    </button>
                  </div>
                )}

                {/* <button
                  type="button"
                  onClick={() => {
                    setIsNotificationOpen(false);
                    handleNavigation("/admin/queries");
                  }}
                  className="mt-3 w-full rounded-lg border px-3 py-2 text-sm font-medium transition hover:opacity-80"
                  style={{ borderColor: "var(--border-color)" }}
                >
                  View all queries
                </button> */}
              </section>

              {/* Stock notifications */}
              <section className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="flex items-center gap-2 text-sm font-semibold">
                    <Package size={17} />
                    Stock Requests
                  </h3>
                  <span
                    className="rounded-full px-2 py-1 text-xs"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    {pendingStockAlerts} Pending
                  </span>
                </div>

                {stockNotifications.length === 0 ? (
                  <p
                    className="rounded-xl p-4 text-sm opacity-60"
                    style={{ backgroundColor: "var(--bg-secondary)" }}
                  >
                    No stock requests found.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {stockNotifications.map((item) => (
                      <div
                        key={item._id}
                        className="rounded-xl border p-3"
                        style={{
                          borderColor: "var(--border-color)",
                          backgroundColor: "var(--bg-secondary)",
                        }}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="w-full min-w-0">
                            <p className="text-sm font-medium">
                              {item.phoneId?.name || "Phone unavailable"}
                            </p>

                            <p className="mt-1 text-xs opacity-70">
                              Customer: {item.customerId?.name || "Unknown"}
                            </p>

                            <div className=" flex w-full items-center  gap-3">
                              <p className="text-xs opacity-60">
                                Status: {item.status}
                                {item.phoneId?.quantity !== undefined
                                  ? ` · Stock: ${item.phoneId.quantity}`
                                  : ""}
                              </p>

                              {item.phoneId?._id && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setIsNotificationOpen(false);
                                    handleNavigation(
                                      `/admin/phones/edit/${item.phoneId!._id}`,
                                    );
                                  }}
                                  className="ml-auto shrink-0 rounded-3xl px-4 py-1.5 text-xs font-medium text-black transition hover:opacity-90 cursor-pointer"
                                  style={{
                                    backgroundColor: "var(--accent-color)",
                                  }}
                                >
                                  View Phone →
                                </button>
                              )}
                            </div>
                          </div>

                          <Package size={17} className="shrink-0 opacity-60" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {stockTotalPages > 1 && (
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={stockPage <= 1}
                      onClick={() => setStockPage((page) => page - 1)}
                      className="rounded-lg border px-3 py-2 text-xs cursor-pointer"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      Previous
                    </button>

                    <span className="text-xs opacity-70">
                      Page {stockPage} of {stockTotalPages}
                    </span>

                    <button
                      type="button"
                      disabled={stockPage >= stockTotalPages}
                      onClick={() => setStockPage((page) => page + 1)}
                      className="rounded-lg border px-3 py-2 text-xs cursor-pointer"
                      style={{ borderColor: "var(--border-color)" }}
                    >
                      Next
                    </button>
                  </div>
                )}
                {selectedNotification && (
                  <div
                    className="mt-3 rounded-xl border p-3"
                    style={{ borderColor: "var(--border-color)" }}
                  >
                    <p className="text-sm font-semibold">
                      {selectedNotification.phoneId?.name ||
                        "Phone unavailable"}
                    </p>
                    <p className="mt-1 text-xs opacity-70">
                      Customer:{" "}
                      {selectedNotification.customerId?.name || "Unknown"}
                    </p>
                    <p className="mt-1 text-xs opacity-70">
                      Request status: {selectedNotification.status}
                    </p>

                    {selectedNotification.phoneId?._id && (
                      <button
                        type="button"
                        onClick={() => {
                          setIsNotificationOpen(false);
                          handleNavigation(
                            `/admin/phones/edit/${selectedNotification.phoneId!._id}`,
                          );
                        }}
                        className="mt-3 w-full rounded-lg px-3 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        style={{ backgroundColor: "var(--accent-color)" }}
                      >
                        Open phone details
                      </button>
                    )}
                  </div>
                )}
              </section>
            </div>
          </div>
        )}

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

        {/* MOBILEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEEE */}

        {/* MOBILE MENU BUTTON & Theme*/}
        <div className="flex items-center gap-2 md:hidden">
          {/* MOBILE NOTIFICATION BELL */}
          <button
            type="button"
            onClick={() => {
              setIsNotificationOpen((prev) => !prev);
              setIsMenuOpen(false);
            }}
            className="relative flex cursor-pointer items-center justify-center rounded-lg p-2"
            style={{ color: "var(--text-primary)" }}
            aria-label="Open notifications"
          >
            <BellRing size={22} />

            {totalNotificationCount > 0 && (
              <span
                className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold text-white"
                style={{ backgroundColor: "var(--accent-color)" }}
              >
                {totalNotificationCount > 99 ? "99+" : totalNotificationCount}
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
