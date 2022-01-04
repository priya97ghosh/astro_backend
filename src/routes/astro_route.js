
const express = require('express');
const router = express.Router();

const astroController = require('../controllers/astro_controller');

router.post('/login', astroController.Login);
router.get("/logout", astroController.Logout);

router.delete('/delete-astro/:_id', astroController.deleteAstro)
router.put('/update-astro/:_id', astroController.updateAstro)
router.get('/get-astro/:_id', astroController.getAstro) //specific id
router.get('/get-all-astro', astroController.getAstros)

// router.patch("/forgot", astroController.ForgotPassword);
// router.patch("/reset", astroController.ResetPassword);

module.exports = router;