'use strict';

const
    { default: bbox } = require( '@turf/bbox' );

module.exports.method = 'post';
module.exports.route  = '/tools/polygonToBbox';
module.exports.exec   = ( req, res ) => {
    return res.status( 200 ).json( bbox( req.body ) );
};
