import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false,
  },
  serverRuntimeConfig: {
    // Will only be available on the server side
    bodyParser: {
      sizeLimit: '5mb',
    },
  },
};

export default nextConfig;
