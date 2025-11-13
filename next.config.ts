import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "placehold.co",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
      {
        protocol: "https",
        hostname: "firebasestorage.googleapis.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "assets.nflxext.com", // ✅ Netflix CDN for hero/marketing images
        pathname: "/**",
      },
    ],
    // Disable Next.js image optimization in development to avoid timeouts
    // when fetching very large remote images (useful for local dev with Turbopack).
    // Remove or set to false in production to enable optimization.
    unoptimized: true,
  },

  reactStrictMode: true,
  swcMinify: true,
};

export default nextConfig;
