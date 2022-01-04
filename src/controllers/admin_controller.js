require("dotenv").config();

const Joi = require("joi");
const { v4: uuid } = require("uuid");

const { adminJwt } = require('../helpers/adminJwt');
const {sendEmail} = require('../helpers/mailer');
const jwt_decode = require('jwt-decode');
//Upload Banner import 
// let bannerModel = require('../models/banner_model');
// const fs = require('fs');
// const path = require('path');
const upload = require('../helpers/multer')
const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;

// Importing Database Models
// const User = require("../models/user_model");
const Admin = require("../models/admin_model");
const Astro = require("../models/astro_model");
const User = require('../models/user_model');
const Banner = require('../models/banner_model')

const DailyHoroscope = require("../models/daily_horoscope_model");
const WeeklyHoroscope = require('../models/weekly_horoscope_model');
const MonthlyHoroscope = require('../models/monthly_horoscope_model');
const YearlyHoroscope = require('../models/yearly_horoscope_model');

// const userWallet = require('../models/user_wallet_model');
// const astroWallet = require('../models/astro_wallet_model'); 

// const url = process.env.MONGO_ATLAS_DATABASE;
// const baseUrl = "http://165.22.220.173/admin/banners/";
// const mongoClient = new MongoClient(url);


//Validate admin schema
const adminSchema = Joi.object().keys({
    email: Joi.string().email({ minDomainSegments: 2 }),
    password: Joi.string().required().min(4)
});

// admin registration
exports.Signup = async (req, res) => {
    try {

        const result = adminSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        //Check if the email has been already registered.
        var admin = await Admin.findOne({
            email: result.value.email,
        });
        if (admin) {
            return res.json({
                error: true,
                message: "Email is already in use",
            });
        }

        const hash = await Admin.hashPassword(result.value.password);
        const id = uuid(); //Generate unique id for the admin.
        result.value.adminId = id;
        result.value.password = hash;

        const newAdmin = new Admin(result.value);
        await newAdmin.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            admin: newAdmin
        });
    } catch (error) {
            console.error("signup-error", error);
            return res.status(500).json({
                error: true,
                message: "Cannot Register",
            });
    }
};


// admin login
exports.Login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: true,
                message: "Cannot authorize admin.",
            });
        }

        //1. Find if any account with that email exists in DB
        const admin = await Admin.findOne({ email: email });
        // NOT FOUND - Throw error
        if (!admin) {
            return res.status(404).json({
                error: true,
                message: "Account not found",
            });
        }

        //2. Verify the password is valid
        const isValid = await Admin.comparePasswords(password, admin.password);
        if (!isValid) {
            return res.status(400).json({
                error: true,
                message: "Invalid credentials",
            });
        }

        //Generate Access token
        const { error, token } = await adminJwt(admin.email, admin.adminId);
        if (error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't create access token. Please try again later",
            });
        }
        admin.accessToken = token;

        await admin.save();

        //Success
        return res.send({
            success: true,
            message: "Admin logged in successfully",
            accessToken: token,  //Send it to the client
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

        let admin = await Admin.findOne({ adminId: id });
        admin.accessToken = "";
        await admin.save();
        return res.send({ success: true, message: "admin Logged out" });
    } catch (error) {
        console.error("admin-logout-error", error);
        return res.status(500).json({
            error: true,
            message: error.message,
        });
    }
};


// Delete Specifi admin By Id
exports.deleteAdmin = async (req, res) => {
    try {
        const removedAdmin = await Admin.remove({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "Admin Deleted Successfully!",
            Response: removedAdmin
        });
    } catch (err) {
        res.json({
            message: err
        });

    }
};

