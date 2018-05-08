var passport = require('passport');
var FacebookStrategy = require('passport-facebook').Strategy;

var CONFIG = require('../../config/config');
var AuthService = require('../auth.service');

exports.setup = function (io) {
    passport.use(new FacebookStrategy(
        {
            clientID: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.facebookAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.facebookAuth.callbackURL,
            profileFields: ['id', 'displayName', 'name', 'email']
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
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

                AuthService.handleSocialLogin('Facebook', {
                    email: profile.emails[0].value,
                    first_name: first_name,
                    last_name: last_name,
                    username: profile.username
                }, io, done);
            } else{
                return done('No email provided!');
            }
        }
    ));
};