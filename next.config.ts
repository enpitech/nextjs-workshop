import type { NextConfig } from "next";
import { withEve } from "eve/next";

const nextConfig: NextConfig = {
  // Required for "use cache". Off, the directive does not compile.
  cacheComponents: true,
};

// withEve starts the agent in agent/ next to `next dev` and sends /eve/v1/* to it.
// eve needs Node 24. On Node 22 the app runs as before, and /agent says why it is off.
const nodeMajor = Number(process.versions.node.split(".")[0]);

export default nodeMajor >= 24 ? withEve(nextConfig) : nextConfig;
