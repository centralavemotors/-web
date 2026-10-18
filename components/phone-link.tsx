"use client";

import { track } from "@/lib/analytics";
import { phone, smsHref, telHref } from "@/lib/site";

export function PhoneLink({
  location,
  className,
  children,
}: {
  location: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={telHref()}
      className={className}
      onClick={() => track({ name: "phone_click", payload: { location } })}
    >
      {children ?? phone.display}
    </a>
  );
}

export function TextLink({
  location,
  className,
  children,
}: {
  location: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <a
      href={smsHref()}
      className={className}
      onClick={() => track({ name: "text_click", payload: { location } })}
    >
      {children ?? "Text"}
    </a>
  );
}
