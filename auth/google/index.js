'use strict';
var express = require('express');
var passport = require('passport');

var router = express.Router();

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
        session: false
    }),function(req, res){
        req.session.user = {
            id: req.user._id,
            email: req.user.email,
        };
        req.session.firstVisit = req.user.firstVisit;
        req.session.isUserLocal = false;
        res.redirect('/bookmarks');
    });

module.exports = router;