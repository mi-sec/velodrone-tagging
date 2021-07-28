'use strict';

const
    config     = require( 'config' ),
    PostgresDB = require( '../../../services/PostgresDB' );

module.exports.method = 'get';
module.exports.route  = '/msa/info/geohash';
module.exports.exec   = async ( req, res ) => {
    try {
        let doc = await PostgresDB
            .raw( `
				SELECT DISTINCT ST_GeoHash( ( geom ), ${ req.query.precision || 6 } )
				FROM (
					SELECT geom FROM ${ req.query.table || config.get( 'database.geotable' ) }
					${ req.query.where ? `WHERE ${ req.query.where }` : '' }
				) AS geom;
			` );

        if ( doc.rows ) {
            doc = doc.rows.map( ( i ) => i.st_geohash );
        }

        return res.status( 200 ).json( doc );
    }
    catch ( e ) {
        return res.status( 400 ).json( { code: e.code, message: e.message } );
    }
};
