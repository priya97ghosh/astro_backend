const express = require('express');
const router = express.Router();

const userController = require('../controllers/user_controller');


router.post('/register', userController.Signup);
router.post('/login', userController.Login);

router.get('/get-all-users', userController.getUsers);
router.get('/get-user/:_id', userController.getUser);

router.patch('/activate', userController.Activate);

router.put('/update-profile/:_id', userController.updateProfile);

router.delete('/delete-user/:_id', userController.deleteUser);

// define forgot password endpoint
router.patch("/forgot", userController.ForgotPassword);

// define request reset password endpoint
router.patch('/request-reset-password', userController.ForgotPassword);

// Define reset password endpoint
router.patch("/reset", userController.ResetPassword);

// Define Logout Endpoint
router.get("/logout", userController.Logout);




module.exports = router;