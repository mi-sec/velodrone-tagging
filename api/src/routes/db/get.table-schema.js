'use strict';

const
    PostgresDB  = require( '../../services/PostgresDB' ),
    { isEmpty } = require( '../../utils/general' );

module.exports.method = 'get';
module.exports.route  = '/db/:table(\\w+)/schema';
module.exports.exec   = async ( req, res ) => {
    try {
        const doc = await PostgresDB
            .table( req.params.table )
            .columnInfo();

        if ( isEmpty( doc ) ) {
            return res.status( 404 ).json( { message: `table '${ req.params.table }' not found` } );
        }

        return res.status( 400 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
