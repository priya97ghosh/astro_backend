const mongoose = require('mongoose');
const { Schema } = mongoose;

const querySchema = new Schema({
    
    fullName: { type: String },
    email: { type: String },
    contactNumber: { type: Number },
    subject: { type: String },
    query: { type: String }

},
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt"
        },
    }
)

const Query = mongoose.model("query", querySchema);
module.exports = Query;