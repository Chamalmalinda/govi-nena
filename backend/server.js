require("dotenv").config();

const express = require("express");
const cors = require("cors");

const connectDB = require("./config/db");

const authRoutes = require("./routes/auth");
const outbreakRoutes = require(
  "./routes/outbreaks"
);
const alertRoutes = require(
  "./routes/alerts"
);
const weatherRoutes = require(
  "./routes/weather"
);
const ttsRoutes = require("./routes/tts");

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/auth", authRoutes);

app.use(
  "/api/outbreaks",
  outbreakRoutes
);

app.use("/api/alerts", alertRoutes);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use("/api/tts", ttsRoutes);

// Base route
app.get("/", (req, res) => {
  res.status(200).json({
    message:
      "Govi Nena backend is running.",
  });
});

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "UP",
    database: "CONNECTED",
    timestamp: new Date().toISOString(),
  });
});

// Handle unknown routes
app.use((req, res) => {
  res.status(404).json({
    message: "API route not found.",
  });
});

// General error handler
app.use((error, req, res, next) => {
  console.error(
    "Unhandled server error:",
    error
  );

  res.status(500).json({
    message:
      "An unexpected server error occurred.",
  });
});

const PORT =
  process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});