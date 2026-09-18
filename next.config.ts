import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/a/nesa-hackathons-b7e82f",
        destination: "/a/nesa-hackathons-b7e82f/index.html",
      },
    ];
  },
  async headers() {
    return [
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
