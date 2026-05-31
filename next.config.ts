import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Tree-shake large packages — only import what's used
  experimental: {
    optimizePackageImports: ["lucide-react", "@radix-ui/react-icons", "framer-motion"],
  },
  // Compress responses
  compress: true,
};

export default nextConfig;
