import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true,
    qualities: [75, 100],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  async rewrites() {
    // Serve the static brand guidelines document at the clean URL /brand.
    return [{ source: "/brand", destination: "/brand.html" }];
  },
};

export default nextConfig;
