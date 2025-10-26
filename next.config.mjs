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

      // ✅ Added Netflix background image domain
      { protocol: "https", hostname: "assets.nflxext.com", pathname: "/**" },
    ],
  },

  // ✅ Turbopack-compatible placeholder (safe default)
  turbopack: {
    rules: {},
  },

  // ✅ Preserve your React Native alias
  webpack: (config) => {
    config.resolve.alias["react-native"] = path.resolve(
      __dirname,
      "src/mocks/react-native.js"
    );
    return config;
  },
};

export default nextConfig;
