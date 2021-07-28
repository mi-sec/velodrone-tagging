/** ****************************************************************************************************
 * File: setupDrawObject.js
 * Project: tagger
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 10-Aug-2019
 *******************************************************************************************************/
'use strict';

import dragDrawPolygon from '@/plugins/map/dragDrawPolygon';
import Geohash         from '@geonet/geohash';
import turfCentroid    from '@turf/centroid';

// TODO: update color as area increases

export default function setupDrawObject( ref, draw ) {
    const DrawObject = dragDrawPolygon( {
        newFeatureType: 'object',
        tolerance: 0.00001
    } );

    DrawObject.event.on( 'stop', async function( state ) {
        // console.log( 'here-object', state );

        if ( !ref.$store.state.imagery.currentSource ) {
            // show an error - no source selected
            return;
        }

        if ( !ref.$store.state.imagery[ ref.$store.state.imagery.currentSource ].currentImageFeature ) {
            // show an error - no image selected
            return;
        }

        try {
            const
                geojson  = state.polygon.toGeoJSON(),
                centroid = turfCentroid( geojson ).geometry.coordinates;

            geojson.properties.geohash  = Geohash.encode( centroid[ 0 ], centroid[ 1 ], 6 );
            geojson.properties.image_id = ref.$store.state.imagery[ ref.$store.state.imagery.currentSource ]
                .currentImageFeature.properties.image_id;

            await ref.$api.createFeature( {
                type: 'Feature',
                properties: geojson.properties,
                geometry: {
                    type: geojson.geometry.type,
                    coordinates: geojson.geometry.coordinates
                }
            } );
        }
        catch ( e ) {
            // console.error( e );
        }

        ref.$store.commit( 'refreshMsaMapDataSource' );

        draw.delete( state.polygon.id );
    } );

    draw.modes.DRAW_OBJECT         = 'draw_object';
    draw.options.modes.draw_object = DrawObject;
}
