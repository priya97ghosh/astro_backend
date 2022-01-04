const { boolean } = require('joi');
const mongoose = require('mongoose');
const {Schema} = mongoose;

const bannerSchema = new Schema(
    {
        bannerName: { type: String, unique: true, required: true },
        bannerImage: { type: String, required: true},
        active: {type: Boolean, default: true, enum:[true, false]}
    },
     
    {
      timestamps: {
        createdAt: "createdAt",
        updatedAt: "updatedAt",
      },
    }
);

const Banner = mongoose.model("banner", bannerSchema);
module.exports = Banner;