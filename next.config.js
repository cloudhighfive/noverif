/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['localhost'],
  },
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      // Add any polyfills or additional aliases if needed
    };
    return config;
  },
};

module.exports = nextConfig;