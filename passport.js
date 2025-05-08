const passport    = require('passport');
const passportJWT = require("passport-jwt");

const ExtractJWT = passportJWT.ExtractJwt;

const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy   = passportJWT.Strategy;

// Sign in
passport.use(new LocalStrategy({
        usernameField: 'email'
    },
    (email, password, done) => {

        // get username and password from db, check with input username and password
        // return UserModel.findOne({email, password})
        //     .then(user => {
        //         if (!user) {
        //             return done(null, false, {message: 'Incorrect email or password.'});
        //         }

        //         return done(null, user, {
        //             message: 'Logged In Successfully'
        //         });
        //     })
        //     .catch(err => {
        //         return done(err);
        //     });
    }
));


// JWT authd

passport.use(new JWTStrategy({
        jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
        secretOrKey   : 'abcdefghijklmnopqrstuvwxyz'
    },
    (jwtPayload, done) => {
        // check the payload id to see if it is a person in the database?console.log(jwtPayload)
    }
));