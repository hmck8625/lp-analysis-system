/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true, // Vercel最適化
  },
  async rewrites() {
    // プロダクション環境でAPI URLが設定されていない場合はrewriteを無効化
    if (process.env.NODE_ENV === 'production' && !process.env.NEXT_PUBLIC_API_URL) {
      console.warn('NEXT_PUBLIC_API_URL is not set in production. API rewrites disabled.');
      return [];
    }
    
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    
    return [
      {
        source: '/api/:path*',
        destination: `${apiUrl}/api/:path*`,
      },
    ];
  },
  // Vercel deployment optimization
  output: 'standalone',
};

module.exports = nextConfig;