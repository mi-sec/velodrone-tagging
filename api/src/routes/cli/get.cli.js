'use strict';

const
    spawn           = require( '../../utils/spawn' ),
    prepareCliQuery = require( '../../utils/prepare-cli-query' );

module.exports.method = 'GET';
module.exports.route  = '/cli/:cli';
module.exports.exec   = async ( req, res ) => {
    try {
        const query = prepareCliQuery( req.params.route, req.query );
        const data  = await spawn( req.params.cli, ...query );

        if ( /exception/i.test( data ) || /error/i.test( data ) ) {
            res.status( 400 );
            res.write( data );
        }
        else {
            res.status( 200 );
            res.json( data );
        }
    }
    catch ( e ) {
        res.status( 400 );
        res.write( typeof e === 'string' ? e : e.message );
    }
    finally {
        res.end();
    }
};
