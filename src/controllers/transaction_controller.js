const Joi = require("joi");
const { v4: uuid } = require("uuid");

const Transaction = require('../models/transactions_model');
const User = require('../models/user_model');
const Astro = require('../models/astro_model');
const Admin = require('../models/admin_model');
const AddAmount = require("../models/add_amount_model");

//********************************get details of users and astros with their specific details respectively of their transaction details***************************************/
// get transaction history by user


// get transaction history by astro id


//************************************************user to astro Transaction History********************************/
function getDate() {
    var now = new Date();
    var date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    return date;
}

function getPreviousDate() {
    var now = new Date(Date.now() - 864e5);
    var date = `${now.getDate()}-${now.getMonth() + 1}-${now.getFullYear()}`;
    // console.log("Date of year is: " + date);
    return date;
}

// Add new Transaction
exports.AddNewTransaction = async (req, res) => {
    const getTransaction = await Transaction.find({ transactionId: req.body.id });
    if (!getTransaction.length) {
        try {
            var userAmount = 0;
            var astroAmount = 0;
            var adminCommission = 0;

            const getUser = await User.findById(req.body.userId);
            const getAstro = await Astro.findById(req.body.astroId);
            const admin = "61b0a9d97abb9b7e979c3511";
            const getAdmin = await Admin.findById(admin);

            if (!getUser) {
                return res.json({ message: "User Not found" });
            }

            if (!getAstro) {
                return res.json({ message: "Astrologer Not found" });
            }

            if (!getAdmin) {
                return res.json({ message: "Admin Not Found!!!!!!!!!!!!" })
            }

            if (!req.body.amount) {
                return res.json({ message: "Please Enter Amount for Transaction" });
            }

            if (req.body.amount > getUser.wallet) {
                return res.json({message: "You have insufficient amount in your wallet"})
            }
            

            if (req.body.type === "Spend") {
                userAmount = getUser.wallet - req.body.amount;

                var percentageToGet = 10;
                var percentAsDecimal = (percentageToGet / 100);
                var percent = percentAsDecimal * req.body.amount;

                adminCommission = getAdmin.total_commissions + percent;

                var astroEarnedAfterCommission = req.body.amount - percent;

                astroAmount = getAstro.wallet + astroEarnedAfterCommission;

            }
            if (userAmount < 0) {
                return res.json({
                    message: "Amount in Your Wallet are too low for this transaction",
                });
            }

            const transactionBody = new Transaction({
                transactionId: req.body.id,
                type: req.body.type,
                amountSent: req.body.amount,
                adminCommission: percent,
                amountReceived: astroEarnedAfterCommission,
                userId: req.body.userId,
                astroId: req.body.astroId,
                date: getDate(),
                // date: "16-11-2021",
            });

            const transaction = await transactionBody.save();

            if (transaction) {
                await User.updateOne(
                    { _id: req.body.userId },
                    {
                        $set: {
                            wallet: userAmount
                        },
                    }
                );
                await Astro.updateOne(
                    { _id: req.body.astroId },
                    {
                        $set: {
                            wallet: astroAmount
                        },
                    }
                );
                await Admin.updateOne(
                    { _id: admin },
                    {
                        $set: {
                            total_commissions: adminCommission
                        },
                    }
                );
            }
            return res.json(transaction);

        } catch (err) {
            res.json({
                success: "False",
                message: "Transaction Failed!",
                error: err
            });
        }

    }
    res.json({ message: "Transaction Already Made", status: 400 });
}

