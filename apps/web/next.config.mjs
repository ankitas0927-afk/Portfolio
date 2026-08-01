/** @type {import('next').NextConfig} */
const apiUrl = new URL(process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000/api/v1");

const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["@ankita-portfolio/config", "@ankita-portfolio/shared-types", "@ankita-portfolio/validation"],
  experimental: {
    typedRoutes: true
  },
  images: {
    remotePatterns: [
      {
        protocol: apiUrl.protocol.replace(":", ""),
        hostname: apiUrl.hostname,
        ...(apiUrl.port ? { port: apiUrl.port } : {}),
        pathname: "/api/v1/media/**"
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "5000",
        pathname: "/api/v1/media/**"
      }
    ]
  }
};

export default nextConfig;
