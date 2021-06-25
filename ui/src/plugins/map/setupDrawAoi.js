/** ****************************************************************************************************
 * File: setupDrawAoi.js
 * Project: tagger
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 09-Aug-2019
 *******************************************************************************************************/
'use strict';

import dragDrawPolygon from '@/plugins/map/dragDrawPolygon';

// TODO: update color as area increases

export default function setupDrawAoi( ref, draw ) {
    const DrawAoi = dragDrawPolygon( {
        newFeatureType: 'aoi'
    } );

    DrawAoi.event.on( 'stop', async function( state ) {
        console.log( 'here-aoi' );
        try {
            const geojson = state.polygon.toGeoJSON();
            console.log( state, geojson );

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
            console.error( e );
        }

        ref.$store.commit( 'map/refreshTiles' );

        draw.delete( state.polygon.id );
    } );

    draw.modes.DRAW_AOI         = 'draw_aoi';
    draw.options.modes.draw_aoi = DrawAoi;
}
