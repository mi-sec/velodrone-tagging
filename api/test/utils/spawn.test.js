'use strict';

const
    { promises: fs } = require( 'fs' ),
    chai             = require( 'chai' ),
    { expect }       = chai;

const spawn = require( '../../src/api/utils/spawn' );

module.exports = function() {
    it( 'should execute cli tool "ls"', async () => {
        let ls = await spawn( 'ls', '-a' );
        ls     = ls.split( '\n' ).sort();
        ls     = ls.filter( ( d ) => !!d && d !== '.' && d !== '..' );

        let dir = await fs.readdir( process.cwd() );
        dir     = dir.sort();

        expect( ls ).to.be.an( 'array' ).and.have.length( dir.length );

        ls  = ls.filter( ( d ) => !!d && !d.startsWith( '.' ) );
        dir = dir.filter( ( d ) => !!d && !d.startsWith( '.' ) );

        expect( ls[ 0 ] ).to.eq( dir[ 0 ] );
    } );

    it( 'should fail to execute cli tool "badtool"', async () => {
        try {
            await spawn( 'badtool' );
        }
        catch ( e ) {
            expect( typeof e ).to.eq( 'object' );
            expect( e ).to.be.instanceOf( Error );
            expect( e.message ).to.eq( 'spawn badtool ENOENT' );
        }
    } );

    it( 'should fail to execute bad option "ls -Z"', async () => {
        try {
            await spawn( 'ls', '-Z' );
        }
        catch ( e ) {
            expect( typeof e ).to.eq( 'string' );
            expect( e ).to.satisfy(
                ( d ) => d.endsWith( 'errored with code: 1' )
            );
        }
    } );
};
