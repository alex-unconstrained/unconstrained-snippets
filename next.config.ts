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
      {
        source: "/a/charting-our-direction-60c6cc",
        destination: "/a/charting-our-direction-60c6cc/index.html",
      },
      {
        source: "/a/charting-our-direction-v2-4f999d",
        destination: "/a/charting-our-direction-v2-4f999d/index.html",
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
      {
        source: "/a/charting-our-direction-60c6cc/:path*",
        headers: [
          { key: "X-Robots-Tag", value: "noindex, nofollow" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      {
        source: "/a/charting-our-direction-v2-4f999d/:path*",
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
