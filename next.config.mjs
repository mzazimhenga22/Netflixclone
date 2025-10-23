import path from "path";
import { fileURLToPath } from "url";

/** Fix for __dirname in ES Modules */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "placehold.co", pathname: "/**" },
      { protocol: "https", hostname: "images.unsplash.com", pathname: "/**" },
      { protocol: "https", hostname: "picsum.photos", pathname: "/**" },
      { protocol: "https", hostname: "image.tmdb.org", pathname: "/**" },
      { protocol: "https", hostname: "firebasestorage.googleapis.com", pathname: "/**" },
    ],
  },

  // ✅ New stable location for Turbopack settings
  turbopack: {
    rules: {}, // empty object = safe neutral config
  },

  webpack: (config) => {
    config.resolve.alias["react-native"] = path.resolve(
      __dirname,
      "src/mocks/react-native.js"
    );
    return config;
  },
};

export default nextConfig;
