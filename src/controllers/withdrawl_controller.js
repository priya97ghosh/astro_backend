const Joi = require("joi");

const Withdrawl = require('../models/withdrawl_model');

//Validate admin schema
const withdrawlSchema = Joi.object().keys({
    astroId: Joi.string().required(),
    astroName: Joi.string().required(),
    astroEmail: Joi.string().required(),
    astroPhoneNumber: Joi.string().required(),
    message: Joi.string().required()
});

// sending withdrawl request
exports.sendWithdrawlRequest = async (req, res) => {
    try {

        const result = withdrawlSchema.validate(req.body);

        const newWithdrawlRequest = new Withdrawl(result.value);
        await newWithdrawlRequest.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            admin: newWithdrawlRequest
        });
    } catch (error) {
        console.error("signup-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Register",
            detail: error
        });
    }
};

// fetch all the withdrawl request
exports.getWithdrawls = (req, res, next) => {
    Withdrawl.find({}, (err, withdrawl) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(withdrawl);
    });
};


// fetch specific withdrawl request by name
exports.getwithdrawlsByName = async (req, res) => {
    try {
        const withdrawl = await Withdrawl.find({astroName: req.params.name});
        res.json(withdrawl);
    } catch (err) {
        res.json({ message: err.message })
    }
}

// fetch specific withdrawl request by phone number
exports.getwithdrawlsByNumber = async (req, res) => {
    try {
        const withdrawl = await Withdrawl.find({ astroPhoneNumber: req.params.number });
        res.json(withdrawl);
    } catch (err) {
        res.json({ message: err.message })
    }
}

// fetch specific withdrawl request by email
exports.getwithdrawlsByEmail = async (req, res) => {
    try {
        const withdrawl = await Withdrawl.find({ astroEmail: req.params.email });
        res.json(withdrawl);
    } catch (err) {
        res.json({ message: err.message })
    }
}

// fetch specific withdrawl request by email
exports.getwithdrawlsByApprovals = async (req, res) => {
    try {
        const withdrawl = await Withdrawl.find({ isApproved: req.params.approvals });
        res.json(withdrawl);
    } catch (err) {
        res.json({ message: err.message })
    }
}

// user profile update
exports.updateWithdrawlStatus = (req, res, next) => {

    // try updating user in postman by userid  

    const withdrawlId = req.params.id;

    const isApproved = req.body.isApproved

    Withdrawl.findById(withdrawlId)
        .then((withdrawl) => {
            if (!withdrawl) {
                const error = new Error("widthdrawl history did not found.");
                error.statusCode = 404;
                throw error;
            }

            withdrawl.isApproved = isApproved || withdrawl.isApproved

            return withdrawl.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ message: "user profile updated!", withdrawl: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};