var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var CONFIG = require('../../config/config');
var AuthService = require('../auth.service');

exports.setup = function (io) {
    passport.use(new GoogleStrategy(
        {
            clientID: CONFIG.SOCIAL_NETWORKS.googleAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.googleAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.googleAuth.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var email = profile.emails[0].value;

                AuthService.handleSocialLogin('Google', {
                    email: email,
                    first_name: profile.name.givenName,
                    last_name: profile.name.familyName,
                    username: email.replace(/@.*$/, "")
                }, io, done);
            } else{
                return done('No email provided!');
            }
        }
    ));
};