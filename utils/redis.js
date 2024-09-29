import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create the Redis client and connect to the server
    this.client = createClient();
    
    // Handle Redis connection errors
    this.client.on('error', (err) => {
      console.error(`Redis client not connected to the server: ${err}`);
    });

    // Promisify the Redis methods for asynchronous use
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  /**
   * Check if the Redis client is alive and connected
   * @returns {boolean} True if the connection is successful, False otherwise
   */
  isAlive() {
    return this.client.connected;
  }

  /**
   * Get the value of a key from Redis
   * @param {string} key The key to retrieve from Redis
   * @returns {Promise<string | null>} The value associated with the key, or null if not found
   */
  async get(key) {
    const value = await this.getAsync(key);
    return value;
  }

  /**
   * Set a key-value pair in Redis with an expiration time
   * @param {string} key The key to store
   * @param {string | number} value The value to store
   * @param {number} duration Expiration time in seconds
   */
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  /**
   * Delete a key from Redis
   * @param {string} key The key to delete from Redis
   */
  async del(key) {
    await this.delAsync(key);
  }
}

// Export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;
