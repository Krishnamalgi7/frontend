"use client";

import AdminNavbar from "../../components/admin/AdminNavbar";
import { usePathname } from "next/navigation";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  const isAuthPage =
    pathname === "/admin/login" || pathname === "/admin/signup";

  return (
    <>
      {!isAuthPage && <AdminNavbar />}
      {children}
    </>
  );
}