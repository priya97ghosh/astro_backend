const mongoose = require('mongoose');
const FollowRequestSchema = mongoose.Schema({
    followerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    followingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "astro"
    },
    status: {
        type: Boolean,
        default: true
    },
    followingDate: {
        type: Date,
        default: Date.now
    },
}); 

module.exports = mongoose.model('FollowRequest', FollowRequestSchema);

