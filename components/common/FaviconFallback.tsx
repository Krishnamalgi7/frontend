
"use client";

import { useEffect } from "react";

export default function FaviconFallback() {
  useEffect(() => {
    const favicon = document.querySelector<HTMLLinkElement>(
      'link[rel~="icon"]',
    );

    if (!favicon) return;

    const fallbackUrl = "/logo.png";
    const image = new Image();

    image.onerror = () => {
      favicon.href = fallbackUrl;
    };

    image.src = favicon.href;

    return () => {
      image.onerror = null;
    };
  }, []);

  return null;
}
