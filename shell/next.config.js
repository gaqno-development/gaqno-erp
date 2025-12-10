/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Enable standalone output for Docker
  transpilePackages: ["@repo/ui", "@repo/core"],
  async rewrites() {
    // Use environment variables for service URLs (Coolify internal network)
    // Falls back to localhost for local development
    const AUTH_URL = process.env.AUTH_SERVICE_URL || 'http://localhost:3001';
    const ADMIN_URL = process.env.ADMIN_SERVICE_URL || 'http://localhost:3002';
    const AI_URL = process.env.AI_SERVICE_URL || 'http://localhost:3003';
    const CRM_URL = process.env.CRM_SERVICE_URL || 'http://localhost:3004';
    const ERP_URL = process.env.ERP_SERVICE_URL || 'http://localhost:3005';
    const FINANCE_URL = process.env.FINANCE_SERVICE_URL || 'http://localhost:3006';
    const PLATFORM_URL = process.env.PLATFORM_SERVICE_URL || 'http://localhost:3007';
    const PDV_URL = process.env.PDV_SERVICE_URL || 'http://localhost:3008';

    return [
      {
        source: "/login",
        destination: `${AUTH_URL}/login`,
      },
      {
        source: "/register",
        destination: `${AUTH_URL}/register`,
      },
      // App Asset Rewrites
      {
        source: "/auth/_next/:path*",
        destination: `${AUTH_URL}/_next/:path*`,
      },
      {
        source: "/admin/_next/:path*",
        destination: `${ADMIN_URL}/_next/:path*`,
      },
      {
        source: "/books/_next/:path*",
        destination: `${AI_URL}/_next/:path*`,
      },
      {
        source: "/crm/_next/:path*",
        destination: `${CRM_URL}/_next/:path*`,
      },
      {
        source: "/erp/_next/:path*",
        destination: `${ERP_URL}/_next/:path*`,
      },
      {
        source: "/finance/_next/:path*",
        destination: `${FINANCE_URL}/_next/:path*`,
      },
      {
        source: "/dashboard/_next/:path*",
        destination: `${PLATFORM_URL}/_next/:path*`,
      },
      {
        source: "/pdv/_next/:path*",
        destination: `${PDV_URL}/_next/:path*`,
      },
      // Page Rewrites (Order matters!)
      {
        source: "/admin",
        destination: `${ADMIN_URL}/admin`,
      },
      {
        source: "/admin/:path*",
        destination: `${ADMIN_URL}/admin/:path*`,
      },
      {
        source: "/dashboard/admin/:path*",
        destination: `${ADMIN_URL}/dashboard/admin/:path*`,
      },
      {
        source: "/dashboard/books/:path*",
        destination: `${AI_URL}/dashboard/books/:path*`,
      },
      {
        source: "/dashboard/crm/:path*",
        destination: `${CRM_URL}/dashboard/crm/:path*`,
      },
      {
        source: "/dashboard/erp/:path*",
        destination: `${ERP_URL}/dashboard/erp/:path*`,
      },
      {
        source: "/dashboard/finance/:path*",
        destination: `${FINANCE_URL}/dashboard/finance/:path*`,
      },
      {
        source: "/pdv/:path*",
        destination: `${PDV_URL}/pdv/:path*`,
      },
      // Platform (Fallback for dashboard)
      {
        source: "/dashboard",
        destination: `${PLATFORM_URL}/dashboard`,
      },
      {
        source: "/dashboard/:path*",
        destination: `${PLATFORM_URL}/dashboard/:path*`,
      },
    ];
  },
};

module.exports = nextConfig;
