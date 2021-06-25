'use strict';

module.exports = function( command, params ) {
    if ( typeof params !== 'object' ) {
        throw new Error( 'cli query params must be typeof "object"' );
    }

    const query = [];
    const keys  = Object.keys( params );

    for ( let i = 0; i < keys.length; i++ ) {
        let key = keys[ i ];
        if ( !/^--/.test( key ) ) {
            const k     = `--${ key }`;
            params[ k ] = params[ key ];
            delete params[ key ];
            key = k;
        }

        query.push( key );
        query.push( params[ key ] );
    }

    query.unshift( command );

    return query;
};
