'use strict';

const
    config            = require( 'config' ),
    SphericalMercator = require( '@mapbox/sphericalmercator' ),
    merc              = new SphericalMercator( {
        size: config.get( 'defaultMercatorTileSize' )
    } ),
    table             = config.get( 'database.geotable' ),
    geomcolumn        = config.get( 'database.geomcolumn' );

function setDefaults( params, query ) {
    query.table       = query.table || table;
    query.geom_column = query.geom_column || geomcolumn;
}

function generateBounds( params, query ) {
    let bounds = null;

    if ( query.bounds ) {
        if ( !Array.isArray( query.bounds ) ) {
            query.bounds = query.bounds.split( ',' ).map( Number );
        }

        bounds = query.bounds;
    }

    if ( bounds ) {
        if ( bounds.length === 3 ) {
            bounds = merc.bbox( bounds[ 1 ], bounds[ 2 ], bounds[ 0 ] );
        }
        else if ( bounds.length === 2 ) {
            bounds = [ bounds[ 0 ], bounds[ 1 ] ];
        }
    }

    if ( !bounds ) {
        if ( params.x && params.y && params.z ) {
            bounds = merc.bbox( +params.x, +params.y, +params.z );
        }
    }

    return bounds;
}

module.exports.listTables = () => {
    return `
        SELECT * FROM information_schema.tables
            WHERE table_schema = 'public';
    `;
};

module.exports.distinctTypes = () => {
    return `
        SELECT DISTINCT field
        FROM (
            SELECT properties->'type' AS field
            FROM geodata
        ) AS q;
    `;
};

module.exports.mvt = ( params, query ) => {
    setDefaults( params, query );

    const bounds = merc.bbox( +params.x, +params.y, +params.z, false, '900913' );

    return `
        SELECT
            ST_AsMVT(q, '${ query.layer || query.table }', 4096, 'geom')

        FROM (
            SELECT
                properties,
                ST_AsMVTGeom(
                    ST_Transform(${ query.geom_column }, 3857),
                    ST_MakeBox2D(
                        ST_Point(${ bounds[ 0 ] }, ${ bounds[ 1 ] }),
                        ST_Point(${ bounds[ 2 ] }, ${ bounds[ 3 ] })
                    )
                ) geom
            FROM (
                SELECT
                    id,
                    (
                        SELECT
                            jsonb_set(
                                jsonb_set( to_jsonb( properties ), '{id}', to_jsonb( id ) ),
                                '{created}',
                                to_jsonb( created )
                            )
                    ) AS properties,
                    ${ query.geom_column },
                    srid
                FROM
                    ${ query.table },
                    (
                        SELECT ST_SRID(${ query.geom_column }) AS srid
                        FROM ${ query.table }
                        LIMIT 1
                    ) a
                    WHERE
                        ST_transform(
                            ST_MakeEnvelope(${ bounds.join() }, 3857),
                            srid
                        ) &&
                        ${ query.geom_column }
                    ${ query.where ? `AND ${ query.where }` : '' }
            ) r
        ) q
    `;
};

module.exports.geojson = ( params, query ) => {
    setDefaults( params, query );

    const bounds = generateBounds( params, query );

    return `
        SELECT
            row_to_json(fc) as geojson

        FROM (
            SELECT
                'FeatureCollection' AS type,
                COALESCE(Array_to_json(Array_agg(f)), '[]'::json) AS features
            FROM (
                SELECT
                    id AS id,
                    'Feature' AS type,
                    St_asgeojson(ST_Transform(lg.${ query.geom_column }, 4326))::json AS geometry,
                    (
                        SELECT
                            jsonb_set(
                                jsonb_set( to_jsonb( properties ), '{id}', to_jsonb( id ) ),
                                '{created}',
                                to_jsonb( created )
                            )
                    ) AS properties
                FROM
                    ${ query.table } AS lg
                    ${ bounds ?
        `,(SELECT ST_SRID(${ query.geom_column }) AS srid FROM ${ query.table } LIMIT 1) sq` :
        '' }

            ${ query.where || bounds ? 'WHERE' : '' }
            ${ query.where ? `${ query.where }` : '' }
            ${ query.where && bounds ? 'AND' : '' }
            ${ !bounds ? '' :
        bounds.length >= 3 ?
            `${ query.geom_column } && ST_Transform(ST_MakeEnvelope(${ bounds.join() }, 4326), srid)` :
            bounds.length === 2 ?
                `${ query.geom_column } && ST_Transform(ST_MakePoint(${ bounds.join() }, 4326), srid)` :
                '' }
            ) AS f
        ) AS fc;
    `;
};

module.exports.geobuf = ( params, query ) => {
    setDefaults( params, query );

    const bounds = generateBounds( params, query );

    return `
        SELECT
            ST_AsGeobuf(q, 'geom')

        FROM (
            SELECT
                ST_Transform(${ query.geom_column }, 4326) as geom
                ${ query.columns ? `, ${ query.columns }` : '' }

            FROM
                ${ query.table }
                ${ bounds ? `,(SELECT ST_SRID(${ query.geom_column }) as srid FROM ${ query.table } LIMIT 1) sq` : '' }

            ${ query.where || bounds ? 'WHERE' : '' }
            ${ query.where ? `${ query.where }` : '' }
            ${ query.where && bounds ? 'AND' : '' }
            ${ bounds ? `${ query.geom_column } && ST_Transform(ST_MakeEnvelope(${ bounds.join() }, 4326), srid)` : '' }
        ) as q;
    `;
};
