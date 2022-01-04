const mongoose = require('mongoose');

const {Schema} = mongoose;

const withdrawlSchema = new Schema({

    astroId: {
        type: Schema.Types.ObjectId,
        ref: "astro"
    },
    astroName: {
        type: String,
    },
    astroEmail: {
        type: String
    },
    astroPhoneNumber: {
        type: String
    },
    message: {
        type: String,
        default: "Request to withdraw the amount"
    },
    isApproved: {
        type: Boolean,
        default: false,
        enum: [ true, false ]
    }
}
);

const Withdrawl = mongoose.model('withdrawl', withdrawlSchema);
module.exports = Withdrawl;
