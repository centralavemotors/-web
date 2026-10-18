"use client";

import Image from "next/image";
import { useState } from "react";
import type { VehiclePhoto } from "@/lib/inventory/types";

export function VehicleGallery({ photos, title }: { photos: VehiclePhoto[]; title: string }) {
  const [index, setIndex] = useState(0);
  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full max-w-[760px] items-center justify-center bg-white text-[#4a463f] ring-1 ring-white/15">
        Photo coming soon
      </div>
    );
  }
  const photo = photos[index] ?? photos[0];
  const several = photos.length > 1;

  function move(delta: number) {
    setIndex((current) => (current + delta + photos.length) % photos.length);
  }

  return (
    <div
      className="w-full max-w-[760px]"
      tabIndex={several ? 0 : undefined}
      role={several ? "region" : undefined}
      aria-label={several ? `${title} photos` : undefined}
      onKeyDown={
        several
          ? (event) => {
              if (event.key === "ArrowRight") move(1);
              if (event.key === "ArrowLeft") move(-1);
            }
          : undefined
      }
    >
      <div className="bg-white p-3 ring-1 ring-white/15 sm:p-6">
        <div className="relative mx-auto aspect-[4/3] w-full">
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            priority={index === 0}
            className="object-contain"
            sizes="(max-width: 1024px) 92vw, 720px"
          />
        </div>
      </div>
      {several ? (
        <>
          <p className="mt-3 text-sm text-[#c9c3b6]">
            Photo {index + 1} of {photos.length}. Use the thumbnails or arrow keys.
          </p>
          <ul className="mt-3 flex gap-2 overflow-x-auto pb-1">
            {photos.map((item, photoIndex) => (
              <li key={item.src}>
                <button
                  type="button"
                  aria-label={`Show photo ${photoIndex + 1}`}
                  aria-current={photoIndex === index ? "true" : undefined}
                  onClick={() => setIndex(photoIndex)}
                  className={`relative h-16 w-20 bg-white ${photoIndex === index ? "ring-2 ring-[#9f1c1c]" : "ring-1 ring-white/20"}`}
                >
                  <Image src={item.src} alt="" fill className="object-contain" sizes="80px" />
                </button>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  );
}
