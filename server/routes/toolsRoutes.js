const express = require('express');
const router = express.Router();
const { takeScreenshot, getScreenshot } = require('../controllers/screenshotController');
const { extractColors, generateColorScheme } = require('../controllers/colorController');
const { protect, validateApiKey } = require('../middleware/authMiddleware');

// Screenshot API
router.post('/screenshot', validateApiKey, takeScreenshot);
router.get('/screenshot/:filename', getScreenshot);

// Color Palette API
router.post('/colors', validateApiKey, extractColors);
router.post('/colors/scheme', validateApiKey, generateColorScheme);

module.exports = router;
