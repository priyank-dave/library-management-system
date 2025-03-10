"use client";

import { useEffect } from "react";
import Script from "next/script";
import HomePage from "@/components/SiteLayout/HomePage/Home";

export default function Home() {
  const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

  useEffect(() => {
    const handleGoogleCallback = (response) => {
      console.log("Google Login Response:", response);
    };

    if (typeof window !== "undefined" && window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
      });
    }
  }, [GOOGLE_CLIENT_ID]);

  return (
    <>
      {/* Load Google API Script */}
      <Script
        src="https://accounts.google.com/gsi/client"
        strategy="afterInteractive"
        onLoad={() => {
          console.log("Google script loaded");
        }}
      />
      <HomePage />
    </>
  );
}
