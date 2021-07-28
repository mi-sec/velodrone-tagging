'use strict';

const
    path     = require( 'path' ),
    {
        name,
        version
    }        = require( '../package.json' ),
    NODE_ENV = process.env.NODE_ENV || 'development';

process.env.API_PROGRAM_TITLE = process.env.API_PROGRAM_TITLE || `${ name }-v${ version }`;
process.title                 = process.env.API_PROGRAM_TITLE;

const config = {
    name,
    version: `v${ version }`,
    title: process.env.API_PID_TITLE,

    ENV: process.env.ENV || 'development',
    NODE_ENV,

    region: process.env.REGION || 'us-east-1',

    local: {
        storage: process.env.API_LOCAL_STORAGE ?
            path.resolve( process.env.API_LOCAL_STORAGE ) :
            path.join( process.cwd(), 'storage' )
    },

    server: {
        host: process.env.API_HOST || '0.0.0.0',
        port: +process.env.API_PORT || 3000
    },

    database: {
        epsgProjection: 4326,
        geotable: process.env.GEO_TABLE || 'geodata',
        geomcolumn: process.env.GEO_COLUMN || 'geom',
        defaultPaginationSize: process.env.DEFAULT_PAGINATION_SIZE || 100
    },

    classification: {
        text: process.env.CLASSIFICATION_TEXT || 'DEVELOPMENT',
        textColor: process.env.CLASSIFICATION_TEXT_COLOR || 'black',
        backgroundColor: process.env.CLASSIFICATION_BACKGROUND_COLOR || '#808080',
        height: process.env.CLASSIFICATION_BAR_HEIGHT || 12
    },

    secret: {
        database: {
            configuration: {
                client: 'pg',
                database: 'postgres',
                connection: {
                    host: process.env.DB_HOST || '127.0.0.1',
                    port: process.env.DB_PORT || 5432,
                    database: process.env.DB_DATABASE || 'postgres',
                    user: process.env.DDB_USERNAME || 'username',
                    password: process.env.DB_PASSWORD || 'password'
                },
                pool: {
                    min: 0,
                    max: 100
                },
                acquireConnectionTimeout: 10000
            }
        }
    },

    defaultMercatorTileSize: 256
};

config.ui = {
    staticFile: path.join( config.local.storage, 'html' )
};

module.exports = config;
