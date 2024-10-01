const sha1 = require('sha1');
const { ObjectId } = require('mongodb');
const dbClient = require('../utils/db');

class UsersController {
  static async postNew(req, res) {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Missing email' });
    }

    if (!password) {
      return res.status(400).json({ error: 'Missing password' });
    }

    const userExists = await dbClient.db.collection('users').findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'Already exist' });
    }

    const hashedPassword = sha1(password);

    const newUser = {
      email,
      password: hashedPassword,
    };

    try {
      const result = await dbClient.db.collection('users').insertOne(newUser);
      const userId = result.insertedId;

      return res.status(201).json({
        id: userId.toString(),
        email,
      });
    } catch (err) {
      console.error('Error inserting user:', err);
      return res.status(500).json({ error: 'Cannot insert user' });
    }
  }
}

module.exports = UsersController;
