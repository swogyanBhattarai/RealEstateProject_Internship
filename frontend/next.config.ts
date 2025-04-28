import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // (optional if you want optimization)
  trailingSlash: false,
  reactStrictMode: true,
  images: {
    unoptimized: true, // optional if you don't use next/image
  },
  
  assetPrefix: '',
  basePath: '',
};

export default nextConfig;
