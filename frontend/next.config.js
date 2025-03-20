/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true
  },
  experimental: {
    appDir: true
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*/',
        destination: 'http://127.0.0.1:8000/api/:path*/'
      },
      {
        source: '/api/:path*',
        destination: 'http://127.0.0.1:8000/api/:path*'
      }
    ]
  }
}

module.exports = nextConfig