// Admin forgot password sending request
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
        const admin = await Admin.findOne({
            email: email,
        });
        if (!admin) {
            return res.send({
                success: true,
                message: "If that email address is in our database, we will send you an email to reset your password",
            });
        }
        let code = Math.floor(100000 + Math.random() * 900000);
        let response = await sendEmail(admin.email, code);
        if (response.error) {
            return res.status(500).json({
                error: true,
                message: "Couldn't send mail. Please try again later.",
            });
        }
        let expiry = Date.now() + 60 * 1000 * 15;
        admin.resetPasswordToken = code;
        admin.resetPasswordExpires = expiry; // 15 minutes
        await admin.save();
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

// Admin reset password
exports.ResetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirmPassword } = req.body;
        if (!token || !newPassword || !confirmPassword) {
            return res.status(403).json({
                error: true,
                message: "Couldn't process request. Please provide all mandatory fields",
            });
        }
        const admin = await Admin.findOne({
            resetPasswordToken: req.body.token,
            resetPasswordExpires: { $gt: Date.now() },
        });
        if (!admin) {
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
        const hash = await Admin.hashPassword(req.body.newPassword);
        admin.password = hash;
        admin.resetPasswordToken = null;
        admin.resetPasswordExpires = "";
        await admin.save();
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

// Get all Admin Details
exports.getAdmin = (req, res, next) => {
    Admin.find({}, (err, admins) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(admins);
    });
};


// ---------------------------This is for Astro creation part API----------------------------------------------------------

//Validate astro schema
const astroSchema = Joi.object().keys({
    image: Joi.string().required(),
    fullName: Joi.string().required(),
    email: Joi.string().email({ minDomainSegments: 2 }),
    contactNumber: Joi.number().required(),
    gender: Joi.string().required(),
    bio: Joi.string().required(),
    serviceChargeRate: Joi.number().required(),
    ratings: Joi.number().required(),
    speciality: Joi.array(),
    expertise: Joi.array(),
    language: Joi.array(),
    experience: Joi.string(),
    active: Joi.boolean().required(),
    password: Joi.string().required().min(4)
});

// astro registration
exports.astroSignup = async (req, res) => {
    try {
        console.log(req.body)
        const result = astroSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        //Check if the email has been already registered.
        var astro = await Astro.findOne({
            email: result.value.email,
        });
        if (astro) {
            return res.json({
                error: true,
                message: "Email is already in use",
            });
        }

        const hash = await Astro.hashPassword(result.value.password);
        const id = uuid(); //Generate unique id for the admin.
        result.value.astroId = id;
        result.value.password = hash;

        const newAstro = new Astro(result.value);
        await newAstro.save();

        return res.status(200).json({
            success: true,
            message: "Registration Success",
            admin: newAstro
        });
    } catch (error) {
        console.error("signup-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Register",
            details: error
        });
    }
};

// astro update
// exports.updateAstro = (req, res, next) => {

//     // try updating astro in postman by astroid  

//     const astroId = req.params._id;

//     const firstName = req.body.firstName;
//     const lastName = req.body.lastName;
//     const email = req.body.email;
//     const contactNumber = req.body.contactNumber;
//     const address = req.body.address;
//     const gender = req.body.gender;
//     const active = req.body.active;

//     Astro.findById(astroId)
//         .then((astro) => {
//             if (!astro) {
//                 const error = new Error("Astro not found.");
//                 error.statusCode = 404;
//                 throw error;
//             }

//             astro.firstName = firstName || astro.firstName;
//             astro.lastName = lastName || astro.lastName;
//             astro.email = email || astro.email;
//             astro.contactNumber = contactNumber || astro.contactNumber;
//             astro.address = address || astro.address;
//             astro.gender = gender || astro.gender;
//             astro.active = active || astro.active;

//             return astro.save();
//         })
//         .then((result) => {
//             res
//                 .status(200)
//                 .json({ message: "astro profile updated!", astro: result });
//         })
//         .catch((err) => {
//             if (!err.statusCode) {
//                 err.statusCode = 500;
//             }
//             next(err);
//         });
// };


