import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Linting and type errors are owned by the repo tools (turbo lint / turbo typecheck),
  // so Next's embedded runners are disabled to avoid duplicate, conflicting runs.
  typescript: {
    ignoreBuildErrors: true,
  },
}

export default nextConfig
