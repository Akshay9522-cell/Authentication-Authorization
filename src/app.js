const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const errorMiddleware = require('./middleware/errorMiddleware');
const notFoundMiddleware = require('./middleware/notFoundMiddleware');
const app = express();
const authRoutes = require('./routes/authRoutes');

app.use(helmet());
app.use(errorMiddleware);
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN,
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ShopSphere API is running',
  });
});
app.use('/api/auth', authRoutes);

app.use(notFoundMiddleware);

app.use(errorMiddleware);
module.exports = app;