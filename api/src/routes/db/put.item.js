'use strict';

const
    db = require( '../../services/database' );

module.exports.method = 'PUT';
module.exports.route  = [ '/db/', '/db/:_id' ];
module.exports.exec   = async ( req, res ) => {
    const { query = {}, update = {}, options = {} } = req.body;

    if ( req.params._id ) {
        query._id = req.params._id;
    }

    const doc = await db.update( query, update, options );
    return res.status( 200 ).json( doc );
};
