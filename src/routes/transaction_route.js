const express = require('express');
const router = express.Router();

const transactionController = require('../controllers/transaction_controller');


router.post('/new-transaction-astro', transactionController.AddNewTransaction);
router.get('/currentday-transaction', transactionController.getCurrentDayTransaction);
router.get('/get-all-transaction', transactionController.getAllTransaction);
router.get('/get-previous-transaction', transactionController.getPreviousTransaction);
router.put('/update-transaction/:id', transactionController.updateTransactionStatus);

// Get transaction details by sender id(User) route
router.get('/get-sender-transaction/:id', transactionController.getTransactionSenderId);
// Get transaction details by receiver id(Astro) route
router.get('/get-receiver-transaction/:id', transactionController.getTransactionReceiverId);

// current day && sender route
router.get('/get-currentday-transaction-bysender/:id', transactionController.getCurrentDayTransactionBySenderId)
// current day && receiver route
router.get('/get-currentday-transaction-byreceiver/:id', transactionController.getCurrentDayTransactionByReceiverId)


// current day && sender && amount route
router.get('/get-currentday-transaction-bysender/:id/:amount', transactionController.getCurrentDayTransactionBySenderIdAndAmount)
// current day && receiver && amount
router.get('/get-currentday-transaction-byreceiver/:id/:amount', transactionController.getCurrentDayTransactionByReceiverIdAndAmount)


// previous day && sender route
router.get('/get-previousday-transaction-bysender/:id', transactionController.getPreviousDayTransactionBySenderId)
// previous day && receiver route
router.get('/get-previousday-transaction-byreceiver/:id', transactionController.getPreviousDayTransactionByReceiverId)


// previous day && sender && amount route
router.get('/get-previousday-transaction-bysender/:id/:amount', transactionController.getPreviousDayTransactionBySenderIdAndAmount)
// previous day && receiver && amount route
router.get('/get-previousday-transaction-byreceiver/:id/:amount', transactionController.getPreviousDayTransactionByReceiverIdAndAmount)


// current && amount router
router.get('/get-currentday-transactions-byamount/:amount', transactionController.getCurrentDayTransactionAndAmount);

// date && amount route
router.get('/get-transaction-amount-by-date', transactionController.getTransactionAmountByDate);


// date && amount && sender route
router.get('/get-transaction-amount-by-date-and-senderId', transactionController.getTransactionAmountByDateAndSenderId);

// date && amount && receiver route
router.get('/get-transaction-amount-by-date-and-receiverId', transactionController.getTransactionAmountByDateAndReceiverId);


// Add amount route
router.post('/add-amount', transactionController.addAmount);

// Get all add amount details
router.get('/get-all-add-amount', transactionController.getAllAddAmountDetails);
// Get amount details by order id route
router.get('/get-by-orderid/:id', transactionController.getAmountDetailsByOrderId);
// Get amount details by payment id route
router.get('/get-by-paymentid/:id', transactionController.getAmountDetailsByPaymentId);
// Get amount details by signature route
router.get('/get-by-signature', transactionController.getAmountDetailsBySignature);
// Get amount details by status route
router.get('/get-by-status', transactionController.getAmountDetailsByStatus);



module.exports = router