const Redis = require('ioredis');
require('dotenv').config({ path: '.env.local' });

async function testRedisConnection() {
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.error('❌ No Redis URL configured. Please set REDIS_URL in .env.local');
    process.exit(1);
  }

  // Validate URL format
  try {
    const url = new URL(redisUrl);
    console.log('URL validation:');
    console.log('- Protocol:', url.protocol, '(should be rediss:)');
    console.log('- Host:', url.hostname, '(should be glorious-egret-17490.upstash.io)');
    console.log('- Port:', url.port, '(should be 6379)');
    console.log('- Username:', url.username, '(should be default)');
    console.log('- Password:', url.password ? '********' : 'missing');
  } catch (error) {
    console.error('❌ Invalid Redis URL format:', error.message);
    console.log('Expected format: rediss://default:password@glorious-egret-17490.upstash.io:6379');
    process.exit(1);
  }

  const redis = new Redis(redisUrl, {
    tls: {
      rejectUnauthorized: false
    },
    maxRetriesPerRequest: 2,
    retryStrategy: (times) => {
      if (times > 3) {
        console.error('❌ Redis connection failed after 3 retries');
        return null;
      }
      return Math.min(times * 100, 3000);
    }
  });

  // Add error event handler
  redis.on('error', (error) => {
    console.error('Redis error:', error.message);
    if (error.message.includes('ENOENT')) {
      console.error('This usually means the URL format is incorrect or contains invalid characters');
    }
  });

  try {
    console.log('Attempting to connect to Redis...');
    
    // Test basic operations
    await redis.set('test_key', 'test_value');
    const value = await redis.get('test_key');
    await redis.del('test_key');

    if (value === 'test_value') {
      console.log('✅ Redis connection successful!');
      console.log('✅ Basic operations (SET/GET/DEL) working');
    } else {
      throw new Error('Redis operations failed');
    }

    // Test rate limiter specific operations
    const testKey = 'rate_limit_test:127.0.0.1';
    await redis.multi()
      .incr(testKey)
      .expire(testKey, 60)
      .exec();

    console.log('✅ Rate limiter operations working');
    
    // Cleanup
    await redis.del(testKey);
    
  } catch (error) {
    console.error('❌ Redis test failed:', error.message);
    process.exit(1);
  } finally {
    redis.disconnect();
  }
}

testRedisConnection().catch(console.error); 