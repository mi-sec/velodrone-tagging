const path = require( 'path' );

const args    = process.argv.slice( 2 );
const argsMap = args.reduce( ( map, arg ) => {
    let [ key, val ] = arg.split( '=' );

    // remove dashes if they're present
    key = /^--/.test( key ) ? key.slice( 2 ) : key;

    if ( !map.has( key ) ) {
        val = val || true;
        map.set( key, val );
    }

    return map;
}, new Map() );

require( 'esbuild' ).build( {
    entryPoints: {
        api: 'entrypoint.api.js',
        scheduler: 'entrypoint.scheduler.js'
    },
    absWorkingDir: path.join( __dirname, '/src' ),
    platform: argsMap.get( 'platform' ) || 'node',
    outdir: argsMap.get( 'outdir' ) || path.resolve( '../dist' ),
    bundle: argsMap.get( 'bundle' ),
    minify: argsMap.get( 'minify' )
} )
    .catch( () => process.exit( 1 ) );