const mongoose = require('mongoose');

const { Schema } = mongoose;

const MonthlyHoroscopeSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    signName: {
        type: String,
        required: true,
        enum: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
    },
    month: {
        type: String,
        required: true
    },
    year: {
        type: String,
        required: true
    },
    content: {
        type: String,
        required: true
    }
});

const Monthly = mongoose.model("monthly", MonthlyHoroscopeSchema);

module.exports = Monthly;