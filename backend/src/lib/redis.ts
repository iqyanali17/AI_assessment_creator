import Redis from 'ioredis';
import { env } from '@/config/config';

const redisOptions: any = {
  maxRetriesPerRequest: null, // Required for BullMQ
  retryStrategy(times: number) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
};

// If using a secure connection (rediss://), ensure TLS is handled
if (env.REDIS_URL.startsWith('rediss://')) {
  redisOptions.tls = {
    rejectUnauthorized: false, // Useful for many managed Redis providers
  };
}

const redisClient = new Redis(env.REDIS_URL, redisOptions);

let lastErrorLog = 0;
redisClient.on('error', (err) => {
  const now = Date.now();
  // Throttle error logging to once every 10 seconds to avoid terminal flooding
  if (now - lastErrorLog > 10000) {
    console.error('❌ Redis Connection Error:', err.message);
    lastErrorLog = now;
  }
});

redisClient.on('connect', () => {
  if (process.env.NODE_ENV !== 'production') {
    console.log('Redis client connected');
  }
});

export default redisClient;
