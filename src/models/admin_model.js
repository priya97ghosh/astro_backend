const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');


const {Schema} = mongoose;

const adminSchema = new Schema(
    {
        adminId: {type: String, unique: true},
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        total_commissions: {type: Number, default: 0},
        accessToken: { type: String, default: null },
    },
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
);

const Admin = mongoose.model("admin", adminSchema);
module.exports = Admin;

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