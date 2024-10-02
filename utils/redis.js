// utils/redis.js
import { createClient } from 'redis';

class RedisClient {
    constructor() {
        // Create a Redis client
        this.client = createClient();

        // Log any errors to the console
        this.client.on('error', (err) => {
            console.error('Redis Client Error:', err);
        });

        // Check if using Redis v4 or v3
        if (typeof this.client.connect === 'function') {
            // Connect to the Redis server (for v4)
            this.client.connect()
                .catch((err) => {
                    console.error('Failed to connect to Redis:', err);
                });
        } else {
            // Handle any initialization for Redis v3 if necessary
            console.log('Using Redis v3 - no need to connect explicitly');
        }
    }

    // Check if the connection to Redis is alive
    isAlive() {
        return this.client.isOpen;
    }

    // Asynchronously get a value from Redis by key
    async get(key) {
        try {
            const value = await this.client.get(key);
            return value;
        } catch (err) {
            console.error('Error getting value from Redis:', err);
            return null;
        }
    }

    // Asynchronously set a value in Redis with expiration
    async set(key, value, duration) {
        try {
            await this.client.set(key, value, {
                EX: duration,
            });
        } catch (err) {
            console.error('Error setting value in Redis:', err);
        }
    }

    // Asynchronously delete a value in Redis by key
    async del(key) {
        try {
            await this.client.del(key);
        } catch (err) {
            console.error('Error deleting value from Redis:', err);
        }
    }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
