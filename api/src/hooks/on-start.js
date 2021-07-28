'use strict';

const
    config           = require( 'config' ),
    { promises: fs } = require( 'fs' ),
    logger           = require( '../services/logger' );

module.exports = async () => {
    logger.trace( 'application on-start' );

    const storagePath   = config.get( 'local.storage' );
    const uiStoragePath = config.get( 'ui.staticFile' );

    // ensure the local storage path exists
    try {
        await fs.access( storagePath );
    }
    catch {
        await fs.mkdir( storagePath, { recursive: true } );
    }

    // ensure the ui storage path exists
    try {
        await fs.access( uiStoragePath );
    }
    catch {
        await fs.mkdir( uiStoragePath, { recursive: true } );
    }
};
