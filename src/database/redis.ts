import { Redis as RedisClient } from 'ioredis';
import { config } from '../config/index.js';

let redis: RedisClient | null = null;

export function getRedis(): RedisClient {
  if (!redis) {
    redis = new RedisClient(config.redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });

    redis.on('error', (err: Error) => {
      console.error('[Redis] Connection error:', err.message);
    });
  }
  return redis;
}

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = getRedis();
    const data = await client.get(key);
    return data ? (JSON.parse(data) as T) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key: string, value: unknown, ttlSeconds = 300): Promise<void> {
  try {
    const client = getRedis();
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // Cache failures should not break the app
  }
}

export async function cacheDel(pattern: string): Promise<void> {
  try {
    const client = getRedis();
    const keys = await client.keys(pattern);
    if (keys.length > 0) {
      await client.del(...keys);
    }
  } catch {
    // ignore
  }
}

export async function connectRedis(): Promise<void> {
  try {
    await getRedis().connect();
    console.log('[Redis] Connected');
  } catch {
    console.warn('[Redis] Not available, running without cache');
  }
}
