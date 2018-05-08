var express = require('express');
var router = express.Router();
var logger = require('../config/logger');

module.exports = function(io){
    logger.debug('Initializing Auth...');

    //Passport Configuration
    require('./google/passport').setup(io);
    // require('./github/passport').setup();
    // require('./twitter/passport').setup();
    // require('./linkedin/passport').setup();

    router.use('/google', require('./google'));
    // router.use('/github', require('./github'));
    // router.use('/twitter', require('./twitter'));
    // router.use('/linkedin', require('./linkedin'));

    return router;
}