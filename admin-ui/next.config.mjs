/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async rewrites() {
    const bffBaseUrl = (process.env.BFF_BASE_URL || 'http://localhost:8001').replace(/\/+$/, '');
    return [
      {
        source: '/api/:path*',
        destination: `${bffBaseUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
