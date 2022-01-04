const mongoose = require('mongoose');

const { Schema } = mongoose;

const DailyHoroscopeSchema = new Schema({
    image: {
        type: String,
        required: [ true, "image is required"],
    },
    signName: {
        type: String,
        required: [true, "Signame is required"],
        enum: ['Aries','Taurus','Gemini','Cancer','Leo','Virgo','Libra','Scorpio','Sagittarius','Capricorn','Aquarius','Pisces']
    },
    date: {
        type: String,
        required: [true, "date is required"]
    },
    month: {
        type: String,
        required: [true, "month is required"]
    },
    year: {
        type: String,
        required: [true, "year is required"]
    },
    content: {
        type: String,
        required: [true, "content is required"]
    }
});

const Daily = mongoose.model("daily", DailyHoroscopeSchema);

module.exports = Daily;