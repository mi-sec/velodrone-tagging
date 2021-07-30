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

const { nodeExternalsPlugin } = require( 'esbuild-node-externals' );

require( 'esbuild' ).build( {
    entryPoints: {
        api: 'entrypoint.api.js'
    },
    absWorkingDir: path.join( __dirname, 'src' ),
    platform: 'node',
    outdir: path.resolve( './make' ),
    bundle: argsMap.get( 'bundle' ),
    minify: argsMap.get( 'minify' ),
    plugins: [ nodeExternalsPlugin() ]
} )
    .catch( ( e ) => {
        console.error( e );
        process.exit( 1 );
    } );
