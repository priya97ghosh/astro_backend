require('dotenv').config();

const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;

const User = require('../models/user_model');

// serializing User
passport.serializeUser((user, done) => {
    done(null, user.id);
});

// deserializing user
passport.deserializeUser((id, done) => {
    User.findById(id).then((user) => {
        done(null, user);
    });
});


passport.use(
    new GoogleStrategy({
        // options for google strategy
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: '/auth/google/redirect'
    }, (accessToken, refreshToken, profile, done) => {
        // passport callback function
        console.log('passport callback function fired for google:');
        console.log(profile);

        User.findOne({ googleId: profile.id }).then((currentUser) => {
            if (currentUser) {
                // already have this user
                console.log('user is: ', currentUser);
                done(null, currentUser);
                // do something

                // return res.json({
                //     message: "user already exist",
                //     currentUser: currentUser
                // })
            } else {
                // if not, create user in our db
                return new User({
                    googleId: profile.id,
                    googleUserName: profile.displayName,
                    firstName: profile.name.givenName,
                    lastName: profile.name.familyName,
                    image: profile.photos[0].value,
                    email: profile.emails[0].value
                }).save().then((newUser) => {
                    console.log('new user created: ', newUser);
                    done(null, newUser);

                    // return res.json({
                    //     message: "New user registered",
                    //     newUser: newUser
                    // })
                });
            }
        });

    })
);


// Facebook

passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: "/auth/facebook/callback"
},
    function (accessToken, refreshToken, profile, done) {
        
        console.log('passport callback function fired for facebook:');
        console.log(profile);

        return done(null, profile);

        // User.findOrCreate({ facebookId: profile.id }, function (err, user) {
        //     return cb(err, user);
        // });
        // User.findOne({ facebookId: profile.id }).then((currentUser) => {
        //     if (currentUser) {
        //         // already have this user
        //         console.log('user is: ', currentUser);
        //         done(null, currentUser);
        //         // do something

        //         // return res.json({
        //         //     message: "user already exist",
        //         //     currentUser: currentUser
        //         // })
        //     } else {
        //         // if not, create user in our db
        //         return new User({
        //             googleId: profile.id,
        //             googleUserName: profile.displayName,
        //             firstName: profile.name.givenName,
        //             lastName: profile.name.familyName,
        //             image: profile.photos[0].value,
        //             email: profile.emails[0].value
        //         }).save().then((newUser) => {
        //             console.log('new user created: ', newUser);
        //             done(null, newUser);

        //             // return res.json({
        //             //     message: "New user registered",
        //             //     newUser: newUser
        //             // })
        //         });
        //     }
        // });

    }
));