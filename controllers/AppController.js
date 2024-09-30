const redisClient = require('../utils/redis');
const dbClient = require('../utils/db');

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    if (!redisAlive || !dbAlive) {
      return res.status(503).json({
        message: 'Service Unavailable',
        redis: redisAlive,
        db: dbAlive
      });
    }

    return res.status(200).json({
      message: 'Services running smoothly',
      redis: redisAlive,
      db: dbAlive
    });
  }

  static async getStats(req, res) {
    try {
      const [users, files] = await Promise.all([
        dbClient.nbUsers(),
        dbClient.nbFiles()
      ]);

      return res.status(200).json({
        message: 'Stats successfully retrieved',
        users,
        files
      });
    } catch (error) {
      console.error('Error retrieving stats:', error);

      return res.status(500).json({
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = AppController;
