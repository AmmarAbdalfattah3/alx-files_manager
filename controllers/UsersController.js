import dbClient from '../utils/db.js';
import crypto from 'crypto';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) return res.status(400).json({ error: 'Missing email' });
        if (!password) return res.status(400).json({ error: 'Missing password' });

        const user = await dbClient.findUserByEmail(email);
        if (user) return res.status(400).json({ error: 'Already exist' });

        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        const result = await dbClient.db.collection('users').insertOne({ email, password: hashedPassword });

        return res.status(201).json({ id: result.insertedId, email });
    }
}

export default UsersController;
