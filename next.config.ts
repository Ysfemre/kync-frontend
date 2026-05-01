import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Kanka burayı "unoptimized" yaparak Next.js'in resme karışmasını engelliyoruz
    unoptimized: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "kync-api.onrender.com",
        pathname: "/uploads/**",
      },
    ],
  },
};

export default nextConfig;
