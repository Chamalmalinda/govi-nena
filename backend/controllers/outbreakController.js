const Outbreak = require('../models/Outbreak');
const Alert = require('../models/Alert');
const axios = require('axios');

// Helper to format string properly for messages
const capitalize = (str) => {
  if (!str) return '';
  return str.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
};

// @route   POST /api/outbreaks
// @desc    Log a new crop disease scan & run spread detection logic
// @access  Public (or Private)
exports.createOutbreak = async (req, res) => {
  const { disease, crop, confidence, coordinates } = req.body;

  if (!disease || !crop || confidence === undefined || !coordinates || coordinates.length !== 2) {
    return res.status(400).json({ message: 'Please provide disease, crop, confidence, and coordinates [lng, lat]' });
  }

  try {
    // Reverse geocode the scan coordinates to get a human-readable city/town name
    let locationName = 'Sri Lanka';
    try {
      const lat = coordinates[1];
      const lng = coordinates[0];
      const geoUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=12`;
      const geoResponse = await axios.get(geoUrl, {
        headers: {
          'User-Agent': 'GoviNenaBackend/1.0'
        },
        timeout: 3000
      });
      if (geoResponse.data && geoResponse.data.address) {
        const address = geoResponse.data.address;
        locationName = address.city || address.town || address.village || address.suburb || address.county || address.state || 'Sri Lanka';
      }
    } catch (geoErr) {
      console.warn('Nominatim reverse geocoding failed for outbreak, using fallback:', geoErr.message);
    }

    const newOutbreak = new Outbreak({
      disease,
      crop,
      confidence,
      location: {
        type: 'Point',
        coordinates: [parseFloat(coordinates[0]), parseFloat(coordinates[1])] // [lng, lat]
      },
      locationName
    });

    await newOutbreak.save();

    // ── Spread Detection Logic ──
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Find matching cases within 5km in the past 7 days
    const nearbyCases = await Outbreak.find({
      disease: newOutbreak.disease,
      timestamp: { $gte: sevenDaysAgo },
      location: {
        $near: {
          $geometry: { 
            type: "Point", 
            coordinates: newOutbreak.location.coordinates 
          },
          $maxDistance: 5000 // 5km in meters
        }
      }
    });

    const nearbyCount = nearbyCases.length;
    let alertCreated = false;
    let alertData = null;

    // Threshold of 3 scans to alert
    if (nearbyCount >= 3) {
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Check if an alert for this disease was already created within 5km in the past 24 hours
      const recentAlerts = await Alert.find({
        disease: newOutbreak.disease,
        createdAt: { $gte: twentyFourHoursAgo },
        location: {
          $near: {
            $geometry: { 
              type: "Point", 
              coordinates: newOutbreak.location.coordinates 
            },
            $maxDistance: 5000
          }
        }
      });

      if (recentAlerts.length === 0) {
        // Create new Alert warning
        const cropName = capitalize(crop);
        const diseaseName = capitalize(disease);

        const alert = new Alert({
          title: `${cropName} ${diseaseName} Outbreak Alert!`,
          message: `Warning: Multiple cases of ${diseaseName} have been detected in your area. Please inspect your fields and apply recommended preventive measures.`,
          disease,
          crop,
          location: {
            type: 'Point',
            coordinates: newOutbreak.location.coordinates
          },
          radiusKm: 5
        });

        await alert.save();
        alertCreated = true;
        alertData = alert;
      }
    }

    res.status(201).json({
      message: 'Scan logged successfully',
      outbreak: newOutbreak,
      spreadDetection: {
        nearbyCasesCount: nearbyCount,
        alertGenerated: alertCreated,
        alert: alertData
      }
    });

  } catch (err) {
    console.error('Create Outbreak Error:', err.message);
    res.status(500).json({ message: 'Server error logging outbreak' });
  }
};

// @route   GET /api/outbreaks
// @desc    Get all logged outbreaks (useful for map rendering)
// @access  Public
exports.getOutbreaks = async (req, res) => {
  try {
    const outbreaks = await Outbreak.find().sort({ timestamp: -1 });
    res.json(outbreaks);
  } catch (err) {
    console.error('Get Outbreaks Error:', err.message);
    res.status(500).json({ message: 'Server error retrieving outbreaks' });
  }
};
