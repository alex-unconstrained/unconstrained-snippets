import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/a/little-nest-4c9e72",
        destination: "/a/little-nest-4c9e72/index.html",
      },
      {
        source: "/a/nesa-hackathons-b7e82f",
        destination: "/a/nesa-hackathons-b7e82f/index.html",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/a/little-nest-4c9e72/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/a/nesa-hackathons-b7e82f/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;
