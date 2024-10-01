import dbClient from '../utils/db.js';
import crypto from 'crypto';

class UsersController {
    static async postNew(req, res) {
        const { email, password } = req.body;

        if (!email) {
            return res.status(400).json({ error: 'Missing email' });
        }
        if (!password) {
            return res.status(400).json({ error: 'Missing password' });
        }

        const existingUser = await dbClient.findUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'Already exist' });
        }

        const hashedPassword = crypto.createHash('sha1').update(password).digest('hex');
        const newUser = await dbClient.createUser(email, hashedPassword);

        res.status(201).json({ id: newUser._id, email: newUser.email });
    }
}

export default UsersController;
