var winston = require('winston');
// var slackWinston = require('slack-winston').Slack;
var CONFIG = require('./config');

var transports = [];

if (CONFIG.env === 'production') {
    /*transports.push(
        new slackWinston({
            domain: '',
            token: '',
            channel: '',
            username: '',
            level: 'info',
            prettyPrint: true,
            colorize: true,
            timestamp: true,
            handleExceptions: true
        })
    );*/
} else {
    transports.push(
        new winston.transports.Console({
            level: 'silly',
            prettyPrint: true,
            colorize: true,
            timestamp: true,
            handleExceptions: true
        })
    );
}

var logger = new(winston.Logger)({
    transports: transports
});

module.exports = logger;