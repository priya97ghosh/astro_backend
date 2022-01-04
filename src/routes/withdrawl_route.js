const express = require('express');
const router = express.Router();

const withdrawlController = require('../controllers/withdrawl_controller');

router.post('/request-for-amount-withdrawl', withdrawlController.sendWithdrawlRequest);
router.get('/get-all-amount-withdrawl-by-name/:name', withdrawlController.getwithdrawlsByName);
router.get('/get-all-amount-withdrawl-by-number/:number', withdrawlController.getwithdrawlsByNumber);
router.get('/get-all-amount-withdrawl-by-email/:email', withdrawlController.getwithdrawlsByEmail);
router.get('/get-all-amount-withdrawl-by-approvals/:approvals', withdrawlController.getwithdrawlsByApprovals);
router.get('/get-all-amount-withdrawl', withdrawlController.getWithdrawls);
router.put('/update-withdrawl-status/:id', withdrawlController.updateWithdrawlStatus);

module.exports = router;