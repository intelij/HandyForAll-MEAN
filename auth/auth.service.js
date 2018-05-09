var otp = require('otplib/lib/authenticator');
var bcrypt = require('bcrypt-nodejs');
var mongoose = require("mongoose");

var logger = require('../config/logger');
var db = require('../controller/adaptor/mongodb.js');
var library = require('../model/library.js');

var secret = otp.utils.generateSecret();

function handleSocialLogin(provider, objUserInfo, io, callback) {
    var userLibrary = require('../model/user.js')(io);

    db.GetOneDocument('users', { 'email': objUserInfo.email }, {}, {}, function(err, objUser) {
        if (err) {
            return callback(err);
        } else if (!objUser) {
            logger.info('A user is signing up using ' + provider + ' account', objUserInfo.email);

            db.GetOneDocument('settings', { 'alias': 'sms' }, {}, {}, function(err, smsdocdata) {
                if (err) {
                    return callback(err);
                } else {
                    var newUser = {};
                    var today = Date.now();

                    newUser.unique_code = library.randomString(8, '#A');
                    newUser.username = objUserInfo.username;
                    newUser.email = objUserInfo.email;
                    newUser.password = bcrypt.hashSync(objUserInfo.email, bcrypt.genSaltSync(8), null);
                    newUser.role = 'user';
                    newUser.status = 1;
                    newUser.name = {
                        'first_name': objUserInfo.first_name,
                        'last_name': objUserInfo.last_name
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
                            return callback(err);
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
                                    return callback(err);
                                } else {
                                    return callback(null, response, { message: 'Login Success' });
                                }
                            });
                        }
                    });
                }
            });
        } else {
            logger.info('A user is signing in using ' + provider + ' account', objUserInfo.email);

            return callback(null, objUser);
        }
    });
}

function handleLocalLogin(req, res) {
    req.session.passport = req.session.passport || {};

    req.session.passport.user = req.user;
    req.session.passport.header = req.user.token;

    global.name = req.session.passport.user._id;

    res.cookie('username', req.session.passport.header || req.session.passport.user.token);

    res.send({
        user: req.session.passport.user.username,
        email: req.session.passport.user.email,
        user_id: req.session.passport.user._id,
        token: req.session.passport.header,
        user_type: req.session.passport.user.role,
        tasker_status: req.session.passport.user.tasker_status,
        status: req.session.passport.user.status,
        verification_code: req.session.passport.user.verification_code,
        phone: !req.session.passport.user.phone ? "" : req.session.passport.user.phone.number
    });
}

module.exports = {
    "handleSocialLogin": handleSocialLogin,
    "handleLocalLogin": handleLocalLogin
};