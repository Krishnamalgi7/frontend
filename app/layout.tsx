import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import FaviconFallback from "../components/common/FaviconFallback";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const dynamic = "force-dynamic";


export async function generateMetadata(): Promise<Metadata> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/store-settings`,
      {
        cache: "no-store",
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch store Data");
    }

    const data = await response.json();

    const logoUrl = data.logo
      ? `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`
      : "/logo.png";

    return {
      title: data.brandName || "Phone Store",
      description: `${data.brandName || "Phone Store"} - Your trusted mobile store`,
      icons: {
        icon: data.logo
          ? `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`
          : "/logo.png",
      },
    };
  } catch (error) {
    console.error("Failed to fetch store Data:", error);

    return {
      title: "Phone Store",
      description: "Your trusted mobile store",
      icons: {
        icon: "/logo.png",
      },
    };
  }
}


export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <FaviconFallback />
        {children}
      </body>
    </html>
  );
}
