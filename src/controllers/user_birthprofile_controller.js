const Joi = require("joi");

const UserBirthProfile = require("../models/user_birthprofile_model");

//Validate userBirthProfile schema
const userBirthProfileSchema = Joi.object().keys({
    user: Joi.string().required(),
    DateOfBirth: Joi.string().required(),
    signName: Joi.string().required(),
    birthPlace: Joi.string().required(),
    birthTime: Joi.string().required(),
    manglik: Joi.boolean().required(),
});

// user registration
exports.UserBirthProfileCreation = async (req, res) => {
    try {
        console.log(req.body);
        const result = userBirthProfileSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        //Check if the email has been already registered.
        var user = await UserBirthProfile.findOne({
            user: result.value.user,
        });
        if (user) {
            return res.json({
                error: true,
                message: "Details Already Present",
            });
        }

        const newBirthProfile = new UserBirthProfile(result.value);
        await newBirthProfile.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            BirthProfile: newBirthProfile
        });
    } catch (error) {
        console.error("newBirthProfile-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Register",
            error: error
        });
    }
};

// get all birth profile
exports.GetAllBirthProfile = (req, res, next) => {
    UserBirthProfile.find({}, (err, profile) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(profile);
    });
};

// get birth profile by user id
exports.getBirthProfileByUserId = async (req, res) => {
    try {
        const getBirthProfile = await UserBirthProfile.find({ user: req.params.user });
        res.json(getBirthProfile);
    } catch (err) {
        res.json({ message: err.message });
    }
}