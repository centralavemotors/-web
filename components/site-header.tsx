"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { buttonVariants } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "cn";
import { PhoneLink, TextLink } from "./phone-link";
import { Wordmark } from "./wordmark";

const NAV = [
  { href: "/inventory", label: "Inventory" },
  { href: "/financing", label: "Financing" },
  { href: "/sell", label: "Sell / Trade" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
];

function isActive(pathname: string, href: string) {
  if (href === "/inventory") return pathname === href || pathname.startsWith("/inventory/");
  return pathname === href;
}

export function SiteHeader() {
  const pathname = usePathname();
  const home = pathname === "/";
  const [open, setOpen] = useState(false);

  return (
    <header
      className={cn(
        "z-40 h-[4.25rem]",
        home
          ? "absolute inset-x-0 top-0"
          : "sticky top-0 border-b border-white/10 bg-[#0e0e0c]/90 backdrop-blur-md",
      )}
    >
      <div className="mx-auto flex h-full max-w-[1180px] items-center justify-between gap-4 px-5 sm:px-8">
        <Wordmark />
        <nav aria-label="Primary" className="hidden items-center gap-6 lg:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive(pathname, item.href) ? "page" : undefined}
              className={cn(
                "text-sm tracking-wide",
                isActive(pathname, item.href) && "underline decoration-[#9f1c1c] decoration-2 underline-offset-8",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <PhoneLink location="header" className="hidden text-sm lg:inline" />
          <Link
            href="/financing"
            className={buttonVariants({ variant: "outline", className: "hidden h-11 px-4 lg:inline-flex" })}
          >
            Get pre-qualified
          </Link>
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger className={buttonVariants({ variant: "outline", className: "h-11 px-4 lg:hidden" })}>
              Menu
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:max-w-sm">
              <SheetHeader>
                <SheetTitle className="font-display text-3xl tracking-tight">Central Ave Motors</SheetTitle>
              </SheetHeader>
              <nav aria-label="Mobile" className="grid px-4">
                {NAV.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setOpen(false)}
                    aria-current={isActive(pathname, item.href) ? "page" : undefined}
                    className="border-b border-white/10 py-4 font-display text-4xl tracking-tight"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-auto grid gap-3 p-4">
                <PhoneLink location="menu" className="flex h-12 items-center justify-center border border-white/20">
                  Call
                </PhoneLink>
                <TextLink location="menu" className="flex h-12 items-center justify-center border border-white/20">
                  Text
                </TextLink>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
