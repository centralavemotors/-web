"use client";

import { useEffect, useState } from "react";
import Script from "next/script";
import { Button } from "@/components/ui/button";

const STORAGE_KEY = "cam-consent";
const GTM = /^GTM-[A-Z0-9]+$/;
const GA4 = /^G-[A-Z0-9]+$/;
const PIXEL = /^\d{5,20}$/;
const CLARITY = /^[a-z0-9]+$/i;

function readFlag(name: string, pattern: RegExp) {
  const value = process.env[name];
  return value && pattern.test(value) ? value : null;
}

export function ConsentBanner() {
  const [choice, setChoice] = useState<"loading" | "unknown" | "granted" | "denied">("loading");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "granted" || stored === "denied") setChoice(stored);
    else setChoice("unknown");
  }, []);

  function choose(next: "granted" | "denied") {
    window.localStorage.setItem(STORAGE_KEY, next);
    setChoice(next);
  }

  const gtmId = readFlag("NEXT_PUBLIC_GTM_ID", GTM);
  const ga4Id = gtmId ? null : readFlag("NEXT_PUBLIC_GA4_ID", GA4);
  const pixelId = readFlag("NEXT_PUBLIC_META_PIXEL_ID", PIXEL);
  const clarityId = readFlag("NEXT_PUBLIC_CLARITY_ID", CLARITY);
  const show = choice === "unknown";

  return (
    <>
      {choice === "granted" && gtmId ? (
        <Script id="gtm" strategy="afterInteractive">
          {`window.dataLayer=window.dataLayer||[];window.dataLayer.push({'gtm.start':new Date().getTime(),event:'gtm.js'});var s=document.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${gtmId}';document.head.appendChild(s);`}
        </Script>
      ) : null}
      {choice === "granted" && ga4Id ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${ga4Id}`} strategy="afterInteractive" />
          <Script id="ga4" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;window.__camGa4=true;gtag('js',new Date());gtag('config','${ga4Id}');`}
          </Script>
        </>
      ) : null}
      {choice === "granted" && pixelId ? (
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${pixelId}');fbq('track','PageView');window.__camPixel=true;`}
        </Script>
      ) : null}
      {choice === "granted" && clarityId ? (
        <Script id="clarity" strategy="afterInteractive">
          {`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${clarityId}");`}
        </Script>
      ) : null}
      {show ? (
        <div
          role="dialog"
          aria-labelledby="consent-title"
          className="fixed inset-x-0 z-50 border-t border-white/15 bg-[#171714] p-4 shadow-2xl md:bottom-0 bottom-[calc(4rem+env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-[1180px] flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              <p id="consent-title" className="font-medium">
                Analytics cookies
              </p>
              <p className="mt-2 text-sm leading-relaxed text-[#c9c3b6]">
                Optional analytics help us see which vehicles people view. You can decline and keep using the site.
                Fields in forms are masked in session recordings. Read the <a className="underline underline-offset-4" href="/privacy">privacy draft</a>.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 md:w-80">
              <Button type="button" variant="outline" className="h-12" onClick={() => choose("denied")}>
                Decline
              </Button>
              <Button type="button" className="h-12" onClick={() => choose("granted")}>
                Accept
              </Button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
