import { useEffect } from "react";

export function GoogleAnalytics() {
  const measurementId =
    (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID as string | undefined) ||
    "G-Q2GFXM19H0";

  useEffect(() => {
    if (!measurementId) return;
    if (document.getElementById("ga-loader")) return;

    const loader = document.createElement("script");
    loader.id = "ga-loader";
    loader.async = true;
    loader.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    document.head.appendChild(loader);

    const inline = document.createElement("script");
    inline.id = "google-analytics";
    inline.text = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${measurementId}');
    `;
    document.head.appendChild(inline);
  }, [measurementId]);

  return null;
}
