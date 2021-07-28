'use strict';

const
    config = require( 'config' ),
    {
        omit,
        findMissingKeys,
        include
    }      = require( '../utils/general' );

module.exports.method = 'get';
module.exports.route  = '/config';
module.exports.exec   = ( req, res ) => {
    const data = omit( config, 'secret' );

    if ( !req.query.key ) {
        return res.status( 200 ).json( data );
    }
    else {
        if ( !Array.isArray( req.query.key ) ) {
            req.query.key = [ req.query.key ];
        }

        const missing = findMissingKeys( data, ...req.query.key );

        if ( missing.length ) {
            return res.status( 400 ).json( { message: `${ missing.join( ', ' ) } does not exist` } );
        }
        else {
            return res.status( 200 ).json( include( data, ...req.query.key ) );
        }
    }
};
