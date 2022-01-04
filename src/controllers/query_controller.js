require("dotenv").config();

const Joi = require("joi");

const Query = require('../models/query_model');


const queryValidationSchema = Joi.object().keys({
    fullName: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    contactNumber: Joi.string().required(),
    subject: Joi.string().required(),
    query: Joi.string().required()
});


// submit query
exports.submitQuery = async (req, res) => {
    try{
        const submitedQuery = await queryValidationSchema.validate(req.body);
        if (submitedQuery.error) {
            console.log(submitedQuery.error.message);
            return res.json({
                error: true,
                status: 400,
                message: submitedQuery.error.message,
            });
        }
        const newQuery = new Query(submitedQuery.value);
        await newQuery.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            admin: newQuery
        });

    }catch(error){

        console.error("signup-error", error);
        
        return res.status(500).json({
            error: true,
            message: "Cannot Register",
        });
    }
};

// get all query
exports.GetAllQuery = (req, res, next) => {
    Query.find({}, (err, query) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(query);
    });
};

// get query by full name
exports.getQueryByFullname = async (req, res) => {
    try {
        const queryByFullname = await Query.find({ fullName: req.body.fullName, });
        res.json(queryByFullname);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// get query by contact number
exports.getQueryByContactNumber = async (req, res) => {
    try {
        const queryByContactNumber = await Query.find({ contactNumber: req.body.contactNumber, });
        res.json(queryByContactNumber);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// get query by email
exports.getQueryByEmail = async (req, res) => {
    try {
        const queryByEmail = await Query.find({ email: req.body.email, });
        res.json(queryByEmail);
    } catch (err) {
        res.json({ message: err.message });
    }
}

// get query by subject
exports.getQueryBySubject = async (req, res) => {
    try {
        const queryBySubject = await Query.find({ subject: req.body.subject, });
        res.json(queryBySubject);
    } catch (err) {
        res.json({ message: err.message });
    }
}