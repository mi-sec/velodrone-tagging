'use strict';

const
    db = require( '../../services/database' );

module.exports.method = 'POST';
module.exports.route  = '/db/';
// TODO: allow for bulk upload
module.exports.exec   = async ( req, res ) => {
    const doc = await db.insert( req.body );
    return res.status( 200 ).json( doc );
};
