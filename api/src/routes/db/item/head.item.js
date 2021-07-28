'use strict';

const
    config              = require( 'config' ),
    PostgresDB          = require( '../../../services/PostgresDB' ),
    getPrimaryKeyColumn = require( '../../../plugins/sql/get-primary-key-column' );

module.exports.method = 'head';
module.exports.route  = [
    '/db/:table(\\w+)',
    '/db/:table(\\w+)/:id(((\\d+?\\,?)+))'
];
module.exports.exec   = async ( req, res ) => {
    try {
        const
            primaryKey = await getPrimaryKeyColumn( req.params.table );

        let doc = PostgresDB.from( req.params.table );

        if ( req.params.id ) {
            const id = req.params.id.split( ',' );
            doc      = doc.whereIn( primaryKey, id );
        }
        else {
            if ( req.query.where ) {
                doc = doc.whereRaw( req.query.where );
            }

            if ( req.query.order ) {
                doc = doc.orderByRaw( req.query.order );
            }

            if ( req.query.limit ) {
                doc = doc.limit( req.query.limit );
            }
            else {
                doc = doc.limit( config.get( 'database.defaultPaginationSize' ) );
            }

            if ( req.query.offset ) {
                doc = doc.offset( req.query.offset );
            }
        }

        doc = doc.count( req.query.count === '' ? '*' : req.query.count );

        doc = await doc;

        doc = +doc[ 0 ].count;

        res.setHeader( 'Count', doc );

        if ( !doc ) {
            return res.status( 404 );
        }

        return res.status( 200 );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
