/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    domains: ["res.cloudinary.com"],
  },
  experimental: {
    serverActions: true,
    serverComponentsExternalPackages: ["puppeteer-core"],
  },
};

module.exports = nextConfig;
