require('dotenv').config();

const mongoose = require("mongoose");

// Connecting database using async / await
exports.connection = async () => {
    try {
        await mongoose.connect(process.env.MONGO_ATLAS_DATABASE, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('MongoDB connected!!');
    } catch (err) {
        console.log('Failed to connect to MongoDB', err);
    }
};