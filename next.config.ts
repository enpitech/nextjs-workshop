import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Required for "use cache". Off, the directive does not compile.
  cacheComponents: true,
};

export default nextConfig;
