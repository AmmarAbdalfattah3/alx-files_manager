const express = require('express');
const routes = require('./routes/index');
const redisClient = require('./utils/redis.js');
const dbClient = require('./utils/db.js');

const app = express();

const port = process.env.PORT || 5000;

app.use('/', routes);

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
