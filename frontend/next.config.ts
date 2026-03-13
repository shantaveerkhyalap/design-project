import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for Docker: produces a self-contained server bundle
  // that can be run with `node server.js` (no node_modules needed at runtime)
  output: "standalone",
};

export default nextConfig;
