"use client";

import { useEffect } from "react";
import { Container } from "@/components/container";
import { PhoneLink } from "@/components/phone-link";
import { Button } from "@/components/ui/button";

export default function Error({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error("Page error");
  }, []);
  return (
    <Container className="py-24">
      <h1 className="font-display text-6xl tracking-tight">Something went wrong.</h1>
      <p className="mt-4 max-w-md text-[#c9c3b6]">Try the page again, or call the showroom and we will look up the car with you.</p>
      <div className="mt-8 flex flex-wrap gap-4">
        <Button type="button" className="h-12" onClick={() => reset()}>
          Try again
        </Button>
        <PhoneLink location="error" className="inline-flex h-12 items-center border border-white/20 px-5" />
      </div>
    </Container>
  );
}
