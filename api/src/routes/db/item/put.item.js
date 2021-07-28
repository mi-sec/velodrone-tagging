'use strict';

const
    PostgresDB          = require( '../../../services/PostgresDB' ),
    getPrimaryKeyColumn = require( '../../../plugins/sql/get-primary-key-column' ),
    { isEmpty }         = require( '../../../utils/general' );

module.exports.method = 'put';
module.exports.route  = [
    '/db/:table(\\w+)',
    '/db/:table(\\w+)/:id(\\d+)'
];
module.exports.exec   = async ( req, res ) => {
    try {
        const primaryKey = await getPrimaryKeyColumn( req.params.table );

        let doc = PostgresDB
            .update( req.body, Object.keys( req.body ) )
            .into( req.params.table );

        if ( req.params.id ) {
            doc = doc.where( { [ primaryKey ]: req.params.id } );
        }
        else if ( req.query.where ) {
            doc = doc.whereRaw( req.query.where );
        }
        else {
            if ( Object.prototype.hasOwnProperty.call( req.body, primaryKey ) ) {
                doc = doc.where( { [ primaryKey ]: req.body[ primaryKey ] } );
            }
            else {
                return res.status( 422 ).json( { message: `data requires ${ primaryKey }` } );
            }
        }

        doc = await doc;

        if ( isEmpty( doc ) ) {
            return res.status( 404 ).json( { message: `no items found on '${ req.params.table }'` } );
        }
        else if ( doc.length === 1 ) {
            doc = doc[ 0 ];
        }

        return res.status( 202 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
