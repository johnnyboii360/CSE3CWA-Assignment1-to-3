import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "0.0.0.0", "192.168.56.1"],
  output: 'standalone',
};

export default nextConfig;
