'use strict';

const
    config     = require( 'config' ),
    PostgresDB = require( 'knex' )( config.get( 'secret.database.configuration' ) );

module.exports = PostgresDB;
