const { MongoClient } = require('mongodb');

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';

    const url = `mongodb://${host}:${port}`;

    this.dbName = database;

    this.client = new MongoClient(url, { useUnifiedTopology: true });

    this.client.connect().catch((err) => {
      console.error(`MongoDB connection error: ${err.message}`);
    });
  }

  isAlive() {
    return this.client && this.client.isConnected();
  }

  async getDatabase() {
    return this.client.db(this.dbName);
  }

  async nbUsers() {
    const db = await this.getDatabase();
    return db.collection('users').countDocuments();
  }

  async nbFiles() {
    const db = await this.getDatabase();
    return db.collection('files').countDocuments();
  }
}

const dbClient = new DBClient();
module.exports = dbClient;
