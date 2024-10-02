import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';
import fs from 'fs';
import { promisify } from 'util';

const writeFileAsync = promisify(fs.writeFile);

class FilesController {
    static async postUpload(req, res) {
        const token = req.headers['x-token'];
        const userId = await redisClient.get(`auth_${token}`);
        if (!userId) return res.status(401).json({ error: 'Unauthorized' });

        const { name, type, parentId, isPublic, data } = req.body;
        if (!name) return res.status(400).json({ error: 'Missing name' });
        if (!type || !['folder', 'file', 'image'].includes(type)) return res.status(400).json({ error: 'Missing type' });
        if (!data && type !== 'folder') return res.status(400).json({ error: 'Missing data' });

        const fileData = {
            userId,
            name,
            type,
            parentId: parentId || 0,
            isPublic: isPublic || false,
        };

        if (type === 'folder') {
            const result = await dbClient.db.collection('files').insertOne(fileData);
            return res.status(201).json({ id: result.insertedId, ...fileData });
        }

        const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const localPath = `${folderPath}/${uuidv4()}`;
        await writeFileAsync(localPath, Buffer.from(data, 'base64'));

        fileData.localPath = localPath;
        const result = await dbClient.db.collection('files').insertOne(fileData);
        res.status(201).json({ id: result.insertedId, ...fileData });
    }
}

export default FilesController;
