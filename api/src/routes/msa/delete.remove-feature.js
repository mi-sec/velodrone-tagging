'use strict';

const
    config     = require( 'config' ),
    PostgresDB = require( '../../services/PostgresDB' );

module.exports.method = 'delete';
module.exports.route  = '/msa/:id(((\\d+?\\,?)+))';
module.exports.exec   = async ( req, res ) => {
    try {
        let { id = '' } = req.params;

        id = id.split( ',' );

        const doc = await PostgresDB
            .from( config.get( 'database.geotable' ) )
            .whereIn( 'id', id ).del();

        if ( doc ) {
            return res.status( 202 ).json( id );
        }
        else {
            return res.status( 404 ).json( { message: `item ${ id } not found` } );
        }
    }
    catch ( e ) {
        return res.status( 400 ).json( e.message || e );
    }
};
