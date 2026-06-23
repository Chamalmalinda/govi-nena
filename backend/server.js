require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();

// Connect to Database
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Base Route / Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'UP',
    database: 'CONNECTED',
    timestamp: new Date()
  });
});

// Setup Port
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
