import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: false, // Enable type checking for better code quality
  },
  eslint: {
    ignoreDuringBuilds: false, // Enable linting for better code quality
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // For Google user avatars
        port: '',
        pathname: '/**',
      }
    ],
  },
  // Optimize for production builds
  experimental: {
    optimizePackageImports: ['@genkit-ai/core', '@genkit-ai/ai'],
  },
  // Handle webpack configuration for better builds
  webpack: (config, { isServer }) => {
    // Ignore certain modules during build that cause issues
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Handle handlebars and other problematic modules
    config.module.rules.push({
      test: /\.handlebars$/,
      loader: 'ignore-loader'
    });

    return config;
  },
};

export default nextConfig;
