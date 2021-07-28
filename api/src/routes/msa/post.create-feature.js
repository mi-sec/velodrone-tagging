'use strict';

const
    config     = require( 'config' ),
    PostgresDB = require( '../../services/PostgresDB' ),
    Postgis    = require( '../../services/Postgis' ),
    rewind     = require( 'geojson-rewind' );
// {
//     validate,
//     geojson
// }          = require( '../../services/superstructs' );

module.exports.method = 'post';
module.exports.route  = '/msa';
module.exports.exec   = async ( req, res ) => {
    // try {
    //     await validate( geojson, p.data );
    // }
    // catch ( e ) {
    //     return p.respond( e );
    // }

    try {
        req.body.properties.layer = req.body.properties.layer || 'default';

        await PostgresDB
            .insert( {
                geom: Postgis.setSRID(
                    Postgis.geomFromGeoJSON(
                        JSON.stringify( rewind( req.body.geometry ) )
                    ),
                    config.get( 'database.epsgProjection' )
                ),
                properties: req.body.properties
            } )
            .into( config.get( 'database.geotable' ) );

        return res.status( 201 ).json( req.body );
    }
    catch ( e ) {
        return res.status( 400 ).json( e.message || e );
    }
};
