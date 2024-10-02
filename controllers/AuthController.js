import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class AuthController {
  /**
   * GET /connect - Sign in a user by generating a token
   */
  static async getConnect(req, res) {
    const authHeader = req.header('Authorization') || '';
    const base64Credentials = authHeader.split(' ')[1] || '';
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const hashedPassword = sha1(password);
    const user = await dbClient.db.collection('users').findOne({ email, password: hashedPassword });

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Generate a token and store it in Redis for 24 hours
    const token = uuidv4();
    const key = `auth_${token}`;
    await redisClient.set(key, String(user._id), 24 * 60 * 60);

    return res.status(200).json({ token });
  }

  /**
   * GET /disconnect - Sign out a user by invalidating the token
   */
  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Remove the token from Redis
    await redisClient.del(key);
    return res.status(204).send();
  }
}

export default AuthController;
