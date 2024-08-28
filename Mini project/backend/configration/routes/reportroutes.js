const express = require('express');
const router = express.Router();
const reportingController = require('../controllers/reportController');

router.get('/reports/total-stock-value', reportingController.getTotalStockValue);


router.get('/reports/most-sold-products', reportingController.getMostSoldProducts);


router.get('/reports/least-sold-products', reportingController.getLeastSoldProducts);

module.exports = router;
