/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/core"],
  assetPrefix: "/dashboard", // For static assets
}

module.exports = nextConfig

