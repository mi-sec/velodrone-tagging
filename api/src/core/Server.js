'use strict';

const
    config      = require( 'config' ),
    express     = require( 'express' ),
    cors        = require( 'cors' ),
    bodyParser  = require( 'body-parser' ),
    expressPino = require( 'express-pino-logger' ),
    crypto      = require( 'crypto' );

const
    logger           = require( '../services/logger' ),
    routes           = require( '../routes' ),
    methodNotAllowed = require( './method-not-allowed' );

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

        if ( process.env.NODE_ENV === 'production' ) {
            this.app.use( '/', express.static( config.get( 'ui.staticFile' ) ) );
        }
    }

    bindDocuments()
    {
        logger.trace( 'server.bindDocuments' );
        this.app.use( '/docs', express.static( 'docs' ) );
    }

    loadRoutes()
    {
        logger.trace( 'server.loadRoutes' );
        this.app.use( '/api', routes( this ) );
    }

    routerInitialize()
    {
        logger.trace( 'server.routerInitialize' );

        this.bindDocuments();
        this.loadRoutes();

        // capture all unhandled routes
        this.app[ methodNotAllowed.method ]( methodNotAllowed.route, methodNotAllowed.exec );

        // capture all unhandled errors that might occur
        this.app.use( ( e, req, res, next ) => {
            if ( e ) {
                return res
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
