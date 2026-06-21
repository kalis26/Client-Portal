import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "playwright-core"],
  outputFileTracingIncludes: {
    "/api/admin/projects": ["./node_modules/@sparticuz/chromium/bin/**"],
    "/api/admin/projects/[projectId]/documents/agreement": ["./node_modules/@sparticuz/chromium/bin/**"],
  },
};

export default nextConfig;
