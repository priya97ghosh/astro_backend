const mongoose = require('mongoose');

const { Schema } = mongoose;

const addAmountSchema = new Schema({

    orderId: {
        type: String,
    },
    paymentId: {
        type: String
    },
    signature: {
        type: String
    },
    status: {
        type: String
    },
    amount: {
        type: String
    }
},
{
    timestamps: {
        createdAt:"createdAt",
        updatedAt: "updatedAt"
    },
}
);

const AddAmount = mongoose.model('addAmount', addAmountSchema);
module.exports = AddAmount;