const express = require('express');
const routes = require('./routes/index');
const redisClient = require('./utils/redis');
const dbClient = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());

app.use('/', routes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
