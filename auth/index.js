var express = require('express');
var router = express.Router();
var logger = require('../config/logger');

module.exports = function(io){
    logger.debug('Initializing Auth...');

    //Passport Configuration
    require('./facebook/passport').setup(io);
    require('./twitter/passport').setup(io);
    require('./google/passport').setup(io);
    require('./github/passport').setup(io);
    require('./linkedin/passport').setup(io);

    router.use('/facebook', require('./facebook'));
    router.use('/twitter', require('./twitter'));
    router.use('/google', require('./google'));
    router.use('/github', require('./github'));
    router.use('/linkedin', require('./linkedin'));

    return router;
}