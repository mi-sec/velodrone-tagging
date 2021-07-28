'use strict';

const
    config              = require( 'config' ),
    PostgresDB          = require( '../../../services/PostgresDB' ),
    getPrimaryKeyColumn = require( '../../../plugins/sql/get-primary-key-column' ),
    getGeomColumn       = require( '../../../plugins/sql/get-geom-column' ),
    {
        isEmpty,
        isArray,
        isString
    }                   = require( '../../../utils/general' );

module.exports.method = 'get';
module.exports.route  = [
    '/db/:table(\\w+)',
    '/db/:table(\\w+)/:id(((\\d+?\\,?)+))'
];
module.exports.exec   = async ( req, res ) => {
    try {
        const
            primaryKey = await getPrimaryKeyColumn( req.params.table ),
            geomColumn = await getGeomColumn( req.params.table );

        let
            doc = PostgresDB
                .from( req.params.table );

        if ( req.query.select ) {
            doc = doc.select(
                isString( req.query.select ) ?
                    PostgresDB.raw( req.query.select ) :
                    req.query.select
            );
        }

        if ( geomColumn ) {
            if (
                !req.query.select ||
                req.query.select.includes( geomColumn.column_name )
            )
            {
                doc = doc.select(
                    PostgresDB.raw( req.query.select || '*' ),
                    PostgresDB.raw(
                        `ST_AsGeoJSON(${ geomColumn.column_name })::JSON AS ${ geomColumn.column_name }`
                    )
                );
            }
        }

        if ( req.params.id ) {
            const id = req.params.id.split( ',' );
            doc      = doc.whereIn( primaryKey, id );
        }
        else {
            if ( req.query.count ) {
                doc = doc.count( req.query.count === '' ? '*' : req.query.count );
            }
            else if ( req.query.countDistinct ) {
                doc = doc.countDistinct( req.query.countDistinct );
            }

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

        doc = await doc;

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
            (
                req.params.id ||
                req.query.count ||
                req.query.countDistinct
            )
        )
        {
            doc = doc[ 0 ];
        }

        return res
            .status( 200 )
            .json( doc );
    }
    catch ( e ) {
        return res
            .status( 400 )
            .json( { message: e } );
    }
};
