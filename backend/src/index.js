const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const filterRoutes = require('./routes/filterRoutes');
const config = require('./config');
require('dotenv').config();

const app = express();

// Middleware
app.use(express.json());
app.use(cors({
  origin: config.corsOrigin,
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
}));
app.use(morgan('dev'));

// Routes
app.use('/api', filterRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the API' });
});

// Sample API endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error'
  });
});

// Start server
app.listen(config.port, () => {
  console.log(`Server is running on port ${config.port} in ${config.nodeEnv} mode`);
}); 