/** ****************************************************************************************************
 * File: drawEvents.js
 * Project: tagger
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 24-Jul-2019
 *******************************************************************************************************/
'use strict';

// TODO: might need to make this a non-display component
export function onCreate( evt, ref ) {
    console.log( evt, ref );
    for ( let i = 0; i < evt.features.length; i++ ) {
        const feature = evt.features[ i ];

        // if ( feature.properties.type === 'aoi' ) {
        // }
    }
    console.log( 'draw.create', evt );
}

export function onUpdate( evt, ref ) {
    console.log( evt, ref );
    console.log( 'draw.update', evt );
}

export function onDelete( evt, ref ) {
    console.log( evt, ref );
    console.log( 'draw.delete', evt );
}
