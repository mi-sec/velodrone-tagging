'use strict';

const
    { applyPatch }       = require( 'fast-json-patch' ),
    PostgresDB           = require( '../../../services/PostgresDB' ),
    Postgis              = require( '../../../services/Postgis' ),
    getPrimaryKeyColumn  = require( '../../../plugins/sql/get-primary-key-column' ),
    getGeomColumn        = require( '../../../plugins/sql/get-geom-column' ),
    toMultipolygon       = require( '../../../utils/geospatial/toMultipolygon' ),
    { isEmpty, isArray } = require( '../../../utils/general' );

module.exports.method = 'patch';
module.exports.route  = '/db/:table(\\w+)/:id(\\d+)';
module.exports.exec   = async ( req, res ) => {
    try {
        if ( isEmpty( req.body ) ) {
            return res.status( 400 ).json( { message: 'no instructions provided' } );
        }
        else if ( !isArray( req.body ) ) {
            return res.status( 400 ).json( { message: 'patch instructions must be an array' } );
        }

        const
            primaryKey = await getPrimaryKeyColumn( req.params.table ),
            geomColumn = await getGeomColumn( req.params.table );

        let
            doc = PostgresDB
                .select( '*' )
                .from( req.params.table )
                .where( primaryKey, req.params.id );

        if ( geomColumn ) {
            doc = doc.select(
                '*',
                PostgresDB.raw( `ST_AsGeoJSON(${ geomColumn.column_name })::JSON AS ${ geomColumn.column_name }` )
            );
        }

        doc = await doc;

        if ( Array.isArray( doc ) && doc.length === 1 ) {
            doc = doc[ 0 ];
        }
        else {
            return res.status( 404 ).json( { message: `${ primaryKey }: ${ req.params.id } not found` } );
        }

        const
            patch = applyPatch( doc, req.body ).newDocument;

        if ( geomColumn ) {
            if ( Object.prototype.hasOwnProperty.call( patch, geomColumn.column_name ) ) {
                if ( geomColumn.geom_type === 'MULTIPOLYGON' ) {
                    patch[ geomColumn.column_name ] = toMultipolygon( patch[ geomColumn.column_name ] );
                }

                patch[ geomColumn.column_name ] = Postgis.setSRID(
                    Postgis.geomFromGeoJSON(
                        JSON.stringify(
                            patch[ geomColumn.column_name ].geometry ||
                            patch[ geomColumn.column_name ]
                        )
                    ),
                    4326
                );
            }
        }

        let
            result = await PostgresDB
                .update( patch, Object.keys( patch ) )
                .into( req.params.table )
                .where( { [ primaryKey ]: patch[ primaryKey ] } );

        if ( result.length === 1 ) {
            result = result[ 0 ];
        }

        return res.status( 200 ).json( result );
    }
    catch ( e ) {
        return res.status( 400 ).json( e );
    }
};
