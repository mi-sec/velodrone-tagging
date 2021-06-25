'use strict';

const
    db = require( '../../services/database' );

module.exports.method = 'GET';
module.exports.route  = '/db/';
module.exports.exec   = async ( req, res ) => {
    let doc;

    if ( req.query.hasOwnProperty( 'count' ) ) {
        delete req.query.count;
        doc = db.count( req.query );
    }
    else {
        doc = db.find( req.query );
    }

    doc = await doc;

    return res.status( 200 ).json( doc );
};
