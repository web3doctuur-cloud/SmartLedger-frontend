import type { NextConfig } from "next";

const BACKEND_API_URL =
  process.env.BACKEND_API_URL || "https://smartledger-api-o7hy.onrender.com/api";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${BACKEND_API_URL}/:path*`,
      },
    ];
  },
};

export default nextConfig;