// // Get all Astro Details
// exports.getAstros = (req, res, next) => {
//     Astro.find({}, (err, astros) => {
//         if (err) return res.status(400).send(err);
//         res.status(200).send(astros);
//     });
// };


// // Get Specific astro By astroId
// exports.getAstro = async (req, res) => {
//     try {
//         const astro = await Astro.findById(req.params._id);
//         res.json(astro);
//     } catch (err) {
//         res.json({ message: err.message })
//     }
// }

// // astro delete function
// exports.deleteAstro = async (req, res) => {
//     try {
//         const removedAstro = await Astro.remove({
//             _id: req.params._id
//         });
//         res.json({
//             error: false,
//             message: "Astro Deleted Successfully!",
//             Response: removedAstro
//         });
//     } catch (err) {
//         res.json({
//             message: err
//         });

//     }
// };


/* ====================================================================== Daily Horoscope Section ================================================================================================================================================================= */

// validations for Daily Horoscope
const dailyHoroscopeSchema = Joi.object().keys({
    image: Joi.string().base64().required(),
    signName: Joi.string().required(),
    date: Joi.string().required(),
    month: Joi.string().required(),
    year: Joi.string().required(),
    content: Joi.string().required(),
});

// Daily Horoscope Creation.
exports.DailyHoroscopeCreation = async ( req, res, next) => {
    try{
        console.log(req.body)
        const dailyHoroscope = await dailyHoroscopeSchema.validate(req.body);
        // if (dailyHoroscope.error) {
        //     console.log(dailyHoroscope.error.message);
        //     return res.json({
        //         error: true,
        //         status: 400,
        //         message: dailyHoroscope.error.message,
        //     });
        // }

        let daily = await DailyHoroscope.findOne({
            signName: dailyHoroscope.value.signName,
            date: dailyHoroscope.value.date,
            month: dailyHoroscope.value.month,
            year: dailyHoroscope.value.year,
            content: dailyHoroscope.value.content
        });
        if (daily) {
            return res.json({
                error: true,
                message: "These Details are already in use!!!!!!!!!",
                details: daily
            });
        }

        const newDailyHoroscope = new DailyHoroscope(dailyHoroscope.value);
        await newDailyHoroscope.save();

        return res.status(200).json({
            success: true,
            message: "Daily Horoscope Creation was Success",
            Daily_Horoscope: newDailyHoroscope
        });

    } 
    catch(error){
        console.error("daily-horoscope-error", error);
        return res.status(500).json({
            error: true,
            message: "Please fill all the required fields. Cannot Create This Horoscope Details!!!",
            details: error
        });
    }
}

// Delete Daily Horoscope
exports.DeleteDailyHoroscope = async (req, res) => {
    try {
        const DeleteDaiyHoroscope = await DailyHoroscope.deleteOne({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "This Daily Horoscope Deleted Successfully!",
            Response: DeleteDaiyHoroscope
        });
    } catch (err) {
        res.json({
            error: true,
            message: err
        });
    }
};

// Update Daily Horoscope
exports.UpdateDailyHoroscope = (req, res, next) => {

    const Id = req.params._id;
    
    const image = req.body.image;
    const signName = req.body.signName;
    const date = req.body.date;
    const month = req.body.month;
    const year = req.body.year;
    const content = req.body.content;
    
    DailyHoroscope.findById(Id)
        .then((dailyHoroscope) => {
            
            if (!dailyHoroscope) {
                const error = new Error("This Daily Horoscope not found!!!!!!!");
                error.statusCode = 404;
                throw error;
            }

            dailyHoroscope.image = image || dailyHoroscope.image;
            dailyHoroscope.signName = signName || dailyHoroscope.signName;
            dailyHoroscope.date = date || dailyHoroscope.date;
            dailyHoroscope.month = month || dailyHoroscope.month;
            dailyHoroscope.year = year || dailyHoroscope.year;
            dailyHoroscope.content = content || dailyHoroscope.content;

            return dailyHoroscope.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ 
                    error: false,
                    message: "This Daily Horoscope updated successfully!", 
                    DailyHoroscope: result 
                });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Get All Daily Horoscope
exports.GetAllDailyHoroscope = (req, res, next) => {
    DailyHoroscope.find({}, (err, dailyHoroscopes) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(dailyHoroscopes);
    });
};

