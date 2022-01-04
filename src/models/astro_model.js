const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { string } = require('joi');


const { Schema } = mongoose;

const astroSchema = new Schema(
    {   
        astroId: {type: String, unique: true},
        fullName: { type: String },
        email: { type: String, required: true, unique: true },
        contactNumber: { type: String, unique: true },
        image: { type: String },
        gender: {
            type: String,
            enum: ['Male', 'Female', 'Intersex'],
        },
        serviceChargeRate: {
            type: Number,
        },
        bio: {
            type: String
        },
        ratings: {
            type: Number
        },
        speciality: [
            {
                type: String,
                enum: ['Love', 'Finance', 'Family', 'Relationship', 'Business', 'Career', 'Health']
            }
        ],
        expertise: [String],
        experience: {

            type: String
        
        },
        language: [
            {
                type: String,
            }
        ],
        wallet: { type: Number, default: 0 },

        active: { type: Boolean, default: false },

        password: { type: String, required: true },

        resetPasswordToken: { type: String, default: null },
        resetPasswordExpires: { type: Date, default: null },

        emailToken: { type: String, default: null },
        emailTokenExpires: { type: Date, default: null },

        accessToken: { type: String, default: null },
    },

    {
        timestamps: {
            createdAt: "createdAt",
            updatedAt: "updatedAt",
        },

    }
);

const Astro = mongoose.model("astro", astroSchema);
module.exports = Astro;

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
