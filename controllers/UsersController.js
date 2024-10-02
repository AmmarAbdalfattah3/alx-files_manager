import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class UsersController {
  /**
   * Handles POST /users to create a new user.
   * Requires an email and a password.
   */
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Check if email is provided
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    // Check if password is provided
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    // Check if email already exists in the database
    const existingUser = await dbClient.db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'Already exist' });
    }

    // Hash the password using SHA1
    const hashedPassword = sha1(password);

    // Insert the new user into the users collection
    const newUser = {
      email,
      password: hashedPassword,
    };

    const result = await dbClient.db.collection('users').insertOne(newUser);

    // Return the new user's ID and email
    return res.status(201).json({
      id: result.insertedId,
      email: newUser.email,
    });
  }

  /**
   * GET /users/me - Get the current user based on token
   */
  static async getMe(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const userId = await redisClient.get(`auth_${token}`);
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // Find user by ID in the database
    const user = await dbClient.db.collection('users').findOne({ _id: dbClient.getObjectId(userId) });
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    return res.status(200).json({ id: user._id, email: user.email });
  }
}

export default UsersController;
