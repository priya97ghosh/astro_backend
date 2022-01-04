require("dotenv").config();

// const Joi = require("joi");
// const { v4: uuid } = require("uuid");

const { astroJwt } = require('../helpers/astroJwt');
const jwt_decode = require('jwt-decode');
const Astro = require("../models/astro_model");

//Validate astro schema
/* const astroSchema = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().required().min(4)
}); */

// astro login
exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Cannot authorize astro.",
            });
        }

        //1. Find if any account with that email exists in DB
        const astro = await Astro.findOne({ email: email });
        // NOT FOUND - Throw error
        if (!astro) {
            return res.status(404).json({
                error: true,
                message: "Account not found",
            });
        }

        //2. Verify the password is valid
        const isValid = await Astro.comparePasswords(password, astro.password);
        if (!isValid) {
            return res.status(400).json({
                error: true,
                message: "Invalid credentials",
            });
        }

        //Generate Access token
        const { error, token } = await astroJwt(astro.email, astro.astroId);
        if (error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't create access token. Please try again later",
            });
        }
        astro.accessToken = token;  

        await astro.save();

        //Success
        return res.send({
            success: true,
            message: "Astro logged in successfully",
            accessToken: token,  //Send it to the client
            astro_details: astro
        });
    } catch (err) {
        console.error("Login error", err);
        return res.status(500).json({
            error: true,
            message: "Couldn't login. Please try again later.",
        });
    }
};

// Logout function
exports.Logout = async (req, res) => {
    try {
        const bearerToken = req.rawHeaders[1];

        const decode = jwt_decode(bearerToken);

        const id = decode.id;

        let astro = await Astro.findOne({ astroId: id });
        astro.accessToken = "";
        await astro.save();
        return res.send({ success: true, message: "Astro Logged out" });
    } catch (error) {
        console.error("astro-logout-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};


// astro profile update
exports.updateAstro = (req, res, next) => {

    // try updating astro in postman by astroid  

    const astroId = req.params._id;

    const image = req.body.image;
    const fullName = req.body.fullName
    const contactNumber = req.body.contactNumber;
    const address = req.body.address;
    const gender = req.body.gender;
    const active = req.body.active;
    const language = req.body.language;
    const experience = req.body.experience;
    const serviceChargeRate = req.body.rate;
    const bio = req.body.bio;
    const ratings = req.body.ratings;
    const speciality = req.body.speciality;
    const expertise = req.body.expertise;

    Astro.findById(astroId)
        .then((astro) => {
            if (!astro) {
                const error = new Error("Astro not found.");
                error.statusCode = 404;
                throw error;
            }

            astro.image = image || astro.image;
            astro.fullName = fullName || astro.fullName;
            astro.contactNumber = contactNumber || astro.contactNumber;
            astro.address = address || astro.address;
            astro.gender = gender || astro.gender;
            astro.active = active || astro.active;
            astro.language = language || astro.language;
            astro.experience = experience || astro.experience;
            astro.serviceChargeRate = serviceChargeRate || astro.serviceChargeRate;
            astro.bio = bio || astro.bio;
            astro.ratings = ratings || astro.reatings;
            astro.speciality = speciality || astro.speciality;
            astro.expertise = expertise || astro.expertise;

            return astro.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ message: "astro profile updated!", astro: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};


// Get all Astro Details
exports.getAstros = (req, res, next) => {
    Astro.find({}, (err, astros) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(astros);
    });
};


// Get Specific astro By astroId
exports.getAstro = async (req, res) => {
    try {
        console.log(req);
        const astro = await Astro.findById(req.params._id);
        console.log(astro);
        return res.json(astro);
    } catch (err) {
       res.json({ message: err.message })
    }
}

// astro delete function
exports.deleteAstro = async (req, res) => {
    try {
        const removedAstro = await Astro.remove({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "Astro Deleted Successfully!",
            Response: removedAstro
        });
    } catch (err) {
        res.json({
            message: err
        });

    }
};


exports.getAstroDetails  = async (id) => {

    const astro = await Astro.findById(id);
    console.log(astro);
    return astro;

}


