'use strict';

process.env.NODE_ENV = 'testing';
process.env.TESTING  = 'true';
process.env.API_PORT = '3001';

const
    path              = require( 'path' ),
    { promises: fs }  = require( 'fs' ),
    chai              = require( 'chai' ),
    chaiHttp          = require( 'chai-http' ),
    { name, version } = require( '../package' );

process.env.API_LOCAL_DATABASE = path.resolve( 'testing.db' );

chai.use( chaiHttp );

const
    onStart              = require( '../src/api/hooks/on-start' ),
    onStop               = require( '../src/api/hooks/on-stop' ),
    Server               = require( '../src/api/core/Server' ),
    utilsSpawnTest       = require( './utils/spawn.test' ),
    serviceDatabaseTests = require( './services/database.test' ),
    routerDatabaseTests  = require( './routers/database.test' );

const server = new Server();
// let app;

before( async () => {
    await onStart();
    console.log( server );
    // start the server
    await server.initialize();
    server.onStart();
} );

describe( `${ name } v${ version }`, function() {
    describe( 'utils', () => {
        describe( 'spawn test', utilsSpawnTest.bind( this ) );
    } );

    describe( 'services', () => {
        describe( 'database test', serviceDatabaseTests.bind( this ) );
    } );

    describe( 'routers', () => {
        console.log( server );
        // describe( 'database router test', routerDatabaseTests.bind( this, app ) );
    } );
} );

after( async () => {
    server.onStop();
    await onStop();
    await fs.unlink( process.env.API_LOCAL_DATABASE );
    process.exit();
} );
