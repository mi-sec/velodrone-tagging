'use strict';

const
    PostgresDB = require( '../../services/PostgresDB' );

module.exports.method = 'post';
module.exports.route  = '/db/';
module.exports.exec   = async ( req, res ) => {
    try {
        const doc = await PostgresDB.schema.raw( req.body );
        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
