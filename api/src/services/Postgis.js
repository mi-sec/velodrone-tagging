'use strict';

const
    KnexPostgis = require( 'knex-postgis' ),
    PostgresDB  = require( './PostgresDB' ),
    Postgis     = KnexPostgis( PostgresDB );

module.exports = Postgis;
