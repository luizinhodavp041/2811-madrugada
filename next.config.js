/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Remove serverActions e serverComponents pois agora são padrão
  },
  images: {
    domains: ["res.cloudinary.com"], // Se você estiver usando Cloudinary
  },
  experimental: {
    serverMinification: false,
  },
};

module.exports = nextConfig;
