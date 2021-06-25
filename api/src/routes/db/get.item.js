'use strict';

const
    db = require( '../../services/database' );

module.exports.method = 'GET';
module.exports.route  = '/db/:_id';
module.exports.exec   = async ( req, res ) => {
    const doc = await db.findOne( { _id: req.params._id } );

    if ( doc ) {
        return res.status( 200 ).json( doc );
    }
    else {
        return res.status( 404 ).json( { error: `item ${ req.params._id } not found` } );
    }
};
