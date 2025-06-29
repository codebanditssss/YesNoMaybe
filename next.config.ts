import { NextConfig } from 'next'

const config: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_LOG_LEVEL: 'error',
    SUPABASE_AUTH_DEBUG: 'false',
    GOTRUE_DISABLE_DEBUG_LOGGING: 'true'
  },
  images: {
    domains: ['localhost']
  }
}

export default config 