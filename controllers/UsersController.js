import sha1 from 'sha1';
import dbClient from '../utils/db.js';

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
}

export default UsersController;
