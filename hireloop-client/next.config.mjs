/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  async rewrites() {
    return [
      {
        source: "/api/companies/:path*",
        destination: "http://localhost:5000/api/companies/:path*",
      },
      {
        source: "/api/companies",
        destination: "http://localhost:5000/api/companies",
      },
      {
        source: "/api/jobs/:path*",
        destination: "http://localhost:5000/api/jobs/:path*",
      },
      {
        source: "/api/jobs",
        destination: "http://localhost:5000/api/jobs",
      },
    ];
  },
};

export default nextConfig;
