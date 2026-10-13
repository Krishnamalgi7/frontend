
"use client";

import { useEffect } from "react";

export default function FaviconFallback() {
  useEffect(() => {
    const fallbackUrl = "/logo.png?v=2";
    const faviconLinks = document.querySelectorAll<HTMLLinkElement>(
      'link[rel~="icon"]',
    );

    if (faviconLinks.length === 0) {
      const link = document.createElement("link");
      link.rel = "icon";
      link.type = "image/png";
      link.href = fallbackUrl;
      document.head.appendChild(link);
      return;
    }

    faviconLinks.forEach((link) => {
      const image = new Image();

      image.onerror = () => {
        link.type = "image/png";
        link.href = fallbackUrl;
      };

      image.src = link.href;
    });
  }, []);

  return null;
}
