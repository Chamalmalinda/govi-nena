const axios = require("axios");

function parseUtcTimestamp(timeString) {
  if (!timeString || typeof timeString !== "string") {
    return null;
  }

  const normalizedTime = timeString.endsWith("Z")
    ? timeString
    : `${timeString}Z`;

  const timestamp = new Date(normalizedTime).getTime();

  return Number.isNaN(timestamp) ? null : timestamp;
}


function findClosestHourlyValue(
  hourlyTimes,
  hourlyValues,
  targetTime
) {
  if (
    !Array.isArray(hourlyTimes) ||
    !Array.isArray(hourlyValues) ||
    hourlyTimes.length === 0 ||
    hourlyValues.length === 0
  ) {
    return {
      value: null,
      time: null,
      index: -1,
    };
  }

  const targetTimestamp =
    parseUtcTimestamp(targetTime) || Date.now();

  let closestIndex = -1;
  let smallestDifference = Infinity;

  hourlyTimes.forEach((hourlyTime, index) => {
    const hourlyTimestamp =
      parseUtcTimestamp(hourlyTime);

    if (hourlyTimestamp === null) {
      return;
    }

    const difference = Math.abs(
      hourlyTimestamp - targetTimestamp
    );

    if (difference < smallestDifference) {
      smallestDifference = difference;
      closestIndex = index;
    }
  });

  if (
    closestIndex === -1 ||
    closestIndex >= hourlyValues.length
  ) {
    return {
      value: null,
      time: null,
      index: -1,
    };
  }

  return {
    value:
      hourlyValues[closestIndex] !== undefined
        ? hourlyValues[closestIndex]
        : null,

    time:
      hourlyTimes[closestIndex] || null,

    index: closestIndex,
  };
}

async function getLocationName(
  latitude,
  longitude
) {
  try {
    const geoResponse = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          format: "json",
          lat: latitude,
          lon: longitude,
          zoom: 12,
          addressdetails: 1,
        },

        headers: {
          "User-Agent": "GoviNenaBackend/1.0",
          Accept: "application/json",
        },

        timeout: 5000,
      }
    );

    const address =
      geoResponse.data?.address || {};
    return (
      address.city || address.town || address.village || address.suburb || address.county || address.state ||
      "Sri Lanka"
    );
  } catch (error) {
    console.warn(
      "Nominatim reverse geocoding failed:",
      error.message
    );

    return "Sri Lanka";
  }
}

exports.getWeather = async (req, res) => {
  const latitude = Number(req.query.lat);
  const longitude = Number(req.query.lng);

  if (
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return res.status(400).json({
      message:
        "Please provide valid lat and lng query parameters.",
    });
  }

  if (
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return res.status(400).json({
      message:
        "Latitude or longitude is outside the valid range.",
    });
  }

  try {

    const weatherResponse = await axios.get(
      "https://api.open-meteo.com/v1/forecast",
      {
        params: {
          latitude,
          longitude,
          current_weather: true,
          hourly: "relative_humidity_2m",
          timezone: "UTC",
          past_days: 1,
          forecast_days: 1,
        },

        timeout: 10000,
      }
    );

    const weatherData = weatherResponse.data;
    const currentWeather =
      weatherData.current_weather;

    if (!currentWeather) {
      return res.status(502).json({
        message:
          "The weather service did not return current weather data.",
      });
    }

    const humidityMatch =
      findClosestHourlyValue(
        weatherData.hourly?.time,
        weatherData.hourly
          ?.relative_humidity_2m,
        currentWeather.time
      );

    const locationName =
      await getLocationName(
        latitude,
        longitude
      );

    return res.status(200).json({
      temperature:
        currentWeather.temperature !== undefined &&
          currentWeather.temperature !== null
          ? `${Math.round(
            currentWeather.temperature
          )}°C`
          : null,

      windSpeed:
        currentWeather.windspeed !== undefined &&
          currentWeather.windspeed !== null
          ? `${Math.round(
            currentWeather.windspeed
          )} km/h`
          : null,

      humidity:
        humidityMatch.value !== null
          ? `${Math.round(
            humidityMatch.value
          )}%`
          : null,

      locationName,

      weatherCode:
        currentWeather.weathercode ?? null,

      coordinates: {
        latitude,
        longitude,
      },


      currentWeatherTime:
        currentWeather.time,

      humidityTime:
        humidityMatch.time,

      humidityHourlyIndex:
        humidityMatch.index,

      timezone: "UTC",

      timestamp:
        new Date().toISOString(),
    });
  } catch (error) {
    console.error(
      "Weather Proxy Error:",
      error.response?.data ||
      error.message
    );

    return res.status(500).json({
      message:
        "Server error retrieving weather forecast data.",
    });
  }
};