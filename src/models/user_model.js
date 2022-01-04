const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const {Schema} = mongoose;

const userSchema = new Schema(
    {
        userId: {type: String, unique: true},
        googleId: { type: String, unique: false, required: false, default: null },
        facebookId: { type: String, unique: false, required: false, default: null },

        userName: { type: String },
        googleUserName: { type: String, required: false },
        facebookUserName: { type: String, required: false },

        fullName: { type: String },

        email: { type: String, required: true, unique: true },
        contactNumber: { type: String },
        address: { type: String },

        gender: {
            type: String,
            enum : ['Male', 'Female', 'Intersex']
        },

        image: { type: String },

        active: { type: Boolean, default: false },
        password: { type: String, required: false },

        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },

        emailToken: { type: String, default: null },
        emailTokenExpires: { type: Date, default: null },

        accessToken: { type: String, default: null },

        wallet: { type: Number, default: 0 }

    },
    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },
    }
);

const createUser = new Schema(
    
)

const User = mongoose.model("user", userSchema);
module.exports = User;

// Function for hashing the password
module.exports.hashPassword = async (password) => {
    try {
        const salt = await bcrypt.genSalt(10);
        return await bcrypt.hash(password, salt);
    } catch (error) {
        throw new Error("Hashing failed", error);
    }
};

// Function to comapare the hased password while authenticating
module.exports.comparePasswords = async (inputPassword, hashedPassword) => {
    try {
        return await bcrypt.compare(inputPassword, hashedPassword);
    } catch (error) {
        throw new Error("Comparison failed", error);
    }
};
