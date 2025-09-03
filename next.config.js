/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['@prisma/client', 'bcryptjs'],
  images: {
    domains: ['images.pexels.com']
  },
  outputFileTracingRoot: __dirname
}

module.exports = nextConfig