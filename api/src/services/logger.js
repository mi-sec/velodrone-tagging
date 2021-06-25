'use strict';

module.exports = require( 'pino' )( {
    enabled: !process.env.TESTING,
    level: process.env.LOG_LEVEL || process.env.NODE_ENV === 'production' ? 'error' : 'trace'
} );
