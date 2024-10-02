import { ObjectId } from 'mongodb';
import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    try {
      const redisUserId = await redisClient.get(`auth_${token}`); // Renamed here
      if (!redisUserId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const {
        name,
        type,
        parentId,
        isPublic,
        data, // Make sure to include 'data' in the destructuring
      } = req.body;

      // Validate name and type
      if (!name) return res.status(400).json({ error: 'Missing name' });
      if (!['folder', 'file', 'image'].includes(type)) {
        return res.status(400).json({ error: 'Missing type' });
      }
      if (type !== 'folder' && !data) {
        return res.status(400).json({ error: 'Missing data' });
      }

      // Handle parentId if provided
      if (parentId !== 0) {
        const parentFile = await dbClient.db.collection('files').findOne({ _id: ObjectId(parentId) });
        if (!parentFile) {
          return res.status(400).json({ error: 'Parent not found' });
        }
        if (parentFile.type !== 'folder') {
          return res.status(400).json({ error: 'Parent is not a folder' });
        }
      }

      const fileDocument = {
        userId: ObjectId(redisUserId), // Use the renamed variable
        name,
        type,
        isPublic,
        parentId: parentId === 0 ? 0 : ObjectId(parentId),
      };

      // Handle file and image types
      if (type === 'file' || type === 'image') {
        const FOLDER_PATH = process.env.FOLDER_PATH || '/tmp/files_manager';
        if (!fs.existsSync(FOLDER_PATH)) {
          fs.mkdirSync(FOLDER_PATH, { recursive: true });
        }

        const fileUUID = uuidv4();
        const localPath = path.join(FOLDER_PATH, fileUUID);
        fs.writeFileSync(localPath, Buffer.from(data, 'base64'));
        fileDocument.localPath = localPath;
      }

      // Insert file document into database
      const result = await dbClient.db.collection('files').insertOne(fileDocument);

      return res.status(201).json({
        id: result.insertedId,
        userId: redisUserId, // Adjusted here
        name,
        type,
        isPublic,
        parentId,
        localPath: fileDocument.localPath || null,
      });
    } catch (error) {
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  }
}

export default FilesController;
