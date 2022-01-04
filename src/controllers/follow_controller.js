const Follow = require('../models/follow_model');
// const User = require('../models/user_model');
// const Astro = require('../models/astro_model');

const mongoose = require('mongoose');
const astroController = require('../controllers/astro_controller');
const userController = require('../controllers/user_controller');

const Joi = require("joi");

//Validate user schema
const followersSchema = Joi.object().keys({
    followerId: Joi.string().required(),
    followingId: Joi.string().required(),
    status: Joi.boolean(),
    followingDate: Joi.date(),
});

// follow registration
exports.sendFollowRequest = async (req, res) => {
    try {
        console.log(req.body);
        const result = followersSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        // check if the user is already following the astro
        var isFollowing = await Follow.findOne({
            followerId: result.value.followerId,
            followingId: result.value.followingId,
            status: true
        });
        if (isFollowing) {
            return res.json({
                error: true,
                message: "Already following this account",
            });
        }

        const newFollow = new Follow(result.value);
        await newFollow.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            result: newFollow
        });
    } catch (error) {
        console.error("follow-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Register follow request",
            error: error
        });
    }
};


// Get all Follow List
exports.getAllFollowList = (req, res, next) => {
    Follow.find({}, (err, follow) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(follow);
    });
};

// Delete Specifi user By Id
exports.removeFollow = async (req, res) => {
    try {
        const removedFollow = await Follow.deleteOne({
            followingId: req.params.followingId
        });
        res.json({
            error: false,
            message: "Follow removed Successfully!",
            Response: removedFollow
        });
    } catch (err) {
        res.json({
            message: err
        });

    }
};

// get follow list by user id
exports.getFollowListByUserId = async (req, res) => {

    try {
        console.log(req.params);
        console.log(res.json);
        const getFollowListByUserId = await Follow.find({ followerId: req.params.followerId });

        const followingDetails = []

        console.log(getFollowListByUserId);

        getFollowListByUserId.forEach(async followedUser => {

            const astro = await astroController.getAstroDetails(followedUser.followingId);
            console.log(astro);

            followingDetails.push({
                id: astro._id,
                fullName: astro.fullName,
                email: astro.email,
                contactNumber: astro.contactNumber,
                gender: astro.gender,
                bio: astro.bio,
                serviceChargeRate: astro.serviceChargeRate,
                ratings: astro.ratings,
                speciality: astro.speciality,
                expertise: astro.expertise,
                language: astro.language,
                experience: astro.experience,
                image: astro.image,
            })
        });

        setTimeout(() => {
            return res.json(followingDetails);
        }, 1000);
        

    } catch (err) {
        return res.json({ message: err.message });
    }
}

// get follow list by astro id
exports.getFollowListByAstroId = async (req, res) => {
    try {
        console.log(req.params);
        console.log(res.json);
        const getFollowListByAtroId = await Follow.find({ followingId: req.params.followingId });

        const followerDetails = []

        console.log(getFollowListByAtroId);

        getFollowListByAtroId.forEach(async followedAstro => {

            const user = await userController.getUserDetails(followedAstro.followerId);
            console.log(user);

            followerDetails.push({
                id: user._id,
                googleId: user.googleId,
                facebookId: user.facebookId,
                userName: user.userName,
                googleUserName: user.googleUserName,
                facebookUserName: user.facebookUserName,
                fullName: user.fullName,
                email: user.email,
                contactNumber: user.contactNumber,
                address: user.address,
                gender: user.gender,
                image: user.image,
            });
        });

        setTimeout(() => {
            return res.json(followerDetails);
        }, 1000);

    } catch (err) {
        return res.json({ message: err.message });
    }
}