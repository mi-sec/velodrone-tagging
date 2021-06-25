'use strict';

const
    logger = require( '../services/logger' );

module.exports = () => {
    logger.trace( 'application on-stop' );
};
