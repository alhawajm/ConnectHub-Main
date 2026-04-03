/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow images from any HTTPS source (avatars, logos etc)
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
