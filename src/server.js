require('dotenv').config();

const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

async function startServer() {
  await connectDB();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ShopSphere API running on port ${PORT}`);
  });
}

startServer();