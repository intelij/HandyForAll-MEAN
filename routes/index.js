"use strict";

var CONFIG = require('../config/config');
var db = require('../controller/adaptor/mongodb.js');
var AuthService = require('../auth/auth.service');

/**
function isAdminAuth (req, res, next) {
  try {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.send('wrong');
    }
  } catch (ex) {
    console.log("Login authenticate error", ex);
  }
}
//*/

/**
 function isSiteAuth(req, res, next) {
    try {
        if (req.isAuthenticated()) {
            return next();
        } else {
            res.send('wrong');
        }
    } catch (ex) {
        console.log("Login authenticate error", ex);
    }
}
 //*/

function validationLoginUser(req, res, next) {
  req.checkBody('username', ' Username is required').notEmpty();
  req.checkBody('firstname', ' firstname is required').notEmpty();
  req.checkBody('email', ' Valid email is required').isEmail();
  req.checkBody('address.city', 'city is required').notEmpty();
  req.checkBody('pwd', ' Password is required').notEmpty();
  req.checkBody('confirm_pwd', ' Confirm password should match the password you entered').notEmpty();

  var errors = req.validationErrors();

  if (errors) {
    res.status(400).send(errors);
    return;
  }

  next();
}

module.exports = function (app, passport, io) {
  try {
    app.use('/auth', require('../auth')(io));

    require('./auth.js')(passport, io);

    app.get('/admin', function (req, res) {
      var settings = {};
      settings.googleMapAPI = CONFIG.GOOGLE_MAP_API_KEY;
      res.render('admin/layout', settings);
    });
    app.post('/admin', passport.authenticate('adminLogin', {
      failureRedirect: '/admin-logouts',
      failureFlash: true
    }), function (req, res) {
      req.session.passport = req.session.passport || {};

      req.session.passport.user = req.user;
      req.session.passport.header = req.user.token;

      res.cookie('username', req.session.passport.header);

      res.send({ user: req.session.passport.user.username, token: req.session.passport.header });
    });

    app.get('/admin-logouts', function (req, res) {
      res.cookie('username', 'wrong');
      res.send(req.session.flash.error);
    });

    app.post('/site', passport.authenticate('local-site-login', {
      failureRedirect: '/site-failure',
      failureFlash: true
    }), AuthService.handleLocalLogin);

    app.post('/site/taskerlogin', passport.authenticate('local-taskersite-login', {
      failureRedirect: '/tasker-error',
      failureFlash: true
    }), AuthService.handleLocalLogin);

    // This is also used to get the current user.
    app.get('/site-success', function (req, res) {
      if (req.session.passport && req.session.passport.user) {
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
      } else {
        res.send(null);
      }
    });

    app.post('/siteregister', validationLoginUser, passport.authenticate('site-register', {
      successRedirect: '/site-success',
      failureRedirect: '/site-failure',
      failureFlash: true
    }));


    // app.get('/auth/facebook', passport.authenticate('facebook', { scope: ["email", "user_location"] }));

    // app.get('/auth/facebook/callback',
    //     passport.authenticate('facebook', {
    //         successRedirect: '/auth/success',
    //         failureRedirect: '/auth/failure',
    //         failureFlash: true
    //     }));

    // app.get('/auth/success', function(req, res) {
    //     global.name = req.session.passport.user.user._id;
    //     if (!req.session.passport.user.user.role) {
    //         req.session.passport.user.user.role = "user"
    //     }
    //     res.cookie('username', req.session.passport.header);
    //     res.render('site/after_auth', {
    //         username: req.session.passport.user.user.username,
    //         email: req.session.passport.user.user.email,
    //         _id: req.session.passport.user.user._id,
    //         role: req.session.passport.user.user.role,
    //         token: req.session.passport.user.header,
    //         avatar: req.session.passport.user.user.avatar
    //     });
    // });
    //
    // app.get('/auth/failure', function(req, res) {
    //     res.render('site/auth_fail', { err: req.session.flash });
    // });

    /*
    app.post('/facebookregister', passport.authenticate('facebook-register', {
        successRedirect: '/site-success',
        failureRedirect: '/site-failure',
        failureFlash: true
    }));
    */

    app.post('/site/taskerregister', passport.authenticate('tasker-register', {
      successRedirect: '/site-success',
      failureRedirect: '/site-failure',
      failureFlash: true
    }));

    app.get('/site-failure', function (req, res) {
      console.log("failure", req.session.flash);
      console.log("failure", req.session.flash.Error);

      var error = "";

      if (req.session.flash.Error) {
        error = req.session.flash.Error[0];
      } else if (req.session.flash.error) {
        error = req.session.flash.error[0];
      }
      req.session.destroy(function () {
        res.send(error);
      });
    });

    app.get('/admin-logout', function (req, res) {
      req.session.destroy(function (err) {
        if (err) {
          console.log(err);
        } else {
          res.send({
            retStatus: "Success",
            redirectTo: '/admin',
            msg: 'Just go there please'
          });
        }
      });
    });

    app.post('/site-logout', function (req, res) {
      var roles = req.body.currentUser.user_type;
      var userid = req.body.currentUser.user_id;
      if (roles) {
        var model = 'user';
        if (roles === 'user') {
          model = 'users';
        } else if (roles === 'tasker') {
          model = 'tasker';
        }
        db.UpdateDocument(model, { '_id': userid }, { 'activity.last_logout': new Date() }, {}, function() {
          req.session.destroy(function () {
            res.send('success');
          });
        });
      }
    });

    app.get('/tasker-error', function (req, res) {
      var error = req.session.flash.error[0] || 'Login Error';
      req.session.destroy(function () {
        res.send({ message: error });
      });
    });

    // app.post('/facebookregister', passport.authenticate('facebooksite-register', {
    //     successRedirect: '/site-success',
    //     failureRedirect: '/site-failure',
    //     failureFlash: true
    // }));

    if (CONFIG.MOBILE_API) {
      require('../routes/mobile.js')(app, io);
    }

    require('../routes/site.js')(app, io);
    require('../routes/admin.js')(app, io);

    app.get('/*', function (req, res) {
      db.GetDocument('settings', { "alias": { "$in": ["general", "seo"] } }, {}, {}, function(err, docdata) {
        if (err || !docdata) {
          res.send(err);
        } else {
          var settings = {};
          settings.title = docdata[0].settings.seo_title;
          settings.description = docdata[0].settings.meta_description;
          settings.image = docdata[0].settings.site_url + docdata[0].settings.logo;
          settings.siteUrl = docdata[0].settings.site_url;
          settings.fbappId = CONFIG.SOCIAL_NETWORKS.facebookAuth.clientID;
          settings.googleMapAPI = CONFIG.GOOGLE_MAP_API_KEY;

          if (req.session.passport && req.session.passport.user) {
            settings.username = req.session.passport.user.username;
          }

          res.render('site/layout', settings);
        }
      });
    });
  } catch (e) {
    console.log('Error in Router', e);
  }
};
