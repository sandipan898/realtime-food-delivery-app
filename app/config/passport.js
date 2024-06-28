const User = require('../models/user');
const bcrypt = require('bcrypt')
const LocalStrategy = require('passport-local').Strategy;

module.exports = init = (passport) => {
    passport.use(new LocalStrategy({ usernameField: 'email' }, async(email, password, done) => {
        // Login
        // Check if email exists
        const user = await User.findOne({ email })
        if(!user) {
            return done(null, false, { message: 'User does not exists with this email!'})
        }

        bcrypt.compare(password, user.password)
            .then(match => {
                if(match) {
                    return done(null, user, { message: 'Logged in successfully!'})
                }
                return done(null, false, { message: 'Wrong username or password!'})
            }).catch(err => {
                return done(null, user, { message: 'Something went wrong!'})
            })
    }))

    passport.serializeUser((user, done) => {
        done(null, user._id)
    })

    passport.deserializeUser((id, done) => {
        User.findById(id).then((user) => {
            done(null, user)
        }).catch(err => {
            done(err, false)
        })
    })

}