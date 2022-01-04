const express = require('express');
const router = express.Router();

const adminController = require('../controllers/admin_controller');


// This is for Admin Routes
router.post('/register', adminController.Signup);
router.post('/login', adminController.Login);
router.get("/logout", adminController.Logout);
router.patch("/forgot", adminController.ForgotPassword);
router.patch("/reset", adminController.ResetPassword);
router.delete('/delete-admin/:_id', adminController.deleteAdmin);

// This is for Astro Routes
router.post('/astro-creation', adminController.astroSignup);
// router.delete('/delete-astro/:_id', adminController.deleteAstro)
// router.put('/update-astro/:_id', adminController.updateAstro)
// router.get('/get-astro/:_id', adminController.getAstro) //specific id
// router.get('/get-all-astro', adminController.getAstros)

// This is for Horoscope
// These route is for get daily, weekly, monthly, yearly
// For Daily
router.get('/get-all-daily-horoscope', adminController.GetAllDailyHoroscope);
// For Weekly
router.get('/get-all-weekly-horoscope', adminController.GetAllWeeklyHoroscope);
// For Monthly
router.get('/get-all-monthly-horoscope', adminController.GetAllMonthlyHoroscope);
// For Yearly
router.get('/get-all-yearly-horoscope', adminController.GetAllYearlyHoroscope);

// These route is for create daily, weekly, monthly, yearly 
// For Daily
router.post('/daily-horoscope-creation', adminController.DailyHoroscopeCreation);
// For Weekly
router.post('/weekly-horoscope-creation', adminController.WeeklyHoroscopeCreation);
// For Monthly
router.post('/monthly-horoscope-creation', adminController.MonthlyHoroscopeCreation);
// For Yearly
router.post('/yearly-horoscope-creation', adminController.YearlyHoroscopeCreation);

// These route is for delete daily, weekly, monthly, yearly by ID
// For Daily
router.delete('/delete-daily-horoscope/:_id', adminController.DeleteDailyHoroscope);
// For Weekly
router.delete('/delete-weekly-horoscope/:_id', adminController.DeleteWeeklyHoroscope);
// For Monthly
router.delete('/delete-monthly-horoscope/:_id', adminController.DeleteMonthlyHoroscope);
// For Yearly
router.delete('/delete-yearly-horoscope/:_id', adminController.DeleteYearlyHoroscope);

// These route is for update daily, weekly, monthly, yearly by ID
// For Daily
router.put('/update-daily-horoscope/:_id', adminController.UpdateDailyHoroscope);
// For Weekly
router.put('/update-weekly-horoscope/:_id', adminController.UpdateWeeklyHoroscope);
// For Monthly
router.put('/update-monthly-horoscope/:_id', adminController.UpdateMonthlyHoroscope);
// For Yearly
router.put('/update-yearly-horoscope/:_id', adminController.UpdateYearlyHoroscope);

// These route is for get daily, weekly, monthly, yearly by ID
// For Daily
router.get('/get-daily-horoscope/:_id', adminController.getDailyHoroscopeById);
// For Weekly
router.get('/get-weekly-horoscope/:_id', adminController.getWeeklyHoroscopeById);
// For Monthly
router.get('/get-monthly-horoscope/:_id', adminController.getMonthlyHoroscopeById);
// For Yearly
router.get('/get-yearly-horoscope/:_id', adminController.getYearlyHoroscopeById);

// These route is for get daily, weekly, monthly, yearly by category
// For Daily
router.get('/get-all-daily-horoscope/:category', adminController.getDailyHoroscopeByCategory);
// For Weekly
router.get('/get-all-weekly-horoscope/:category', adminController.getWeeklyHoroscopeByCategory);
// For Monthly
router.get('/get-all-monthly-horoscope/:category', adminController.getMonthlyHoroscopeByCategory);
// For Yearly
router.get('/get-all-yearly-horoscope/:category', adminController.getYearlyHoroscopeByCategory);

// For upload Banner
router.post('/upload-banner', adminController.uploadBanner);
// router.get("/banners", adminController.getListFiles);
// router.get("/banners/:name", adminController.download);
router.get('/get-all-banner', adminController.getBanners);
router.put('/update-banner/:id', adminController.updateBanner);
// ---------------------------------------------------------------Walllets -------------------------------------------------

// add amount in user wallet
router.post('/add-amount-user/:id', adminController.updateUserWallet);

// add amount in astro wallet
router.post('/add-amount-astro/:id', adminController.updateAstroWallet);


module.exports = router;
