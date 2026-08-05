const express = require("express");

const weatherController = require(
  "../controllers/weatherController"
);

const router = express.Router();

// GET /api/weather?lat=...&lng=...
router.get(
  "/",
  weatherController.getWeather
);

module.exports = router;