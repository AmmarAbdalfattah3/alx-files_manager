const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const postUpload = async (req, res) => {
  const userId = req.user.id;
  const { name, type, parentId, isPublic = false, data } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Missing name' });
  }

  if (!type || !['folder', 'file', 'image'].includes(type)) {
    return res.status(400).json({ error: 'Missing type' });
  }

  if (type !== 'folder' && !data) {
    return res.status(400).json({ error: 'Missing data' });
  }

  if (parentId) {
    const parentFile = await File.findById(parentId);
    if (!parentFile) {
      return res.status(400).json({ error: 'Parent not found' });
    }
    if (parentFile.type !== 'folder') {
      return res.status(400).json({ error: 'Parent is not a folder' });
    }
  }

  const fileData = {
    userId,
    name,
    type,
    isPublic,
    parentId: parentId || null,
  };

  if (type === 'folder') {
    const newFile = await File.create(fileData);
    return res.status(201).json(newFile);
  }

  const folderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }

  const filePath = path.join(folderPath, `${uuidv4()}`);
  fs.writeFileSync(filePath, Buffer.from(data, 'base64'));

  fileData.localPath = filePath;
  const newFile = await File.create(fileData);
  return res.status(201).json(newFile);
};

module.exports = { postUpload };
