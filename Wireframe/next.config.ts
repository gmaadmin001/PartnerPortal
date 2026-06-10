import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "honeydew-capybara-608687.hostingersite.com",
      },
    ],
  },
};

export default nextConfig;
