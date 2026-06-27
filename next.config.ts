import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 100],
  },
  experimental: {
    // Allow admissions document uploads (up to 5 files x 5 MB) through the server action.
    serverActions: {
      bodySizeLimit: "30mb",
    },
  },
  async rewrites() {
    // Serve the static brand guidelines document at the clean URL /brand.
    return [{ source: "/brand", destination: "/brand.html" }];
  },
};

export default nextConfig;
