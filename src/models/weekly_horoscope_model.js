const mongoose = require('mongoose');

const { Schema } = mongoose;

const WeeklyHoroscopeSchema = new Schema({
    image: {
        type: String,
        required: true
    },
    signName: {
        type: String,
        required: true,
        enum: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
    },
    week: {
        type: Number,
        required: true
    },
    fromDate: {
        type: String,
        required: true
    },
    toDate: {
        type: String,
        required: true
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

const Weekly = mongoose.model("weekly", WeeklyHoroscopeSchema);

module.exports = Weekly;