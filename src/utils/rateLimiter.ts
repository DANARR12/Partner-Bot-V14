import Redis from 'ioredis';
import { config } from '../config.js';

class RateLimiter {
  private redis: Redis | null = null;
  private memoryStore: Map<string, { count: number; resetTime: number }> = new Map();

  constructor() {
    if (config.redis.url) {
      this.redis = new Redis(config.redis.url);
      this.redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        this.redis = null;
      });
    }
  }

  async increment(key: string, windowMs: number): Promise<{ count: number; resetTime: number }> {
    const now = Date.now();
    const resetTime = now + windowMs;

    if (this.redis) {
      // Use Redis for distributed rate limiting
      const multi = this.redis.multi();
      multi.incr(key);
      multi.expire(key, Math.ceil(windowMs / 1000));
      
      const results = await multi.exec();
      const count = results?.[0]?.[1] as number || 0;
      
      return { count, resetTime };
    } else {
      // Use in-memory store
      const existing = this.memoryStore.get(key);
      if (!existing || now > existing.resetTime) {
        this.memoryStore.set(key, { count: 1, resetTime });
        return { count: 1, resetTime };
      }
      
      existing.count++;
      return { count: existing.count, resetTime: existing.resetTime };
    }
  }

  async get(key: string): Promise<number> {
    if (this.redis) {
      const count = await this.redis.get(key);
      return count ? parseInt(count) : 0;
    } else {
      const existing = this.memoryStore.get(key);
      if (!existing || Date.now() > existing.resetTime) {
        return 0;
      }
      return existing.count;
    }
  }

  async reset(key: string): Promise<void> {
    if (this.redis) {
      await this.redis.del(key);
    } else {
      this.memoryStore.delete(key);
    }
  }

  async cleanup(): Promise<void> {
    if (!this.redis) {
      const now = Date.now();
      for (const [key, value] of this.memoryStore.entries()) {
        if (now > value.resetTime) {
          this.memoryStore.delete(key);
        }
      }
    }
  }
}

export const rateLimiter = new RateLimiter();