var passport = require('passport');
var GithubStrategy = require('passport-github').Strategy;

var CONFIG = require('../../config/config');
var AuthService = require('../auth.service');

exports.setup = function (io) {
    passport.use(new GithubStrategy(
        {
            clientID: CONFIG.SOCIAL_NETWORKS.githubAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.githubAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.githubAuth.callbackURL,
            scope: ['user:email']
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var email = profile.emails.find(function(item) {
                    return item.primary && item.verified;
                }).value;
                var names = profile.displayName.split(" ");
                var first_name = "", last_name = "";
                if (names.length == 1) {
                    first_name = profile.displayName;
                } else {
                    first_name = names.slice(0, -1).join(' ');
                    last_name = names.slice(-1).join(' ');
                }

                AuthService.handleSocialLogin('Github', {
                    email: email,
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