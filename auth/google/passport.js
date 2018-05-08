var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var otp = require('otplib/lib/authenticator');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require("mongoose");

var logger = require('../../config/logger');
var CONFIG = require('../../config/config');
var db = require('../../controller/adaptor/mongodb.js');
var library = require('../../model/library.js');

var secret = otp.utils.generateSecret();

exports.setup = function (io) {
    var userLibrary = require('../../model/user.js')(io);

    passport.use(new GoogleStrategy({
            clientID: CONFIG.SOCIAL_NETWORKS.googleAuth.clientID,
            clientSecret: CONFIG.SOCIAL_NETWORKS.googleAuth.clientSecret,
            callbackURL: CONFIG.SOCIAL_NETWORKS.googleAuth.callbackURL
        },
        function(accessToken, refreshToken, profile, done) {
            if (profile.emails && profile.emails.length){
                var email = profile.emails[0].value;

                db.GetOneDocument('users', { 'email': email }, {}, {}, function(err, objUser) {
                    if (err) {
                        return done(err);
                    } else if (!objUser) {
                        logger.info('A user is signing up using Google account', email);

                        db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {}, function(err, smsdocdata) {
                            if (err) {
                                res.send(err);
                            } else {
                                var newUser = {};
                                var today = Date.now();

                                newUser.unique_code = library.randomString(8, '#A');
                                newUser.username = email;
                                newUser.email = email;
                                newUser.password = bcrypt.hashSync(email, bcrypt.genSaltSync(8), null);
                                newUser.role = 'user';
                                newUser.status = 1;
                                newUser.name = {
                                    'first_name': profile.name.givenName,
                                    'last_name': profile.name.familyName
                                };
                                newUser.activity = {
                                    'created': today,
                                    'modified': today,
                                    'last_login': today,
                                    'last_logout': today
                                };

                                if (smsdocdata && smsdocdata.settings && smsdocdata.settings.twilio && smsdocdata.settings.twilio.mode == 'production')
                                    newUser.verification_code = [{ "mobile": otp.generate(secret) }];

                                userLibrary.userRegister({ 'newUser': newUser, 'smsdocdata': smsdocdata }, function(err, response) {
                                    if (err || !response) {
                                        return done(err);
                                    } else {
                                        db.InsertDocument('walletReacharge', {
                                            'user_id': response._id,
                                            "total": 0,
                                            'type': 'wallet',
                                            "transactions": [{
                                                'credit_type': 'Welcome',
                                                'ref_id': '',
                                                'trans_amount': 0,
                                                'trans_date': today,
                                                'trans_id': mongoose.Types.ObjectId()
                                            }]
                                        }, function(err) {
                                            if (err) {
                                                return done(err);
                                            } else {
                                                return done(null, response, { message: 'Login Success' });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    } else {
                        return done(null, objUser);
                    }
                });
            } else{
                return done('No email provided!');
            }
        }
    ));
};