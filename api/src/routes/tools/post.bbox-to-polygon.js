'use strict';

module.exports.method = 'post';
module.exports.route  = '/tools/bboxToPolygon';
module.exports.exec   = ( req, res ) => {
    return res
        .status( 200 )
        .json( {
            type: 'Feature',
            properties: {},
            geometry: {
                type: 'Polygon',
                coordinates: [
                    [
                        [ req.body[ 0 ], req.body[ 1 ] ],
                        [ req.body[ 2 ], req.body[ 1 ] ],
                        [ req.body[ 2 ], req.body[ 3 ] ],
                        [ req.body[ 0 ], req.body[ 3 ] ],
                        [ req.body[ 0 ], req.body[ 1 ] ]
                    ]
                ]
            }
        } );
};
