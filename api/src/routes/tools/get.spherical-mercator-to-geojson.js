'use strict';

const
    config            = require( 'config' ),
    SphericalMercator = require( '@mapbox/sphericalmercator' );

module.exports.method = 'get';
module.exports.route  = '/tools/sphericalMercatorToGeojson/:z/:x/:y';
module.exports.exec   = async ( req, res ) => {
    const merc      = new SphericalMercator( {
        size: +( req.query.size || config.get( 'defaultMercatorTileSize' ) )
    } );
    let { x, y, z } = req.params;

    x = +x;
    y = +y;
    z = +z;

    const
        vec      = merc.bbox( x, y, z ),
        bboxJson = {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [ vec[ 0 ], vec[ 1 ] ],
                        [ vec[ 2 ], vec[ 1 ] ],
                        [ vec[ 2 ], vec[ 3 ] ],
                        [ vec[ 0 ], vec[ 3 ] ],
                        [ vec[ 0 ], vec[ 1 ] ]
                    ]
                ]
            }
        };

    return res.status( 200 ).json( bboxJson );
};
