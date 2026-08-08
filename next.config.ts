import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep the project-owned AGENTS.md; Next.js otherwise regenerates one on dev start.
  agentRules: false,
};

export default nextConfig;