// Get Specific Daily Horoscope By astroId
exports.getDailyHoroscopeById = async (req, res) => {
    try {
        console.log(req);
        const dailyHoroscopeById = await DailyHoroscope.findById(req.params._id);
        console.log(dailyHoroscopeById);
        return res.json(dailyHoroscopeById);
    } catch (err) {
       res.json({ message: err.message })
    }
}

// get daily horosocope by category
exports.getDailyHoroscopeByCategory = async (req, res) => {
    try {
        console.log(req);
        const dailyHoroscopeByCategory = await DailyHoroscope.find({ signName: req.params.category });
        console.log(dailyHoroscopeByCategory);
        return res.json(dailyHoroscopeByCategory);
    } catch (err) {
        res.json({ message: err.message })
    }
}

/* ===================================================== Weekly Horoscope Sections ================================================================================================================================================================================================================= */

// validations for weekly Horoscope
const weeklyHoroscopeSchema = Joi.object().keys({
    image: Joi.string().base64(),
    signName: Joi.string().required(),
    week: Joi.number().required(),
    fromDate: Joi.string().required(),
    toDate: Joi.string().required(),
    month: Joi.string().required(),
    year: Joi.string().required(),
    content: Joi.string().required(),
});

// Weekly Horoscope Creation.
exports.WeeklyHoroscopeCreation = async (req, res) => {
    try {
        console.log(req.body)
        const weeklyHoroscope = await weeklyHoroscopeSchema.validate(req.body);
        // if (weeklyHoroscope.error) {
        //     console.log(weeklyHoroscope.error.message);
        //     return res.json({
        //         error: true,
        //         status: 400,
        //         message: weeklyHoroscope.error.message,
        //     });
        // }

        let weekly = await WeeklyHoroscope.findOne({
            signName: weeklyHoroscope.value.signName,
            week: weeklyHoroscope.value.week,
            fromDate: weeklyHoroscope.value.fromDate,
            toDate: weeklyHoroscope.value.toDate,
            month: weeklyHoroscope.value.month,
            year: weeklyHoroscope.value.year,
            content: weeklyHoroscope.value.content
        });
        if (weekly) {
            return res.json({
                error: true,
                message: "These Details are already in use!!!!!!!!!",
                details: weekly
            });
        }

        const newWeeklyHoroscope = new WeeklyHoroscope(weeklyHoroscope.value);
        await newWeeklyHoroscope.save();

        return res.status(200).json({
            success: true,
            message: "Weekly Horoscope Creation was Success",
            Weekly_Horoscope: newWeeklyHoroscope
        });

    }
    catch (error) {
        console.error("weekly-horoscope-error", error);
        return res.status(500).json({
            error: true,
            message: "Please fill all the required fields. Cannot Create This Horoscope Details!!!",
            details: error
        });
    }
}

// Delete Weekly Horoscope
exports.DeleteWeeklyHoroscope = async (req, res) => {
    try {
        const DeleteWeeklyHoroscope = await WeeklyHoroscope.deleteOne({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "This Weekly Horoscope Deleted Successfully!",
            Response: DeleteWeeklyHoroscope
        });
    } catch (error) {
        res.json({
            error: true,
            message: error
        });
    }
};

