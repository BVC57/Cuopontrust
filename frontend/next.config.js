/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    isolatedDevBuild: true
  },
  webpack: (config, { dev }) => {
    if (dev) {
      // OneDrive and Windows file indexing can lock webpack cache artifacts.
      // Disabling filesystem cache in dev avoids repeated EPERM/UNKNOWN errors.
      config.cache = false;
    }

    return config;
  }
};

module.exports = nextConfig;
