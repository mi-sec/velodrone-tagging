'use strict';

const
    path = require( 'path' ),
    {
        name,
        version,
        description
    }    = require( '../package' );

process.env.API_PID_TITLE = process.env.API_PID_TITLE || `${ name }-v${ version }`;
process.title             = process.env.API_PID_TITLE;

const config = {
    name,
    version: `v${ version }`,
    description,
    title: process.env.API_PID_TITLE,

    ENV: process.env.ENV || 'development',
    NODE_ENV: process.env.NODE_ENV || 'development',

    region: process.env.REGION || 'us-east-1',

    local: {
        storage: process.env.API_LOCAL_STORAGE ?
            path.resolve( process.env.API_LOCAL_STORAGE ) :
            path.join( process.cwd(), 'storage' )
    },

    server: {
        host: process.env.API_HOST || '0.0.0.0',
        port: +process.env.API_PORT || 3000,
        routes: process.env.API_ROUTE_PATH || path.join( process.cwd(), 'src', 'routes' )
    }
};

module.exports = config;
