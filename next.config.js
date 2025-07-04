/** @type {import('next').NextConfig} */
const config = {
  env: {
    NEXT_PUBLIC_SUPABASE_LOG_LEVEL: 'error',
    SUPABASE_AUTH_DEBUG: 'false',
    GOTRUE_DISABLE_DEBUG_LOGGING: 'true'
  },
  images: {
    domains: ['localhost']
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
  serverExternalPackages: ['pg']
}

module.exports = config 