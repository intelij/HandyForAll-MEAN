'use strict';
var express = require('express');
var passport = require('passport');
var jwt = require('jsonwebtoken');

var CONFIG = require('../../config/config');

var router = express.Router();

function jwtSign(payload) {
    var token = jwt.sign(payload, CONFIG.SECRET_KEY);
    return token;
}

router
    .get('/', passport.authenticate('google', {
        failureRedirect: '/signup',
        scope: [
            'https://www.googleapis.com/auth/userinfo.profile',
            'https://www.googleapis.com/auth/userinfo.email'
        ],
        session: false
    }))
    .get('/callback', passport.authenticate('google', {
        failureRedirect: '/signup',
        session: true
    }), function(req, res){
        var authHeader = jwtSign({ username: req.user.username });

        req.session.passport = {
            user: req.user,
            header: authHeader
        };

        res.redirect('/');
    });

module.exports = router;