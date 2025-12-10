/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/core"],
  assetPrefix: "/crm",
}

module.exports = nextConfig

