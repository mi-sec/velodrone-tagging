'use strict';

const { spawn } = require( 'child_process' );

// Hmm, convert to async version of this?
// https://nodejs.org/api/child_process.html#child_process_child_process_exec_command_options_callback
module.exports = function( cmd, ...params ) {
    return new Promise( ( res, rej ) => {
        const exec = spawn( cmd, params );
        const data = [];
        const err  = [];

        exec.stdout.on( 'data', ( d ) => data.push( d.toString() ) );
        exec.stderr.on( 'data', ( d ) => err.push( d.toString() ) );
        exec.on( 'error', ( err ) => rej( err ) );
        exec.on( 'close', ( code ) => {
            if ( err.length ) {
                err.push( `errored with code: ${ code }` );
                rej( err.join( '\n' ) );
            }
            else {
                res( data.join( '\n' ) );
            }
        } );
    } );
};
