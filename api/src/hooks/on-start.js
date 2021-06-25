'use strict';

const
    config           = require( 'config' ),
    { promises: fs } = require( 'fs' ),
    logger           = require( '../services/logger' );

module.exports = async () => {
    logger.trace( 'application on-start' );

    const storagePath = config.get( 'local.storage' );

    // ensure the local storage path exists
    try {
        await fs.access( storagePath );
    }
    catch {
        await fs.mkdir( storagePath, { recursive: true } );
    }
};