// Update Weekly Horoscope
exports.UpdateWeeklyHoroscope = (req, res, next) => {

    const Id = req.params._id;

    const image = req.body.image;
    const signName = req.body.signName;
    const week = req.body.week;
    const fromDate = req.body.fromDate;
    const toDate = req.body.toDate;
    const month = req.body.month;
    const year = req.body.year;
    const content = req.body.content;

    WeeklyHoroscope.findById(Id)
        .then((weeklyHoroscope) => {

            if (!weeklyHoroscope) {
                const error = new Error("This Weekly Horoscope not found!!!!!!!");
                error.statusCode = 404;
                throw error;
            }

            weeklyHoroscope.image = image || weeklyHoroscope.image;
            weeklyHoroscope.signName = signName || weeklyHoroscope.signName;
            weeklyHoroscope.week = week || weeklyHoroscope.week;
            weeklyHoroscope.fromDate = fromDate || weeklyHoroscope.fromDate;
            weeklyHoroscope.toDate = toDate || weeklyHoroscope.toDate;
            weeklyHoroscope.month = month || weeklyHoroscope.month;
            weeklyHoroscope.year = year || weeklyHoroscope.year;
            weeklyHoroscope.content = content || weeklyHoroscope.content;

            return weeklyHoroscope.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({
                    error: false,
                    message: "This Weekly Horoscope updated successfully!",
                    DailyHoroscope: result
                });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Get All weekly Horoscope
exports.GetAllWeeklyHoroscope = (req, res, next) => {
    WeeklyHoroscope.find({}, (err, weeklyHoroscope) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(weeklyHoroscope);
    });
};

// Get Specific Weekly Horoscope By astroId
exports.getWeeklyHoroscopeById = async (req, res) => {
    try {
        console.log(req);
        const weeklyHoroscopeById = await WeeklyHoroscope.findById(req.params._id);
        console.log(weeklyHoroscopeById);
        return res.json(weeklyHoroscopeById);
    } catch (err) {
       res.json({ message: err.message })
    }
}

// get Weeky Horoscope by category
exports.getWeeklyHoroscopeByCategory = async (req, res) => {
    try {
        console.log(req);
        const weeklyHoroscopeByCategory = await WeeklyHoroscope.find({ signName: req.params.category });
        console.log(weeklyHoroscopeByCategory);
        return res.json(weeklyHoroscopeByCategory);
    } catch (err) {
        res.json({ message: err.message })
    }
}

/* ===================================================== Monthly Horoscope Sections ================================================================================================================================================================================================================= */

// Validation for Monthly Horoscope
const monthlyHoroscopeSchema = Joi.object().keys({
    image: Joi.string().base64(),
    signName: Joi.string().required(),
    month: Joi.string().required(),
    year: Joi.string().required(),
    content: Joi.string().required(),
});

// Monthly Horoscope Creation.
exports.MonthlyHoroscopeCreation = async (req, res) => {
    try {
        console.log(req.body)
        const monthlyHoroscope = await monthlyHoroscopeSchema.validate(req.body);
        // if (monthlyHoroscope.error) {
        //     console.log(monthlyHoroscope.error.message);
        //     return res.json({
        //         error: true,
        //         status: 400,
        //         message: monthlyHoroscope.error.message,
        //     });
        // }

        let monthly = await MonthlyHoroscope.findOne({
            signName: monthlyHoroscope.value.signName,
            month: monthlyHoroscope.value.month,
            year: monthlyHoroscope.value.year,
            content: monthlyHoroscope.value.content
        });
        if (monthly) {
            return res.json({
                error: true,
                message: "These Details are already in use!!!!!!!!!",
                details: monthly
            });
        }

        const newMonthlyHoroscope = new MonthlyHoroscope(monthlyHoroscope.value);
        await newMonthlyHoroscope.save();

        return res.status(200).json({
            success: true,
            message: "Monthly Horoscope Creation was Success",
            Monthly_Horoscope: newMonthlyHoroscope
        });

    }
    catch (error) {
        console.error("monthly-horoscope-error", error);
        return res.status(500).json({
            error: true,
            message: "Please fill all the required fields. Cannot Create This Horoscope Details!!!",
            details: error
        });
    }
}

// Delete Monthly Horoscope
exports.DeleteMonthlyHoroscope = async (req, res) => {
    try {
        const DeleteMonthlyHoroscope = await MonthlyHoroscope.deleteOne({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "This Monthly Horoscope Deleted Successfully!",
            Response: DeleteMonthlyHoroscope
        });
    } catch (error) {
        res.json({
            error: true,
            message: error
        });
    }
};

// Update Monthly Horoscope
exports.UpdateMonthlyHoroscope = (req, res, next) => {

    const Id = req.params._id;

    const image = req.body.image;
    const signName = req.body.signName;
    const month = req.body.month;
    const year = req.body.year;
    const content = req.body.content;

    MonthlyHoroscope.findById(Id)
        .then((monthlyHoroscope) => {

            if (!monthlyHoroscope) {
                const error = new Error("This Monthly Horoscope not found!!!!!!!");
                error.statusCode = 404;
                throw error;
            }

            monthlyHoroscope.image = image || monthlyHoroscope.image;
            monthlyHoroscope.signName = signName || monthlyHoroscope.signName;
            monthlyHoroscope.month = month || monthlyHoroscope.month;
            monthlyHoroscope.year = year || monthlyHoroscope.year;
            monthlyHoroscope.content = content || monthlyHoroscope.content;

            return monthlyHoroscope.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({
                    error: false,
                    message: "This Monthly Horoscope updated successfully!",
                    MonthlyHoroscope: result
                });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Get All monthly Horoscope
exports.GetAllMonthlyHoroscope = (req, res, next) => {
    MonthlyHoroscope.find({}, (err, monthlyHoroscope) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(monthlyHoroscope);
    });
};

// Get Specific Monthly Horoscope By astroId
exports.getMonthlyHoroscopeById = async (req, res) => {
    try {
        console.log(req);
        const monthlyHoroscopeById = await MonthlyHoroscope.findById(req.params._id);
        console.log(monthlyHoroscopeById);
        return res.json(monthlyHoroscopeById);
    } catch (err) {
       res.json({ message: err.message })
    }
}

// get MONTHLY horoscope by categories
exports.getMonthlyHoroscopeByCategory = async (req, res) => {
    try {
        console.log(req);
        const monthlyHoroscopeByCategory = await MonthlyHoroscope.find({ signName: req.params.category });
        console.log(monthlyHoroscopeByCategory);
        return res.json(monthlyHoroscopeByCategory);
    } catch (err) {
        res.json({ message: err.message })
    }
}

/* ===================================================== Yearly Horoscope Sections ================================================================================================================================================================================================================= */

// Validation for Yearly Horoscope
const yearlyHoroscopeSchema = Joi.object().keys({
    image: Joi.string().base64(),
    signName: Joi.string().required(),
    year: Joi.string().required(),
    content: Joi.string().required(),
});

// Yearly Horoscope Creation.
exports.YearlyHoroscopeCreation = async (req, res) => {
    try {
        console.log(req.body)
        const yearlyHoroscope = await yearlyHoroscopeSchema.validate(req.body);
        // if (yearlyHoroscope.error) {
        //     console.log(yearlyHoroscope.error.message);
        //     return res.json({
        //         error: true,
        //         status: 400,
        //         message: yearlyHoroscope.error.message,
        //     });
        // }

        let yearly = await YearlyHoroscope.findOne({
            signName: yearlyHoroscope.value.signName,
            year: yearlyHoroscope.value.year,
            content: yearlyHoroscope.value.content
        });
        if (yearly) {
            return res.json({
                error: true,
                message: "These Details are already in use!!!!!!!!!",
                details: yearly
            });
        }

        const newYearlyHoroscope = new YearlyHoroscope(yearlyHoroscope.value);
        await newYearlyHoroscope.save();

        return res.status(200).json({
            success: true,
            message: "Yearly Horoscope Creation was Success",
            Yearly_Horoscope: newYearlyHoroscope
        });

    }
    catch (error) {
        console.error("yearly-horoscope-error", error);
        return res.status(500).json({
            error: true,
            message: "Please fill all the required fields. Cannot Create This Horoscope Details!!!",
            details: error
        });
    }
}

// Delete Yearly Horoscope
exports.DeleteYearlyHoroscope = async (req, res) => {
    try {
        const DeleteYearlyHoroscope = await YearlyHoroscope.deleteOne({
            _id: req.params._id
        });
        res.json({
            error: false,
            message: "This Yearly Horoscope Deleted Successfully!",
            Response: DeleteYearlyHoroscope
        });
    } catch (error) {
        res.json({
            error: true,
            message: error
        });
    }
};

// Update Monthly Horoscope
exports.UpdateYearlyHoroscope = (req, res, next) => {

    const Id = req.params._id;

    const image = req.body.image;
    const signName = req.body.signName;
    const year = req.body.year;
    const content = req.body.content;

    YearlyHoroscope.findById(Id)
        .then((yearlyHoroscope) => {

            if (!yearlyHoroscope) {
                const error = new Error("This Yearly Horoscope not found!!!!!!!");
                error.statusCode = 404;
                throw error;
            }

            yearlyHoroscope.image = image || yearlyHoroscope.image;
            yearlyHoroscope.signName = signName || yearlyHoroscope.signName;
            yearlyHoroscope.year = year || yearlyHoroscope.year;
            yearlyHoroscope.content = content || yearlyHoroscope.content;

            return yearlyHoroscope.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({
                    error: false,
                    message: "This Yearly Horoscope updated successfully!",
                    YearlyHoroscope: result
                });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// Get All yearly Horoscope
exports.GetAllYearlyHoroscope = (req, res, next) => {
    YearlyHoroscope.find({}, (err, yearlyHoroscope) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(yearlyHoroscope);
    });
};

// Get Specific Daily Horoscope By Id
exports.getYearlyHoroscopeById = async (req, res) => {
    try {
        console.log(req);
        const yearlyHoroscopeById = await YearlyHoroscope.findById(req.params._id);
        console.log(yearlyHoroscopeById);
        return res.json(yearlyHoroscopeById);
    } catch (err) {
       res.json({ message: err.message })
    }
}

// get yearly horoscope by categories
exports.getYearlyHoroscopeByCategory = async (req, res) => {
    try {
        console.log(req);
        const yearlyHoroscopeByCategory = await YearlyHoroscope.find({ signName: req.params.category });
        console.log(yearlyHoroscopeByCategory);
        return res.json(yearlyHoroscopeByCategory);
    } catch (err) {
        res.json({ message: err.message })
    }
}

//Validate user schema
const bannerSchema = Joi.object().keys({
    bannerName: Joi.string().required(),
    bannerImage: Joi.string().required(),
    active: Joi.boolean().required()
});
// // Upload Banner Section
exports.uploadBanner = async (req, res) => {
    try {
        console.log(req.body)
        const result = bannerSchema.validate(req.body);
        if (result.error) {
            console.log(result.error.message);
            return res.json({
                error: true,
                status: 400,
                message: result.error.message,
            });
        }

        const newBanner = new Banner(result.value);
        await newBanner.save();

        return res.status(200).json({
            success: true,
            message: "Upload Success",
            admin: newBanner
        });
    } catch (error) {
        console.error("signup-error", error);
        return res.status(500).json({
            error: true,
            message: "Cannot Upload",
            details: "error"
        });
    }
};

// Update banner
exports.updateBanner = (req, res, next) => { 
    const Id = req.params.id;
    const bannerImage = req.body.bannerImage;
    const bannerName = req.body.bannerName;
    const active = req.body.active;

    Banner.findById(Id)
        .then((banner) => {
            if (!banner) {
                const error = new Error("Banner not found.");
                error.statusCode = 404;
                throw error;
            }
            
            banner.bannerImage = bannerImage || banner.bannerImage;
            banner.bannerName = bannerName || banner.bannerName;
            banner.active = active || banner.active;

            return banner.save();
        })
        .then((result) => {
            res
                .status(200)
                .json({ message: "Banner updated!", banner: result });
        })
        .catch((err) => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

// get all banner
exports.getBanners = (req, res, next) => {
    Banner.find({}, (err, banners) => {
        if (err) return res.status(400).send(err);
        res.status(200).send(banners);
    });
};

// exports.getAllImages = (req, res) => {
//     imgModel.find({}, (err, items) => {
//         if (err) {
//             console.log(err);
//             res.status(500).send('An error occurred', err);
//         }
//         else {
//             res.render('imagesPage', { items: items });
//         }
//     });
// }


// exports.uploadFiles = async (req, res) => {
//     try {
//         await upload(req, res);
//         console.log(req.files);

//         if (req.files.length <= 0) {
//             return res
//                 .status(400)
//                 .send({ message: "You must select at least 1 file." });
//         }

//         return res.status(200).send({
//             message: "Files have been uploaded.",
//         });

//         // console.log(req.file);

//         // if (req.file == undefined) {
//         //   return res.send({
//         //     message: "You must select a file.",
//         //   });
//         // }

//         // return res.send({
//         //   message: "File has been uploaded.",
//         // });
//     } catch (error) {
//         console.log(error);

//         if (error.code === "LIMIT_UNEXPECTED_FILE") {
//             return res.status(400).send({
//                 message: "Too many files to upload.",
//             });
//         }
//         return res.status(500).send({
//             message: `Error when trying upload many files: ${error}`,
//         });

//         // return res.send({
//         //   message: "Error when trying upload image: ${error}",
//         // });
//     }
// };

//get all image list
// exports.getListFiles = async (req, res) => {
//     try {
//         await mongoClient.connect();

//         const database = mongoClient.db();
//         const images = database.collection("banners" + ".files");

//         const cursor = images.find({});

//         if ((await cursor.count()) === 0) {
//             return res.status(500).send({
//                 message: "No files found!",
//             });
//         }

//         let fileInfos = [];
//         await cursor.forEach((doc) => {
//             fileInfos.push({
//                 name: doc.filename,
//                 url: baseUrl + doc.filename,
//             });
//         });

//         return res.status(200).send(fileInfos);
//     } catch (error) {
//         console.log(error)
//         return res.status(500).json({
//             message: error.message,
//         });
//     }
// };

//Images to view
// exports.download = async (req, res) => {
//     try {
//         await mongoClient.connect();

//         const database = mongoClient.db();
//         const bucket = new GridFSBucket(database, {
//             bucketName: "banners",
//         });

//         let downloadStream = bucket.openDownloadStreamByName(req.params.name);

//         downloadStream.on("data", function (data) {
//             return res.status(200).write(data);
//         });

//         downloadStream.on("error", function (err) {
//             return res.status(404).send({ message: "Cannot download the Image!" });
//         });

//         downloadStream.on("end", () => {
//             return res.end();
//         });
//     } catch (error) {
//         return res.status(500).send({
//             message: error.message,
//         });
//     }
// };

// update user wallet


exports.updateUserWallet = (req, res, next) => {

    // try updating user in postman by userid  

    const userId = req.params.id;

    const wallet = req.body.wallet;

    User.findById(userId)
        .then((user) => {
            if (!user) {
                const error = new Error("User not found.");
                error.statusCode = 404;
                throw error;
            }

            user.wallet =  user.wallet + wallet || user.wallet;

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

exports.updateAstroWallet = (req, res, next) => {

    // try updating user in postman by userid  

    const astroId = req.params.id;

    const wallet = req.body.wallet;

    Astro.findById(astroId)
        .then((astro) => {
            if (!astro) {
                const error = new Error("astro not found.");
                error.statusCode = 404;
                throw error;
            }

            astro.wallet = astro.wallet + wallet || astro.wallet;

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