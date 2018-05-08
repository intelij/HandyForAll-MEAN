var passport = require('passport');
var LinkedInStrategy = require('passport-linkedin').Strategy;

var CONFIG = require('../../config/config');
var AuthService = require('../auth.service');

exports.setup = function (io) {
    passport.use(new LinkedInStrategy(
        {
            consumerKey: CONFIG.SOCIAL_NETWORKS.linkedinAuth.clientID,
            consumerSecret: CONFIG.SOCIAL_NETWORKS.linkedinAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.linkedinAuth.callbackURL,
            scope: ['r_emailaddress', 'r_basicprofile'],
            profileFields: ['id', 'first-name', 'last-name', 'email-address']
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var email = profile.emails[0].value;
                var first_name = "", last_name = "";

                if (profile.name && profile.name.givenName) {
                    first_name = profile.name.givenName;
                    last_name = profile.name.familyName;
                } else {
                    var names = profile.displayName.split(" ");

                    if (names.length == 1) {
                        first_name = profile.displayName;
                    } else {
                        first_name = names.slice(0, -1).join(' ');
                        last_name = names.slice(-1).join(' ');
                    }
                }

                AuthService.handleSocialLogin('LinkedIn', {
                    email: email,
                    first_name: first_name,
                    last_name: last_name,
                    username: email.replace(/@.*$/, "")
                }, io, done);
            } else{
                return done('No email provided!');
            }
        }
    ));
};