'use strict';

const
    config              = require( 'config' ),
    PostgresDB          = require( '../../../services/PostgresDB' ),
    Postgis             = require( '../../../services/Postgis' ),
    getPrimaryKeyColumn = require( '../../../plugins/sql/get-primary-key-column' ),
    getGeomColumn       = require( '../../../plugins/sql/get-geom-column' ),
    toMultipolygon      = require( '../../../utils/geospatial/toMultipolygon' ),
    { isEmpty }         = require( '../../../utils/general' );

module.exports.method = 'post';
module.exports.route  = '/db/:table(\\w+)';
module.exports.exec   = async ( req, res ) => {
    try {
        const tableCheck = await PostgresDB
            .where( PostgresDB.raw( 'table_schema' ), 'public' )
            .where( 'table_name', req.params.table )
            .select( 'table_name' )
            .from( PostgresDB.raw( 'information_schema.columns' ) )
            .first();

        if ( isEmpty( tableCheck ) ) {
            return res.status( 404 ).json( { message: `table ${ req.params.table } not found` } );
        }

        const
            primaryKey = await getPrimaryKeyColumn( req.params.table ),
            geomColumn = await getGeomColumn( req.params.table );

        if ( geomColumn ) {
            if ( Object.prototype.hasOwnProperty.call( req.body, geomColumn.column_name ) ) {
                if ( geomColumn.geom_type === 'MULTIPOLYGON' ) {
                    req.body[ geomColumn.column_name ] = toMultipolygon( req.body[ geomColumn.column_name ] );
                }

                req.body[ geomColumn.column_name ] = Postgis.setSRID(
                    Postgis.geomFromGeoJSON(
                        JSON.stringify( req.body[ geomColumn.column_name ].geometry )
                    ),
                    config.get( 'database.epsgProjection' )
                );
            }
        }

        let doc = await PostgresDB
            .insert( req.body, '*' )
            .into( req.params.table );

        if ( Array.isArray( doc ) && doc.length === 1 ) {
            doc = doc[ 0 ];
        }

        res.setHeader( 'Location', `${ req.path }${ doc[ primaryKey ] }` );
        return res.status( 201 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
