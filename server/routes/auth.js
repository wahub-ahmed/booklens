// Adapted from the official passport.js tutorial

var express = require('express');
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local');
var crypto = require('crypto');

// Configuring the local strategy for passport.js
passport.use(new LocalStrategy(function verify(username, password, cb) {
    db.get('SELECT * FROM users WHERE username = ?', [ username ], function(err, row) {
      if (err) { return cb(err); }
      if (!row) { return cb(null, false, { message: 'Incorrect username or password.' }); }
      
      crypto.pbkdf2(password, row.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
        if (err) { return cb(err); }
        if (!crypto.timingSafeEqual(row.hashed_password, hashedPassword)) {
          return cb(null, false, { message: 'Incorrect username or password.' });
        }
        return cb(null, row);
      });
    });
  }));

router.post('/login', passport.authenticate('local', {
    successRedirect: 'http://localhost:3000',
    failureRedirect: 'http://localhost:3000/login'
}))

module.exports = router;