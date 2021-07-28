'use strict';

import dragDrawPolygon from '@/plugins/map/dragDrawPolygon';

// TODO: update color as area increases

export default function setupDrawAoi( ref, draw ) {
    ref.$logger.trace( 'setupDrawAoi called' );

    const DrawAoi = dragDrawPolygon( {
        newFeatureType: 'aoi'
    } );

    DrawAoi.event.on( 'stop', async ( state ) => {
        ref.$logger.trace( 'setupDrawAoi.event.on.stop' );

        if ( state.polygon.coordinates.length <= 1 ) {
            if ( state.polygon.coordinates[ 0 ].length <= 1 ) {
                return;
            }
        }

        try {
            const geojson = state.polygon.toGeoJSON();

            await ref.$api.createFeature( {
                type: 'Feature',
                properties: geojson.properties,
                geometry: {
                    type: geojson.geometry.type,
                    coordinates: geojson.geometry.coordinates
                }
            } );

            ref.$logger.trace( 'setupDrawAoi.createFeature passed' );
        }
        catch ( e ) {
            ref.$logger.error( e );
        }

        ref.$store.commit( 'refreshMsaMapDataSource' );

        draw.delete( state.polygon.id );
        ref.$logger.trace( 'setupDrawAoi.draw.deleted' );
    } );

    draw.modes.DRAW_AOI         = 'draw_aoi';
    draw.options.modes.draw_aoi = DrawAoi;
}
