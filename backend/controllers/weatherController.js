const axios = require('axios');

// @route   GET /api/weather
// @desc    Proxy weather request to Open-Meteo & reverse geocode coords with Nominatim
// @access  Public
exports.getWeather = async (req, res) => {
  const { lat, lng } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Please provide lat and lng query parameters' });
  }

  try {
    // 1. Fetch weather metrics from Open-Meteo
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current_weather=true&hourly=relative_humidity_2m`;
    const response = await axios.get(url);
    const weatherData = response.data;
    const current = weatherData.current_weather;
    
    let humidity = '75%'; // Default fallback
    if (weatherData.hourly && weatherData.hourly.relative_humidity_2m) {
      const hourlyHumidities = weatherData.hourly.relative_humidity_2m;
      if (hourlyHumidities.length > 0) {
        humidity = `${hourlyHumidities[0]}%`;
      }
    }

    // 2. Fetch human-readable town/city name using OSM Nominatim Reverse Geocoding
    let locationName = 'Sri Lanka';
    try {
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`;
      const geoResponse = await axios.get(geoUrl, {
        headers: {
          'User-Agent': 'GoviNenaBackend/1.0'
        },
        timeout: 3000 // 3 seconds timeout to prevent hanging requests
      });
      if (geoResponse.data && geoResponse.data.address) {
        const address = geoResponse.data.address;
        locationName = address.city || address.town || address.village || address.suburb || address.county || address.state || 'Sri Lanka';
      }
    } catch (geoErr) {
      console.warn('Nominatim reverse geocoding failed, falling back to default:', geoErr.message);
    }

    res.json({
      temperature: `${current.temperature}°C`,
      windSpeed: `${current.windspeed} km/h`,
      humidity: humidity,
      locationName: locationName,
      weatherCode: current.weathercode,
      timestamp: current.time
    });

  } catch (err) {
    console.error('Weather Proxy Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving weather forecast data' });
  }
};
