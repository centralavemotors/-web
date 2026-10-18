"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { phone } from "@/lib/site";
import { PhoneLink, TextLink } from "./phone-link";

export function MobileActionBar() {
  const pathname = usePathname();
  const onInventory = pathname === "/inventory" || pathname.startsWith("/inventory/");
  return (
    <nav
      aria-label="Quick actions"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/15 bg-[#0e0e0c]/95 pb-[env(safe-area-inset-bottom)] md:hidden"
    >
      <div className="grid h-16 grid-cols-3">
        <PhoneLink location="mobile-bar" className="flex flex-col items-center justify-center leading-tight">
          <span className="text-sm">Call</span>
          <span className="text-[11px] text-[#c9c3b6]">{phone.display}</span>
        </PhoneLink>
        <TextLink
          location="mobile-bar"
          className="flex flex-col items-center justify-center border-x border-white/15 leading-tight"
        >
          <span className="text-sm">Text</span>
          <span className="text-[11px] text-[#c9c3b6]">{phone.display}</span>
        </TextLink>
        <Link
          href="/inventory"
          aria-current={onInventory ? "page" : undefined}
          className="flex items-center justify-center text-sm"
        >
          Inventory
        </Link>
      </div>
    </nav>
  );
}
