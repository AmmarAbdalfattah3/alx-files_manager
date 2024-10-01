const express = require('express');
const routes = require('./routes/index.js');
const redisClient = require('./utils/redis.js');
const dbClient = require('./utils/db.js');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use((req, res, next) => {
  const status = {
    redis: redisClient.isAlive(),
    db: dbClient.isAlive(),
  };
  console.log("Redis and DB Status: ", status);
  next();
});

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
