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
        port: +process.env.API_PORT || 3000,
        routes: (
            process.env.API_ROUTE_PATH ||
            NODE_ENV === 'production' ?
                path.join( process.cwd(), 'routes' ) :
                path.join( process.cwd(), 'src', 'routes' )
        )
    }
};

config.ui = {
    staticFile: path.join( config.local.storage, 'html' )
};

module.exports = config;
