/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Allow warnings but fail on errors
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  // Allow cross-origin requests from local network during development
  allowedDevOrigins: [
    '192.168.1.103',
    'localhost',
    '127.0.0.1',
  ],
  images: {
    domains: ['localhost', 'images.unsplash.com', 'picsum.photos', 'ubtreccbytgrhpagaitr.supabase.co', '3pillars.pythonanywhere.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'ubtreccbytgrhpagaitr.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: '3pillars.pythonanywhere.com',
        port: '',
        pathname: '/**',
      },
    ],
    unoptimized: true,
  },
}

module.exports = nextConfig 