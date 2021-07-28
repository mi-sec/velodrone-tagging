'use strict';

const
    PostgresDB     = require( '../../services/PostgresDB' ),
    { listTables } = require( '../../plugins/sql' );

module.exports.method = 'get';
module.exports.route  = '/msa';
module.exports.exec   = async ( req, res ) => {
    try {
        const doc = await PostgresDB
            .raw( req.query.query || listTables() );

        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( {
            code: e.code,
            message: e.message
        } );
    }
};
