var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var logger = require('../../config/logger');
var CONFIG = require('../../config/config');
var db = require('../../controller/adaptor/mongodb.js');

exports.setup = function () {
    passport.use(new GoogleStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.googleAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.googleAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.googleAuth.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var email = profile.emails[0].value;
                //db.getUserByProviderId("google",profile.id)
                db.getUserByProviderEmail('google', email)
                    logger.error('Hey');
            } else{
                return done('No email provided!');
            }
        }
    ));
};