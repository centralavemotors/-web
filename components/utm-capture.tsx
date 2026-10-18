"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

const KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;

export function UtmCapture() {
  const pathname = usePathname();
  const search = useSearchParams();
  useEffect(() => {
    const next: Record<string, string> = {};
    let found = false;
    for (const key of KEYS) {
      const value = search.get(key);
      if (value) {
        next[key] = value.slice(0, 120);
        found = true;
      }
    }
    if (!found) return;
    try {
      sessionStorage.setItem("cam-utm", JSON.stringify(next));
    } catch {
      /* storage can be blocked */
    }
  }, [pathname, search]);
  return null;
}
