'use strict';

const
    db = require( '../../services/database' );

module.exports.method = 'DELETE';
module.exports.route  = [ '/db/', '/db/:_id' ];
module.exports.exec   = async ( req, res ) => {
    const { query = {}, options = {} } = req.body;

    if ( req.params._id ) {
        query._id = req.params._id;
    }

    const doc = await db.remove( query, options );

    if ( doc ) {
        return res.status( 200 ).json( doc );
    }
    else {
        return res.status( 404 ).json( {
            error: req.params._id ? `item ${ req.params._id } not found` : 'no items found'
        } );
    }
};
