require("dotenv").config();

const Joi = require("joi");
const { v4: uuid } = require("uuid");

const { sendEmail } = require("../helpers/mailer");
const { generateJwt } = require('../helpers/generateJwt');
const jwt_decode = require('jwt-decode');

const User = require("../models/user_model");
const Follow = require("../models/follow_model");

//Validate user schema
const userSchema = Joi.object().keys({
    image: Joi.string(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    fullName: Joi.string().required(),
    contactNumber: Joi.string().required(),
    DateOfBirth: Joi.string().required(),
    address: Joi.string().required(),
    gender: Joi.string().required(),
    password: Joi.string().required().min(4),
    wallet: Joi.number().required(),
});

// user registration
exports.Signup = async (req, res) => {
    try {
        console.log(req.body);
        const result = userSchema.validate(req.body);
        // if (result.error) {
        //     console.log(result.error.message);
        //     return res.json({
        //         error: true,
        //         status: 400,
        //         message: result.error.message,
        //     });
        // }

        //Check if the email has been already registered.
        var user = await User.findOne({
            email: result.value.email,
        });
        if (user) {
            return res.json({
                error: true,
                message: "Email is already in use",
            });
        }
// Hash password
        const hash = await User.hashPassword(result.value.password);
        const id = uuid(); //Generate unique id for the admin.
        result.value.userId = id;
        result.value.password = hash;

        let code = Math.floor(100000 + Math.random() * 900000); //Generate random 6 digit code.
        let expiry = Date.now() + 60 * 1000 * 15; //Set expiry 15 mins ahead from now
        const sendCode = await sendEmail(result.value.email, code);
        if (sendCode.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send verification email.",
            });
        }
        result.value.emailToken = code;
        result.value.emailTokenExpires = new Date(expiry);

        const newUser = new User(result.value);
        await newUser.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
        });
    } catch (error) {
        console.error("signup-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Register",
            error: error
        });
    }
};

// user login
exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Cannot authorize user.",
            });
        }

        //1. Find if any account with that email exists in DB
        const user = await User.findOne({ email: email });
        // NOT FOUND - Throw error
        if (!user) {
            return res.status(404).json({
                error: true,
                message: "Account not found",
            });
        }

        //2. Throw error if account is not activated
        if (!user.active) {
            return res.status(400).json({
                error: true,
                message: "You must verify your email to activate your account",
            });
        }

        //3. Verify the password is valid
        const isValid = await User.comparePasswords(password, user.password);
        if (!isValid) {
            return res.status(400).json({
                error: true,
                message: "Invalid credentials",
            });
        }

        //Generate Access token
        const { error, token } = await generateJwt(user.email, user.userId);
        if (error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't create access token. Please try again later",
            });
        }
        user.accessToken = token;
        await user.save();

        //Success
        return res.send({
            success: true,
            message: "User logged in successfully",
            accessToken: token, //Send it to the client
            user_details: user
        });
    } catch (err) {
        console.error("Login error", err);
        return res.status(500).json({
            error: true,
            message: "Couldn't login. Please try again later.",
        });
    }
};

// User Activation Function
exports.Activate = async (req, res) => {
    try {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.json({
                error: true,
                status: 400,
                message: "Please make a valid request",
            });
        }
        const user = await User.findOne({
            email: email,
            emailToken: code,
            emailTokenExpires: { $gt: Date.now() }, // check if the code is expired
        });
        if (!user) {
            return res.status(400).json({
                error: true,
                message: "Invalid details",
            });
        } else {
            if (user.active)
                return res.send({
                    error: true,
                    message: "Account already activated",
                    status: 400,
                });
            user.emailToken = "";
            user.emailTokenExpires = null;
            user.active = true;
            await user.save();
            return res.status(200).json({
                success: true,
                message: "Account activated.",
            });
        }
    } catch (error) {
        console.error("activation-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

// Changing this part.
// user forgot password sending request
exports.ForgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email) {
            return res.send({
                status: 400,
                error: true,
                message: "Cannot be processed",
            });
        }
        const user = await User.findOne({
            email: email,
        });
        if (!user) {
            return res.send({
                success: true,
                message: "If that email address is in our database, we will send you an email to reset your password",
            });
        }
        let code = Math.floor(100000 + Math.random() * 900000);
        let response = await sendEmail(user.email, code);
        if (response.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send mail. Please try again later.",
            });
        }
        let expiry = Date.now() + 60 * 1000 * 15;
        user.resetPasswordToken = code;
        user.resetPasswordExpires = expiry; // 15 minutes
        await user.save();
        return res.send({
            success: true,
            message: "If that email address is in our database, we will send you an email to reset your password",
        });
    } catch (error) {
        console.error("forgot-password-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

// user reset password
exports.ResetPassword = async (req, res) => {
    try {
        console.log(req.body);
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
                error: true,
                message: "Couldn't process request. Please provide all mandatory fields",
            });
        }
        const user = await User.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!user) {
            return res.send({
                error: true,
                message: "Password reset token is invalid or has expired.",
            });
        }
        if (newPassword !== confirmPassword) {
            return res.status(400).json({
                error: true,
                message: "Passwords didn't match",
            });
        }
        const hash = await User.hashPassword(req.body.newPassword);
        user.password = hash;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = "";
        await user.save();
        return res.send({
            success: true,
            message: "Password has been changed",
        });
    } catch (error) {
        console.error("reset-password-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

// Logout function
exports.Logout = async (req, res) => {
    try {
        const bearerToken = req.rawHeaders[1];

        const decode = jwt_decode(bearerToken);

        const id = decode.id;
        let user = await User.findOne({ userId: id });
        user.accessToken = "";
        await user.save();
        return res.send({ success: true, message: "User Logged out" });
    } catch (error) {
        console.error("user-logout-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};

// user profile update
exports.updateProfile = (req, res, next) => {
    
    // try updating user in postman by userid  
    
    const userId = req.params._id;

    const image = req.body.image;
    const fullName = req.body.fullName;
    const email = req.body.email;
    const contactNumber = req.body.contactNumber;
    const address = req.body.address;
    const gender = req.body.gender;
    const DateOfBirth = req.body.DateOfBirth;
    const signName = req.body.signName;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                const error = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }
            
            user.image = image || user.image;
            user.fullName = fullName || user.fullName;
            user.email = email || user.email;
            user.contactNumber = contactNumber || user.contactNumber;
            user.address = address || user.address;
            user.gender = gender || user.gender;
            user.DateOfBirth = DateOfBirth || user.DateOfBirth;
            user.signName = signName || user.signName;

            return user.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ message: "user profile updated!", user: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Get all User Details
exports.getUsers = (req, res, next) => {
    User.find({}, (err, users) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(users);
    });
};

// Get Specific user By userId
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params._id);
        res.json(user);
      } catch (err) {
        res.json({ message: err.message })
    }
}

// Delete Specifi user By Id
exports.deleteUser =  async (req, res) => {
    try {
        const removedUser = await User.remove({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "User Deleted Successfully!",
            Response: removedUser
        });
    } catch (err) {
        res.json({
            message: err
        });
  
    }
};


exports.getUserDetails = async (id) => {

    const user = await User.findById(id);
    console.log(user);
    return user;

}
