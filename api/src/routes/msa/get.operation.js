'use strict';

const
    Geohash    = require( '@geonet/geohash' ),
    PostgresDB = require( '../../services/PostgresDB' ),
    {
        geobuf,
        geojson,
        mvt,
        listTables,
        distinctTypes
    }          = require( '../../plugins/sql' ),
    Protobuf   = require( 'pbf' ),
    { Tile }   = require( '../../plugins/mvt' );

// Contains a map of all layers
// tile.layers;
// var landuse = tile.layers.landuse;
// Amount of features in this layer
// landuse.length;
// Returns the first feature
// landuse.feature( 0 );

module.exports.method = 'get';
module.exports.route  = [
    '/msa/:operation(intersectsGeohash)/:geohash([0-9b-z]{1,12})',
    '/msa/:operation(geojson|geobuf|mvt|tables)',
    '/msa/:operation(geojson|geobuf|mvt|tables)/:z(\\d+)/:x(\\d+)/:y(\\d+)'
];
module.exports.exec   = async ( req, res ) => {
    try {
        let
            doc  = null,
            data = null;

        if ( req.params.operation === 'geobuf' ) {
            res.set( { 'Content-Type': 'application/protobuf' } );

            doc  = await PostgresDB.raw( geobuf( req.params, req.query ) );
            data = doc.rows[ 0 ].st_asgeobuf;
        }
        else if ( req.params.operation === 'geojson' || req.params.operation === 'intersectsGeohash' ) {
            if ( req.params.operation === 'intersectsGeohash' ) {
                req.query.bounds = Geohash.geohashToBBox( req.params.geohash );
            }

            doc  = await PostgresDB.raw( geojson( req.params, req.query ) );
            data = doc.rows[ 0 ].geojson;
        }
        else if ( req.params.operation === 'mvt' ) {
            res.set( { 'Content-Type': 'application/protobuf' } );

            doc = await PostgresDB.raw( mvt( req.params, req.query ) );

            const
                buf     = new Protobuf( doc.rows[ 0 ].st_asmvt ),
                tilePbf = Tile.read( buf );

            for ( let i = 0; i < tilePbf.layers.length; i++ ) {
                const tile = tilePbf.layers[ i ];

                for ( let j = 0; j < tile.features.length; j++ ) {
                    const
                        feature = tile.features[ j ],
                        val     = tile.values[ feature.tags[ 1 ] ];

                    feature.id = val.uint_value || val.sint_value || val.int_value;
                }
            }

            const dist = new Protobuf();
            Tile.write( tilePbf, dist );
            data = Buffer.from( dist.finish() );
        }
        else if ( req.params.operation === 'tables' ) {
            doc  = await PostgresDB.raw( listTables() );
            data = doc.rows;
        }
        else {
            return res
                .status( 422 )
                .json( { message: `unknown operation ${ req.params.operation }` } );
        }

        return !data ?
            res.status( 204 ) :
            req.params.operation === 'mvt' || req.params.operation === 'geobuf' ?
                res.status( 200 ).send( data ).end() :
                res.status( 200 ).json( data );
    }
    catch ( e ) {
        return res.status( 400 ).json( e.message || e );
    }
};
