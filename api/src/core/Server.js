'use strict';

const
    config      = require( 'config' ),
    express     = require( 'express' ),
    cors        = require( 'cors' ),
    bodyParser  = require( 'body-parser' ),
    expressPino = require( 'express-pino-logger' ),
    crypto      = require( 'crypto' );

const
    logger                   = require( '../services/logger' ),
    recursivelyReadDirectory = require( '../../utils/recursively-read-directory' ),
    methodNotAllowed         = require( './method-not-allowed' );

class Server
{
    constructor()
    {
        this.app      = null;
        this.server   = null;
        this.isClosed = false;
    }

    /**
     * bindProcess
     * @description
     * bind the process to `SIGINT`, `SIGQUIT`, `SIGTERM`, `unhandledRejection`, `uncaughtException`, `beforeExit`,
     * and `exit` program POSIX signal events to assist with safe shutdown
     */
    bindProcess()
    {
        logger.trace( 'server.bindProcess' );

        // catch all the ways node might exit
        if ( !process.env.TESTING ) {
            process
                .on( 'SIGINT', ( msg, code ) => ( logger.info( 'SIGINT' ), process.exit( code ) ) )
                .on( 'SIGQUIT', ( msg, code ) => ( logger.info( 'SIGQUIT' ), process.exit( code ) ) )
                .on( 'SIGTERM', ( msg, code ) => ( logger.info( 'SIGTERM' ), process.exit( code ) ) )
                .on( 'unhandledRejection', ( err ) => logger.error( 'unhandledRejection', err ) )
                .on( 'uncaughtException', ( err ) => logger.error( 'uncaughtException', err ) )
                .on( 'beforeExit', () => logger.info( 'beforeExit' ) )
                .on( 'exit', () => logger.info( 'exit' ) );
        }
    }

    /**
     * expressInitialize
     * @description
     * Initialize express middleware and hook the middleware
     */
    expressInitialize()
    {
        logger.trace( 'server.expressInitialize' );

        this.app = express();

        this.app.use( expressPino( { logger } ) );
        this.app.set( 'trust proxy', 1 );

        this.app.use( cors() );
        this.app.use( bodyParser.raw( { limit: '5gb' } ) );
        this.app.use( bodyParser.urlencoded( { extended: false } ) );
        this.app.use( bodyParser.text() );
        this.app.use( bodyParser.json() );
    }

    /**
     * hookRoute
     * @param {object} item - item from the api config
     * @returns {*} - returns item with required execution function
     */
    hookRoute( item )
    {
        logger.trace( `server.hookRoute ${ item.method } ${ item.route }` );

        // TODO::: add a hook to check for authentication if the handler file requires it
        const exec = [
            ( req, res, next ) => ( this.meters.reqMeter.mark(), next() ),
            ( req, res, next ) => {
                if ( res ) {
                    try {
                        res.set( { 'request-id': crypto.randomUUID() } );
                        item.exec( req, res, next );
                    }
                    catch ( e ) {
                        res.status( 500 ).json( {
                            error: 'unknown server error',
                            ...e
                        } );
                    }
                }
                else {
                    res.status( 500 ).json( { error: 'unknown server error' } );
                }
            }
        ];

        item.method = item.method.toLowerCase();

        // hook route to express
        this.app[ item.method ]( item.route, exec );

        return item;
    }

    routerInitialize()
    {
        logger.trace( 'server.routerInitialize' );

        this.routes.map( ( item ) => this.hookRoute( item ) );

        // capture all unhandled routes
        this.routes.push( this.hookRoute( methodNotAllowed ) );

        // capture all unhandled errors that might occur
        this.app.use( ( e, req, res, next ) => {
            if ( e ) {
                res
                    .set( {
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Max-Age': 1728000,
                        'Content-Type': 'application/json; charset=utf-8',
                        'request-id': crypto.randomUUID()
                    } )
                    .status( 500 )
                    .json( { error: e.message || e } );
            }
            else {
                next();
            }
        } );
    }

    async loadRoutes()
    {
        logger.trace( 'server.loadRoutes' );

        this.routes = await recursivelyReadDirectory( config.get( 'server.routes' ) );
        this.routes = this.routes.filter( ( route ) => /([a-z0-9\s_\\.\-():])+(.m?t?jsx?)$/i.test( route ) );
        this.routes = this.routes.map( ( route ) => require( `${ route }` ) );
        this.routes = this.routes.sort( ( a ) => a.method.toUpperCase() === 'HEAD' ? -1 : 0 );
    }

    bindDocuments()
    {
        this.app.use( '/docs', express.static( 'docs' ) );
    }

    /**
     * initialize
     * @description
     * Hook `process` variables `uncaughtException`, `unhandledRejection`, and `exit` to handle any potential errors
     * that may occur. This will allow us to properly handle exit and log all non-V8 level errors without the program
     * crashing.
     */
    async initialize()
    {
        logger.trace( 'server.initialize' );

        // override process handlers to handle failures
        this.bindProcess();

        // setup express
        this.expressInitialize();
        await this.loadRoutes();

        this.bindDocuments();

        this.routerInitialize();
    }

    /**
     * onStart
     * @description
     * create instance of an http server and start listening on the port
     * @param {function?} cb - pm2 callback
     */
    onStart( cb = () => {} )
    {
        logger.trace( 'server.onStart' );

        this.server = this.app.listen(
            config.get( 'server.port' ),
            config.get( 'server.host' ),
            () => {
                logger.info( {
                    name: config.get( 'name' ),
                    version: config.get( 'version' ),
                    host: config.get( 'server.host' ),
                    port: config.get( 'server.port' )
                } );

                logger.info( 'server started' );

                cb();
            }
        );
    }

    /**
     * sensors
     * @description
     * bind pm2 sensors to server
     * @param {*} io - pass in from pm2
     */
    sensors( io )
    {
        logger.trace( 'server.sensors' );

        this.meters          = {};
        this.meters.reqMeter = io.meter( 'req/min' );
    }

    /**
     * actuators
     * @description
     * bind pm2 actuators to server
     * @param {*} io - pass in from pm2
     */
    actuators( io )
    {
        logger.trace( 'server.actuators' );

        io.action( 'process', ( reply ) => reply( { env: process.env } ) );
        io.action( 'server', ( reply ) => reply( { server: this.server } ) );
        io.action( 'config', ( reply ) => reply( { config: config } ) );
    }

    /**
     * onStop
     * @param {*} err - error
     * @param {function} cb - pm2 callback
     * @param {number} code - exit code
     * @param {string} signal - kill signal
     */
    onStop( err, cb = () => {}, code, signal )
    {
        logger.trace( 'server.onStop' );

        if ( this.server ) {
            this.server.close();
        }

        if ( err ) {
            logger.error( err );
        }

        if ( this.isClosed ) {
            logger.debug( 'shutdown after SIGINT, forced shutdown...' );
        }

        this.isClosed = true;

        logger.debug( `server exiting with code: ${ code } ${ signal }` );
        cb();
    }
}

/**
 * module.exports
 * @description
 * export Server class
 * @type {Server}
 */
module.exports = Server;
