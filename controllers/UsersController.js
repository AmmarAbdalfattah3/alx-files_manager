import { createHash } from 'crypto';
import dbClient from '../utils/db';

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    try {
      // Check if email already exists
      const existingUser = await dbClient.client
        .db()
        .collection('users')
        .findOne({ email });

      if (existingUser) {
        return res.status(400).json({ error: 'Already exist' });
      }

      // Hash the password using SHA1
      const hashedPassword = createHash('sha1').update(password).digest('hex');

      // Create the new user object
      const newUser = {
        email,
        password: hashedPassword,
      };

      // Insert the new user into the database
      const result = await dbClient.client
        .db()
        .collection('users')
        .insertOne(newUser);

      // Return the new user info (only id and email)
      return res.status(201).json({
        id: result.insertedId,
        email: newUser.email,
      });
    } catch (err) {
      console.error('Error creating user:', err);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default UsersController;
