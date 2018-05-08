var passport = require('passport');
var TwitterStrategy = require('passport-twitter').Strategy;

var CONFIG = require('../../config/config');
var AuthService = require('../auth.service');

exports.setup = function (io) {
    passport.use(new TwitterStrategy(
        {
            consumerKey: CONFIG.SOCIAL_NETWORKS.twitterAuth.clientID,
            consumerSecret: CONFIG.SOCIAL_NETWORKS.twitterAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.twitterAuth.callbackURL,
            userProfileURL: "https://api.twitter.com/1.1/account/verify_credentials.json?include_email=true"
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var names = profile.displayName.split(" ");
                var first_name = "", last_name = "";
                if (names.length == 1) {
                    first_name = profile.displayName;
                } else {
                    first_name = names.slice(0, -1).join(' ');
                    last_name = names.slice(-1).join(' ');
                }

                AuthService.handleSocialLogin('Twitter', {
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