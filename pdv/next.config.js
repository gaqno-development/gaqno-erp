/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@repo/ui", "@repo/core"],
  assetPrefix: "/pdv",
}

module.exports = nextConfig

