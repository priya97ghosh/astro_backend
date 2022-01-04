const express = require('express');
const router = express.Router();

const queryController = require('../controllers/query_controller');

// Submitting Query route
router.post('/submit-your-query', queryController.submitQuery);

// fetching all qeueries route
router.get('/get-all-query', queryController.GetAllQuery);

// fetching query by full name route
router.get('/get-query-by-fullname', queryController.getQueryByFullname);

// fetching queries by contact number route
router.get('/get-query-by-contactnunmber', queryController.getQueryByContactNumber);

// fetching query by email route
router.get('/get-query-by-email', queryController.getQueryByEmail);

// fetching query by subject route
router.get('/get-query-by-subject', queryController.getQueryBySubject);

module.exports = router;