// Get Specific transaction By current date automatically
exports.getCurrentDayTransaction = async (req, res) => {
    // console.log(getDate())
    try {
        const currentTransaction = await Transaction.find({ date: getDate() });
        res.json(currentTransaction);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// Get all transaction
exports.getAllTransaction = (req, res, next) => {
    Transaction.find({}, (err, transactions) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(transactions);
    });
};

// Update user transaction by transaction id
exports.updateTransactionStatus = (req, res, next) => {

    const transactionId = req.params.id;
    const amount = req.body.amount;

    Transaction.find({transactionId: transactionId})
        .then( async (transactions) => {
            if (!transactions) {
                const error = new Error("transaction history did not found.");
                error.statusCode = 404;
                throw error;
            }

            if(transactions[0].type !== 'Call'){
                const error = new Error("type is not found");
                error.statusCode = 404;
                throw error;
            }

            const getUser = await User.findById(transactions[0].userId);
            if(amount > getUser.wallet){
                const error = new Error("You have insufficient amount in your wallet")
                error.statusCode = 404;
                throw error;
            }
            transactions[0].amountSent = amount + transactions[0].amountSent;
            return transactions[0].save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ message: "transaction updated!", transaction: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// update user wallet in transaction by user Id

// update astro wallet in tranaction by astro id


// Get previous transaction
exports.getPreviousTransaction = async (req, res) => {
    // console.log(getDate())
    try {
        const previousTransaction = await Transaction.find({ date: getPreviousDate() });
        res.json(previousTransaction);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// Get transaction details by sender id(User)
exports.getTransactionSenderId = async (req, res) => {
    try {
        const senderTransaction = await Transaction.find({ userId: req.params.id });
        res.json(senderTransaction);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// Get transaction details by receiver id(Astro)
exports.getTransactionReceiverId = async (req, res) => {
    try {
        const receiverTransaction = await Transaction.find({ astroId: req.params.id });
        res.json(receiverTransaction);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// current day && sender
exports.getCurrentDayTransactionBySenderId = async (req, res) => {
    try {
        const currentDayTransactionBySender = await Transaction.find({ date: getDate(), userId: req.params.id });
        res.json(currentDayTransactionBySender);
    } catch (err) {
        res.json({ message: err.message });
    }
}
// current day && receiver
exports.getCurrentDayTransactionByReceiverId = async (req, res) => {
    try {
        const currentDayTransactionByReceiver = await Transaction.find({ date: getDate(), astroId: req.params.id });
        res.json(currentDayTransactionByReceiver);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// current day && sender && amount
exports.getCurrentDayTransactionBySenderIdAndAmount = async (req, res) => {
    try {
        const currentDayTransactionBySenderAndAmount = await Transaction.find({ date: getDate(), userId: req.params.id, amount: req.params.amount });
        res.json(currentDayTransactionBySenderAndAmount);
    } catch (err) {
        res.json({ message: err.message });
    }
}
// current day && receiver && amount
exports.getCurrentDayTransactionByReceiverIdAndAmount = async (req, res) => {
    try {
        const currentDayTransactionByReceiverAndAmount = await Transaction.find({ date: getDate(), astroId: req.params.id, amount: req.params.amount });
        res.json(currentDayTransactionByReceiverAndAmount);
    } catch (err) {
        res.json({ message: err.message });
    }
}
// previous day && sender
exports.getPreviousDayTransactionBySenderId = async (req, res) => {
    try {
        const previousDayTransactionBySender = await Transaction.find({ date: getPreviousDate(), userId: req.params.id });
        res.json(previousDayTransactionBySender);
    } catch (err) {
        res.json({ message: err.message });
    }
}
// previous day && receiver
exports.getPreviousDayTransactionByReceiverId = async (req, res) => {
    try {
        const previousDayTransactionByReceiver = await Transaction.find({ date: getPreviousDate(), astroId: req.params.id });
        res.json(previousDayTransactionByReceiver);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// previous day && sender && amount
exports.getPreviousDayTransactionBySenderIdAndAmount = async (req, res) => {
    try {
        const previousDayTransactionBySenderAndAmount = await Transaction.find({ date: getPreviousDate(), userId: req.params.id, amount: req.params.amount });
        res.json(previousDayTransactionBySenderAndAmount);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// previous day && receiver && amount
exports.getPreviousDayTransactionByReceiverIdAndAmount = async (req, res) => {
    try {
        const previousDayTransactionByReceiverAndAmount = await Transaction.find({ date: getPreviousDate(), astroId: req.params.id, amount: req.params.amount });
        res.json(previousDayTransactionByReceiverAndAmount);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// current && amount
exports.getCurrentDayTransactionAndAmount = async (req, res) => {
    try {
        const CurrentDayTransactionWithAmount = await Transaction.find({ date: getDate(), amount: req.params.amount });
        res.json(CurrentDayTransactionWithAmount);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// date && amount
exports.getTransactionAmountByDate = async (req, res) => {
    try {
        const TransactionByDate = await Transaction.find({ date: req.body.date, amount: req.body.amount });
        res.json(TransactionByDate);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// date && amount && sender
exports.getTransactionAmountByDateAndSenderId = async (req, res) => {
    try {
        const TransactionByDateAndSenderId = await Transaction.find({ date: req.body.date, amount: req.body.amount, userId: req.body.id });
        res.json(TransactionByDateAndSenderId);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// date && amount && receiver
exports.getTransactionAmountByDateAndReceiverId = async (req, res) => {
    try {
        const TransactionByDateAndReceiverId = await Transaction.find({ date: req.body.date, amount: req.body.amount, astroId: req.body.id });
        res.json(TransactionByDateAndReceiverId);
    } catch (err) {
        res.json({ message: err.message });
    }
}

//************************************************ User to Admin transaction History********************************/
// Joi Schema for add amount
const addAmountSchema = Joi.object().keys({
    orderId: Joi.string().required(),
    paymentId: Joi.string().required(),
    signature: Joi.string().required(),
    status: Joi.string().required(),
    amount: Joi.string().required(),
});

// Add Amount
exports.addAmount = async (req, res) => {
    try {
        console.log(req.body);
        const result = addAmountSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        const newAmount = new AddAmount(result.value);
        await newAmount.save();

        return res.status(200).json({
            success: true,
            message: "Transaction register successfully",
            details: newAmount
        });
    } catch (error) {
        console.error("add-amount-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Add Amount",
            error: error
        });
    }
};

// get all add amount details
exports.getAllAddAmountDetails = (req, res, next) => {
    AddAmount.find({}, (err, addamount) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(addamount);
    });
};

// get amount details by orderId
exports.getAmountDetailsByOrderId = async (req, res) => {
    try {
        const orderIdDetails = await AddAmount.find({ orderId: req.params.id });
        res.json(orderIdDetails);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// get amount details by paymentId
exports.getAmountDetailsByPaymentId = async (req, res) => {
    try {
        const paymentIdDetails = await AddAmount.find({ paymentId: req.params.id });
        res.json(paymentIdDetails);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// get amount details by signature
exports.getAmountDetailsBySignature = async (req, res) => {
    try {
        const detailsBySignature = await AddAmount.find({ signature: req.body.signature });
        res.json(detailsBySignature);
    } catch (err) {
        res.json({ message: err.message });
    }
}
// get amount details by status
exports.getAmountDetailsByStatus = async (req, res) => {
    try {
        const detailsByStatus = await AddAmount.find({ status: req.body.status });
        console.log(detailsByStatus)
        res.json(detailsByStatus);
    } catch (err) {
        res.json({ message: err.message });
    }
}