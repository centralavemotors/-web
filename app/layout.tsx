import type { Metadata, Viewport } from "next";
import { Fraunces, Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { ConsentBanner } from "@/components/consent-banner";
import { JsonLd } from "@/components/json-ld";
import { MobileActionBar } from "@/components/mobile-action-bar";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { UtmCapture } from "@/components/utm-capture";
import { dealerJsonLd } from "@/lib/seo";
import { siteUrl } from "@/lib/site";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-fraunces",
  display: "swap",
});

const indexable = process.env.ROBOTS_INDEX === "true";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl()),
  title: {
    default: "Central Ave Motors · Luxury used cars in Yonkers",
    template: "%s · Central Ave Motors",
  },
  description:
    "Independent dealer of pre-owned luxury and performance cars in Yonkers, NY. Advertised prices include dealer charges. Nationwide shipping, with out-of-state registration and temporary tags.",
  robots: indexable ? { index: true, follow: true } : { index: false, follow: false },
  openGraph: {
    siteName: "Central Ave Motors",
    type: "website",
    locale: "en_US",
  },
};

export const viewport: Viewport = {
  themeColor: "#0e0e0c",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${geist.variable} ${geistMono.variable} ${fraunces.variable}`}>
      <body className="min-h-dvh bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] font-sans text-foreground antialiased md:pb-0">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-[70] focus:bg-[#f6f4ef] focus:px-4 focus:py-3 focus:text-[#1c1b18]"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <MobileActionBar />
        <ConsentBanner />
        <Suspense fallback={null}>
          <UtmCapture />
        </Suspense>
        <JsonLd data={dealerJsonLd()} />
      </body>
    </html>
  );
}
