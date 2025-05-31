import { createClient, RedisClientType } from 'redis';
import config from '../config';
import logger from '../utils/logger';

class CacheService {
  private client: RedisClientType;
  private static instance: CacheService;
  private isConnected: boolean = false;

  private constructor() {
    this.client = createClient({
      url: `redis://${config.redis.password ? `:${config.redis.password}@` : ''}${config.redis.host}:${config.redis.port}`,
    });

    this.client.on('error', (err) => {
      logger.error('Redis error:', err);
      this.isConnected = false;
    });

    this.client.on('connect', () => {
      logger.info('Connected to Redis');
      this.isConnected = true;
    });

    this.client.on('end', () => {
      logger.info('Disconnected from Redis');
      this.isConnected = false;
    });
  }

  public static getInstance(): CacheService {
    if (!CacheService.instance) {
      CacheService.instance = new CacheService();
    }
    return CacheService.instance;
  }

  public async connect(): Promise<void> {
    if (!this.isConnected) {
      try {
        await this.client.connect();
      } catch (error) {
        logger.error('Failed to connect to Redis:', error);
        throw error;
      }
    }
  }

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.client.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      logger.error('Error getting data from Redis:', error);
      return null;
    }
  }

  public async set(key: string, value: any, expireSeconds?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (expireSeconds) {
        await this.client.setEx(key, expireSeconds, stringValue);
      } else {
        await this.client.set(key, stringValue);
      }
    } catch (error) {
      logger.error('Error setting data in Redis:', error);
    }
  }

  public async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error('Error deleting key from Redis:', error);
    }
  }

  public async clearCache(): Promise<void> {
    try {
      await this.client.flushAll();
      logger.info('Redis cache cleared');
    } catch (error) {
      logger.error('Error clearing Redis cache:', error);
    }
  }

  public async disconnect(): Promise<void> {
    if (this.isConnected) {
      try {
        await this.client.quit();
        logger.info('Disconnected from Redis');
      } catch (error) {
        logger.error('Error disconnecting from Redis:', error);
      }
    }
  }

  // Helper method to generate cache key for todo items
  public static getTodoCacheKey(todoId: number): string {
    return `todo:${todoId}`;
  }

  // Helper method to generate cache key for user's todos
  public static getUserTodosCacheKey(userId: number): string {
    return `user:${userId}:todos`;
  }
}

export default CacheService; 