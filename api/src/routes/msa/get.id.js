'use strict';

// Mapping Service API

const
    config                = require( 'config' ),
    { default: turfBbox } = require( '@turf/bbox' );

const
    PostgresDB = require( '../../services/PostgresDB' ),
    Postgis    = require( '../../services/Postgis' );

module.exports.method = 'get';
module.exports.route  = [
    '/msa/:id(((all|\\d+?\\,?)+))',
    '/msa/:id(((all|\\d+?\\,?)+))/:operation(extent|geojson)'
];
module.exports.exec   = async ( req, res ) => {
    try {
        let
            {
                id = 'all',
                operation
            }    = req.params,
            bulk = false,
            doc  = PostgresDB
                .from( config.get( 'database.geotable' ) )
                .select( req.query.select ? req.query.select.split( ',' ) : '*' );

        if ( id === 'all' ) {
            bulk = true;
        }
        else {
            id = id.split( ',' );

            if ( id.length > 1 ) {
                bulk = true;
            }

            doc = doc.whereIn( 'id', id );
        }

        if ( req.query.where ) {
            doc = doc.whereRaw( req.query.where );
        }

        if ( req.query.group ) {
            doc = doc.groupByRaw( req.query.group );
        }

        if ( req.query.order ) {
            doc = doc.orderByRaw( req.query.order );
        }

        if ( req.query.distinct ) {
            doc = doc.distinct( req.query.distinct.split( ',' ) );
        }

        if ( operation === 'geojson' || operation === 'extent' ) {
            doc = doc.select( Postgis.asGeoJSON( 'geom' ) );
        }

        doc = await doc;

        if ( !doc.length ) {
            return res.status( 404 ).json( id );
        }

        if ( !bulk ) {
            doc = doc[ 0 ];
        }

        if ( operation === 'geojson' || operation === 'extent' ) {
            if ( bulk ) {
                doc = {
                    type: 'FeatureCollection',
                    features: doc.map(
                        ( feature ) => {
                            feature.properties.id      = feature.id;
                            feature.properties.created = feature.created;

                            return {
                                id: feature.id,
                                type: 'Feature',
                                properties: feature.properties,
                                geometry: JSON.parse( feature.geom )
                            };
                        }
                    ),
                    totalFeatures: doc.length,
                    crs: { type: 'name', properties: { name: 'urn:ogc:def:crs:EPSG::4326' } }
                };
            }
            else {
                doc.properties.id      = doc.id;
                doc.properties.created = doc.created;

                doc = {
                    id: doc.id,
                    type: 'Feature',
                    properties: doc.properties,
                    geometry: JSON.parse( doc.geom )
                };
            }
        }

        if ( operation === 'extent' ) {
            doc = turfBbox( doc );
        }

        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( e.message || e );
    }
};
