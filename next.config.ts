import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Evita concorrência de workers no Windows durante a pré-renderização estática
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
