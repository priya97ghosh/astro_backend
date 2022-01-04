const mongoose = require('mongoose');

const {Schema} = mongoose;

const transactionSchema = new Schema({

    transactionId : {
        type: String,
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: "user"
    },
    astroId: {
        type: Schema.Types.ObjectId,
        ref: "astro"
    },
    type: {
        type: String,
        enum: ['Spend','Call'],
        default: 'Spend'
    },
    amountSent: {
        type: Number
    },
    amountReceived: {
        type: Number
    },
    adminCommission: {
        type: Number
    },
    date: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        required: true,
        default: Date.now
    }
}
);

const Transactions = mongoose.model('transaction', transactionSchema);
module.exports = Transactions;