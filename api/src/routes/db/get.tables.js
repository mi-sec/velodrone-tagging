'use strict';

const
    PostgresDB = require( '../../services/PostgresDB' );

module.exports.method = 'get';
module.exports.route  = [
    '/db/',
    '/db/:op(info)'
];
module.exports.exec   = async ( req, res ) => {
    try {
        let doc = PostgresDB
            .where( PostgresDB.raw( 'table_schema' ), 'public' )
            .from( PostgresDB.raw( 'information_schema.columns' ) )
            .orderBy( 'table_name' );

        if ( req.query.where ) {
            doc = doc.whereRaw( req.query.where );
        }

        if ( req.params.op ) {
            doc = doc.select( '*' );
            doc = doc.orderBy( 'ordinal_position' );
            doc = await doc;
        }
        else {
            doc = doc.distinct( 'table_name' );
            doc = await doc;
            doc = doc.map( ( i ) => i.table_name );
        }

        if ( !doc.length ) {
            return res.status( 404 ).json( { message: 'no tables found' } );
        }

        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
