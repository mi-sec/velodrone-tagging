/** ****************************************************************************************************
 * File: toMultipolygon.js
 * Project: melior
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 10-Sep-2019
 *******************************************************************************************************/
'use strict';

const
    rewind = require( 'geojson-rewind' );

module.exports = polygon => {
    const properties = polygon.properties || {};

    if ( Object.prototype.hasOwnProperty.call( polygon, 'type' ) ) {
        if ( polygon.type === 'Feature' ) {
            polygon = polygon.geometry;
        }
    }

    if ( Object.prototype.hasOwnProperty.call( polygon, 'type' ) ) {
        if ( polygon.type !== 'MultiPolygon' ) {
            polygon.type        = 'MultiPolygon';
            polygon.coordinates = [ polygon.coordinates ];
        }
    }

    return rewind( {
        type: 'Feature',
        properties,
        geometry: polygon
    } );
};
