'use strict';

const
    config     = require( 'config' ),
    PostgresDB = require( '../../services/PostgresDB' ),
    Postgis    = require( '../../services/Postgis' ),
    rewind     = require( 'geojson-rewind' );
// {
//     validate,
//     geojsonUpdate
// }          = require( '../../services/superstructs' );

module.exports.method = 'put';
module.exports.route  = [
    '/msa',
    '/msa/:id(\\d+?)'
];
module.exports.exec   = async ( req, res ) => {
    // try {
    //     await validate( geojsonUpdate, p.data );
    // }
    // catch ( e ) {
    //     return p.respond( e );
    // }

    if ( !req.params.id && !req.body.id ) {
        return res.status( 404 ).json( { message: 'could not find id in request' } );
    }

    req.body.properties.layer = req.body.properties.layer || 'default';

    await PostgresDB
        .where( { id: req.params.id } )
        .into( config.get( 'database.geotable' ) )
        .update( ( () => {
            const data = {};

            if ( req.body.geometry ) {
                data.geom = Postgis.setSRID(
                    Postgis.geomFromGeoJSON(
                        JSON.stringify( rewind( req.body.geometry ) )
                    ),
                    config.get( 'database.epsgProjection' )
                );
            }

            if ( req.body.properties ) {
                delete req.body.properties.id;
                delete req.body.properties.created;
                data.properties = req.body.properties;
            }

            return data;
        } )() );

    return res.status( 202 ).json( req.body );
};
