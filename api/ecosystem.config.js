'use strict';

const
    { name }     = require( './package.json' ),
    path         = require( 'path' ),
    isProduction = process.argv.includes( 'production' );

require( 'dotenv' ).config();

const apps = [
    {
        name,
        script: path.resolve( __dirname, isProduction ? './api.js' : './src/entrypoint.api.js' ),
        exec_mode: 'cluster',
        instances: isProduction ? 0 : 1,
        instance_var: 'INSTANCE_ID',
        watch: !isProduction,
        cwd: __dirname,
        ignore_watch: [
            '.git',
            '.nyc_output',
            'node_modules',
            'database.db*'
        ],
        max_memory_restart: '1G',
        node_args: [
            '--no-warnings',
            '--max-old-space-size=8192'
        ],
        env: {
            NODE_ENV: 'development'
        },
        env_production: {
            NODE_ENV: 'production'
        }
    }
];

module.exports = { apps };
