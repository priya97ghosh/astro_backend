const mongoose = require('mongoose');

const { Schema } = mongoose;

const YearlyHoroscopeSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    signName: {
        type: String,
        required: true,
        enum: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
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

const Yearly = mongoose.model('yearly', YearlyHoroscopeSchema);

module.exports = Yearly;