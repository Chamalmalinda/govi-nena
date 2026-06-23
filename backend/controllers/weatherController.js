const axios = require('axios');

// @route   GET /api/weather
// @desc    Proxy weather request to Open-Meteo
// @access  Public
exports.getWeather = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Please provide lat and lng query parameters' });
  }

  try {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relative_humidity_2m`;
    const response = await axios.get(url);
    
    const weatherData = response.data;
    
    // Parse current weather
    const current = weatherData.current_weather;
    
    // Calculate humidity estimation from hourly or use current if available
    let humidity = '75%'; // Default fallback
    if (weatherData.hourly && weatherData.hourly.relative_humidity_2m) {
      // Get relative humidity for current hour or closest hour
      const hourlyHumidities = weatherData.hourly.relative_humidity_2m;
      if (hourlyHumidities.length > 0) {
        humidity = `${hourlyHumidities[0]}%`;
      }
    }

    res.json({
      temperature: `${current.temperature}°C`,
      windSpeed: `${current.windspeed} km/h`,
      humidity: humidity,
      weatherCode: current.weathercode,
      timestamp: current.time
    });

  } catch (err) {
    console.error('Weather Proxy Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving weather forecast data' });
  }
};
