import express from 'express';
import routes from './routes/index';
import redisClient from './utils/redis';
import dbClient from './utils/db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
