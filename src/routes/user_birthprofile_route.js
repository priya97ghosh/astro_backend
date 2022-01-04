const express = require('express');
const router = express.Router();

const userBirthProfileController = require('../controllers/user_birthprofile_controller');
const { getUser } = require('../controllers/user_controller');

router.post('/create-user-birth-profile', userBirthProfileController.UserBirthProfileCreation);

router.get('/get-all-birth-profile', userBirthProfileController.GetAllBirthProfile);

router.get('/get-birth-profile/:user', userBirthProfileController.getBirthProfileByUserId);



module.exports = router;