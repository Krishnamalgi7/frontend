import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

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

    return {
      title: data.brandName,
      description: `${data.brandName} - Your trusted mobile store`,
      icons: {
        icon: `${process.env.NEXT_PUBLIC_API_URL}${data.logo}`,
      },
    };
  } catch (error) {
    console.error("Failed to fetch store Data:", error);

    return {
      title: "Nova",
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
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
