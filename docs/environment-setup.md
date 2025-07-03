# Environment Variables Setup Guide

This document contains all required environment variables for the YesNoMaybe project.

## Required Environment Variables

Create a `.env.local` file in your project root with the following variables:

```bash
# =================================
# SUPABASE CONFIGURATION (REQUIRED)
# =================================

# Your Supabase project URL
# Get from: https://supabase.com/dashboard -> Settings -> API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co

# Supabase anon/public key (safe to expose to client)
# Get from: https://supabase.com/dashboard -> Settings -> API
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here

# Supabase service role key (NEVER expose to client)
# Get from: https://supabase.com/dashboard -> Settings -> API
# Used for admin operations and bypassing RLS
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =================================
# NEXT.JS CONFIGURATION
# =================================

# Environment (development, staging, production)
NODE_ENV=development

# App URL (used for callbacks and CORS)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# =================================
# SECURITY & AUTHENTICATION
# =================================

# JWT secret for additional security (optional)
NEXTAUTH_SECRET=your_jwt_secret_here_min_32_chars

# Rate limiting configuration
RATE_LIMIT_ENABLED=true
RATE_LIMIT_REDIS_URL=redis://localhost:6379

# =================================
# DATABASE CONFIGURATION
# =================================

# Database URL (if using external Postgres instead of Supabase)
DATABASE_URL=postgresql://username:password@localhost:5432/yesnomaybe

# Connection pool settings
DB_POOL_MIN=2
DB_POOL_MAX=10

# =================================
# EXTERNAL SERVICES (OPTIONAL)
# =================================

# Error monitoring (Sentry)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id
SENTRY_ORG=your-org
SENTRY_PROJECT=yesnomaybe

# Analytics (if using external analytics)
GOOGLE_ANALYTICS_ID=G-XXXXXXXXXX

# =================================
# REDIS CONFIGURATION (PRODUCTION)
# =================================

# Redis URL for rate limiting and caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your_redis_password

# =================================
# MONITORING & LOGGING
# =================================

# Log level (error, warn, info, debug)
LOG_LEVEL=info

# Performance monitoring
VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# =================================
# FEATURE FLAGS
# =================================

# Enable/disable specific features
FEATURE_REAL_TIME_UPDATES=true
FEATURE_ADVANCED_ANALYTICS=true
FEATURE_ADMIN_PANEL=true
FEATURE_MARKET_MAKING=false
```

## Setup Instructions

### 1. Development Setup
```bash
# Copy the template
cp docs/environment-setup.md .env.local

# Edit the file with your actual values
nano .env.local
```

### 2. Production Checklist
- [ ] Set `NODE_ENV=production`
- [ ] Update `NEXT_PUBLIC_APP_URL` to your domain
- [ ] Enable `REDIS_URL` for rate limiting
- [ ] Set up `SENTRY_DSN` for error monitoring
- [ ] Configure proper feature flags
- [ ] Set secure JWT secrets (min 32 characters)
- [ ] Test all integrations in staging first

### 3. Supabase Setup
1. Create a new project at [supabase.com](https://supabase.com)
2. Go to Settings → API
3. Copy the URL and anon key to your `.env.local`
4. Copy the service role key (keep this secret!)

### 4. Security Notes
- Never commit `.env.local` to git
- Service role key should never be exposed to client
- Use different keys for staging and production
- Rotate keys regularly in production

### 5. Optional Services

#### Error Monitoring (Sentry)
```bash
npm install @sentry/nextjs
```

#### Redis (for production rate limiting)
```bash
# Local development
docker run -d -p 6379:6379 redis:alpine

# Or use Redis Cloud for production
```

### 6. Environment-Specific Files
- `.env.local` - Local development (ignored by git)
- `.env.development` - Development defaults
- `.env.staging` - Staging environment
- `.env.production` - Production environment (never commit)

## Troubleshooting

### Common Issues
1. **Supabase connection failed**: Check URL and keys
2. **Rate limiting not working**: Ensure Redis is running
3. **Auth issues**: Verify service role key
4. **CORS errors**: Check `NEXT_PUBLIC_APP_URL`

### Validation Script
Create a script to validate your environment:

```javascript
// scripts/validate-env.js
const requiredVars = [
  'NEXT_PUBLIC_SUPABASE_URL',
  'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  'SUPABASE_SERVICE_ROLE_KEY'
];

requiredVars.forEach(varName => {
  if (!process.env[varName]) {
    console.error(`❌ Missing required environment variable: ${varName}`);
    process.exit(1);
  }
});

console.log('✅ All required environment variables are set');
```

Run with: `node scripts/validate-env.js` 