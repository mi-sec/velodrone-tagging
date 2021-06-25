process.env.SUPPRESS_NO_CONFIG_WARNING = 'y';

const io = require( '@pm2/io' );

const onStart = require( './hooks/on-start' );
const onStop  = require( './hooks/on-stop' );

const Server = require( './core/Server' );

class API extends io.Entrypoint {
    async onStart( cb = () => {} )
    {
        await onStart();
        // start the server
        this.server = new Server();
        await this.server.initialize();
        this.server.onStart( () => {
            if ( !process.env.TESTING && process.send ) {
                process.send( 'ready' );
            }

            cb();
        } );
    }

    // This is the very last method called on exit || uncaught exception
    async onStop( err, cb = () => {}, code, signal ) {
        await onStop();

        this.server.onStop( err, cb, code, signal );

        if ( err ) {
            console.error( err );
        }

        console.log( `App has exited with code ${ code }, ${ signal }` );
    }

    // Here we declare some process metrics
    sensors()
    {
        this.server.sensors( this.io );
    }

    // Here are some actions to interact with the app in live
    actuators()
    {
        this.server.actuators( this.io );
    }
}

( () => new API() )();
