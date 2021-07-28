'use strict';

const
    PostgresDB          = require( '../../../services/PostgresDB' ),
    getPrimaryKeyColumn = require( '../../../plugins/sql/get-primary-key-column' ),
    {
        isEmpty,
        isArray
    }                   = require( '../../../utils/general' );

module.exports.method = 'delete';
module.exports.route  = [
    '/db/:table(\\w+)/',
    '/db/:table(\\w+)/:id(((\\d+?\\,?)+))'
];
module.exports.exec   = async ( req, res ) => {
    try {
        const primaryKey = await getPrimaryKeyColumn( req.params.table );

        let doc = PostgresDB.from( req.params.table );

        if ( req.params.id ) {
            const id = req.params.id.split( ',' );
            doc      = doc.whereIn( primaryKey, id );
        }
        else {
            if ( req.query.where ) {
                doc = doc.whereRaw( req.query.where );
            }

            if ( req.query.limit ) {
                doc = doc.limit( req.query.limit );
            }

            if ( req.query.offset ) {
                doc = doc.offset( req.query.offset );
            }
        }

        doc = await doc.del().returning( '*' );

        if ( isEmpty( doc ) ) {
            return res
                .status( 404 )
                .json( {
                    message: `${ req.params.id ? `${ primaryKey }: ${ req.params.id } not` : 'no items' } found`
                } );
        }
        else if (
            isArray( doc ) &&
            doc.length === 1 &&
            req.params.id
        )
        {
            doc = doc[ 0 ];
        }

        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
