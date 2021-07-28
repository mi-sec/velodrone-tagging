'use strict';


// const
//     config     = require( 'config' ),
//     PostgresDB = require( '../../services/PostgresDB' ),
//     Postgis    = require( '../../services/Postgis' ),
//     rewind     = require( 'geojson-rewind' ),
//     {
//         validate,
//         bulkGeojson
//     }          = require( '../../services/superstructs' );

module.exports.method = 'post';
module.exports.route  = '/msa/bulk';
module.exports.exec   = async ( req, res ) => {
    // try {
    // 	await validate( bulkGeojson, p.data );
    // } catch ( e ) {
    // 	return e instanceof Response ?
    // 		p.respond( e ) :
    // 		p.respond( new Response( 417, e.data || e.stack || e.message || e ) );
    // }

    try {
        // p.data = p.data.map(
        // 	item => {
        // 		item.properties.layer = item.properties.layer || 'default';
        //
        // 		return {
        // 			geom: PostgresDB.raw(
        // 				`
        // 					ST_SetSRID(
        // 						ST_geomFromGeoJSON(
        // 							${ JSON.stringify( rewind( item.geometry ) ) }
        // 						),
        // 						4326
        // 					)
        // 				`
        // 				// Postgis.setSRID(
        // 				// 	Postgis.geomFromGeoJSON(
        // 				// 		JSON.stringify( rewind( item.geometry ) )
        // 				// 	),
        // 				// 	4326
        // 				// ).toString()
        // 			),
        // 			properties: item.properties
        // 		};
        // 	}
        // );

        // console.log( p.data );
        //
        // await PostgresDB
        // 	.insert( function() {
        // 		this.batchInsert( p.data.map( item => {
        // 			item.properties.layer = item.properties.layer || 'default';
        //
        // 			return {
        // 				geom: Postgis.setSRID(
        // 					Postgis.geomFromGeoJSON(
        // 						JSON.stringify( rewind( item.geometry ) )
        // 					),
        // 					4326
        // 				),
        // 				properties: item.properties
        // 			};
        // 		} ) );
        // 	} )
        // 	.into( config.get( 'database.geotable' ) );

        return res.status( 501 ).json( { message: 'method not implemented' } );
    }
    catch ( e ) {
        return res.status( 400 ).json( e.message || e );
    }
};
