const express = require('express');
const router = express.Router();
const outbreakController = require('../controllers/outbreakController');

router.post('/', outbreakController.createOutbreak);
router.get('/', outbreakController.getOutbreaks);

module.exports = router;
