'use strict';

function pointInside( [ x, y ], poly ) {
    let inside = false;
    for ( let i = 0, j = poly.length - 1; i < poly.length; j = i++ ) {
        const
            xi = poly[ i ][ 0 ],
            yi = poly[ i ][ 1 ],
            xj = poly[ j ][ 0 ],
            yj = poly[ j ][ 1 ];

        if (
            ( ( yi > y ) !== ( yj > y ) ) &&
            ( x < ( xj - xi ) * ( y - yi ) / ( yj - yi ) + xi )
        )
        {
            inside = !inside;
        }
    }

    return inside;
}

const EARTH_ELLIPSOID = 6378137;

export default {
    EARTH_ELLIPSOID,
    EPSG3857_X_MIN: -Math.PI * EARTH_ELLIPSOID,
    EPSG3857_Y_MIN: -Math.PI * EARTH_ELLIPSOID,
    EPSG3857_X_MAX: Math.PI * EARTH_ELLIPSOID,
    EPSG3857_Y_MAX: Math.PI * EARTH_ELLIPSOID,
    EPSG4326_X_MIN: -180,
    EPSG4326_X_MAX: 180,
    EPSG4326_Y_MIN: -90,
    EPSG4326_Y_MAX: 90,
    DEG_TO_RAD: Math.PI / 180,
    RAD_TO_DEG: 180 / Math.PI,
    pointInside
};
