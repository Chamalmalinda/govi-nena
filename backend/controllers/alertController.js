const Alert = require('../models/Alert');


exports.getAlerts = async (req, res) => {
  const { lat, lng, radius } = req.query;

  if (!lat || !lng) {
    return res.status(400).json({ message: 'Please provide lat and lng query parameters' });
  }

  try {
    const searchRadius = radius ? parseInt(radius) * 1000 : 10000; 

    const alerts = await Alert.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(lng), parseFloat(lat)]
          },
          $maxDistance: searchRadius
        }
      }
    });

    res.json(alerts);
  } catch (err) {
    console.error('Get Alerts Error:', err.message);
    res.status(500).json({ message: 'Server error fetching alerts' });
  }
};


exports.createAlert = async (req, res) => {
  const { title, message, disease, crop, coordinates, radiusKm } = req.body;

  if (!title || !message || !disease || !crop || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({ message: 'Please provide title, message, disease, crop, and coordinates [lng, lat]' });
  }

  try {
    const alert = new Alert({
      title,
      message,
      disease,
      crop,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])]
      },
      radiusKm: radiusKm || 5
    });

    await alert.save();
    res.status(201).json(alert);
  } catch (err) {
    console.error('Create Alert Error:', err.message);
    res.status(500).json({ message: 'Server error creating alert' });
  }
};
