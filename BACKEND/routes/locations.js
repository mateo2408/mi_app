const express = require('express');
const router = express.Router();
const locations = require('../controllers/locations.controller');

router.get('/countries', locations.listCountries);
router.get('/provinces', locations.listProvinces);
router.get('/cities', locations.listCities);

module.exports = router;
