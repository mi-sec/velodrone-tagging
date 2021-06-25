'use strict';

const
    config = require( 'config' );

module.exports.method = 'GET';
module.exports.route  = '/version';
module.exports.exec   = ( req, res ) => {
    res
        .status( 200 )
        .json( { message: `${ config.get( 'name' ) } ${ config.get( 'version' ) }` } );
};
