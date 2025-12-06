import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    '192.168.1.103',
    'localhost',
    '127.0.0.1',
  ],
};

export default nextConfig;
