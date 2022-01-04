const mongoose = require('mongoose');

const {Schema} = mongoose;

const userBirthProfileSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "user"
        },
        
        DateOfBirth: { 
            type: String, 
            required: true 
        },
        
        signName: { 
            type: String,
            required: true 
        },

        birthPlace: { 
            type: String,
            required: true
        },

        birthTime: { 
            type: String,
            required: true
        },

        manglik: { 
            type: Boolean,
            default: false 
        },
    },
    {
        timestamps: {
          createdAt: "createdAt",
          updatedAt: "updatedAt",
        },
    }
)

const UserBirthProfile = mongoose.model("userBirthProfile", userBirthProfileSchema);
module.exports = UserBirthProfile;