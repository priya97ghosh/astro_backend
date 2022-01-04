const express = require('express');
const router = express.Router();

const passport = require('passport');

// auth login
router.get('/login', (req, res) => {
    res.render('login', { user: req.user });
});

// auth logout
router.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
    // res.json({
    //     message: "user loged out"
    // })
});

// auth with google
router.get('/google', passport.authenticate('google', {
    scope: ['profile', 'email']
}
));


// auth with facebook
router.get('/facebook', passport.authenticate('facebook', 
{ 
    scope: ['public_profile', 'email']
}
));


// callback route for google to redirect to
router.get('/google/redirect', passport.authenticate('google'), (req, res) => {
    // res.send('you reached the redirect URI');
    // res.json({
    //     message: "You have reached the redirected URI",
    //     profile: req.user
    // });
    res.redirect('/auth/profile');
});


// callback route for google to redirect to
router.get('/facebook/callback', passport.authenticate('facebook', { failureRedirect: '/auth/login' }),
    function (req, res) {
        // Successful authentication, redirect home.
        res.redirect('/auth/profile');
    }
);


const authCheck = (req, res, next) => {
    if (!req.user) {
        res.redirect('/auth/login');
    } else {
        next();
    }
};

router.get('/profile', authCheck, (req, res) => {
    res.render('profile', { user: req.user });
});

module.exports = router;