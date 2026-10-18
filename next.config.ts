import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.autofunds.net",
        pathname: "/InventoryImages/**",
      },
    ],
    deviceSizes: [640, 768, 828, 1080],
    imageSizes: [384, 480, 640, 840],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
