import { MongoClient } from 'mongodb';

class DBClient {
    constructor() {
        const host = process.env.DB_HOST || 'localhost';
        const port = process.env.DB_PORT || 27017;
        const database = process.env.DB_DATABASE || 'files_manager';
        this.client = new MongoClient(`mongodb://${host}:${port}`);
        this.db = null;

        this.client.connect()
            .then(() => {
                this.db = this.client.db(database);
                console.log(`Connected to database: ${database}`);
            })
            .catch((err) => {
                console.error('Database connection error:', err);
            });
    }

    isAlive() {
        return !!this.db;
    }

    async nbUsers() {
        return await this.db.collection('users').countDocuments();
    }

    async nbFiles() {
        return await this.db.collection('files').countDocuments();
    }
}

const dbClient = new DBClient();
export default dbClient;
