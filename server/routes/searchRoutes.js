const express = require('express');
const router = express.Router();
const {
    search,
    getPopularSearches,
    getSuggestions
} = require('../controllers/searchController');

// All routes are public
router.get('/', search);
router.get('/popular', getPopularSearches);
router.get('/suggestions', getSuggestions);

module.exports = router;
