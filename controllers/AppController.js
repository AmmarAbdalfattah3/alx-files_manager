import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    const redisAlive = redisClient.isAlive();
    const dbAlive = dbClient.isAlive();

    return res.status(200).json({ redis: redisAlive, db: dbAlive });
  }

  static async getStats(req, res) {
    try {
      const usersCount = await dbClient.nbUsers();
      const filesCount = await dbClient.nbFiles();

      return res.status(200).json({ users: usersCount, files: filesCount });
    } catch (error) {
      console.error('Error retrieving stats:', error);
      return res.status(500).json({ error: 'Unable to retrieve stats' });
    }
  }
}

export default AppController;
