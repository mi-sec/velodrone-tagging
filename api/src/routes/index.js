'use strict';

const crypto  = require( 'crypto' );
const express = require( 'express' );
const router  = express.Router();
const logger  = require( '../services/logger' );

const getConfig                          = require( './get.config.js' );
const getVersion                         = require( './get.version.js' );
const cliGetCli                          = require( './cli/get.cli.js' );
const dbGetTableSchema                   = require( './db/get.table-schema.js' );
const dbGetTables                        = require( './db/get.tables.js' );
const dbPostRaw                          = require( './db/post.raw.js' );
const msaDeleteRemoveFeature             = require( './msa/delete.remove-feature.js' );
const msaGetId                           = require( './msa/get.id.js' );
const msaGetOperation                    = require( './msa/get.operation.js' );
const msaGetRaw                          = require( './msa/get.raw.js' );
const msaPostCreateFeatureBulk           = require( './msa/post.create-feature-bulk.js' );
const msaPostCreateFeature               = require( './msa/post.create-feature.js' );
const msaPutUpdateFeature                = require( './msa/put.update-feature.js' );
const toolsGetSphericalMercatorToGeojson = require( './tools/get.spherical-mercator-to-geojson.js' );
const toolsPostBboxToPolygon             = require( './tools/post.bbox-to-polygon.js' );
const toolsPostPolygonToBbox             = require( './tools/post.polygon-to-bbox.js' );
const dbItemDeleteItem                   = require( './db/item/delete.item.js' );
const dbItemGetItem                      = require( './db/item/get.item.js' );
const dbItemHeadItem                     = require( './db/item/head.item.js' );
const dbItemPatchItem                    = require( './db/item/patch.item.js' );
const dbItemPostItem                     = require( './db/item/post.item.js' );
const dbItemPutItem                      = require( './db/item/put.item.js' );
const msaInfoGetListGeohashes            = require( './msa/info/get.list-geohashes.js' );

const routes = [
    getConfig,
    getVersion,
    cliGetCli,
    dbGetTableSchema,
    dbGetTables,
    dbPostRaw,
    msaDeleteRemoveFeature,
    msaGetId,
    msaGetOperation,
    msaGetRaw,
    msaPostCreateFeatureBulk,
    msaPostCreateFeature,
    msaPutUpdateFeature,
    toolsGetSphericalMercatorToGeojson,
    toolsPostBboxToPolygon,
    toolsPostPolygonToBbox,
    dbItemDeleteItem,
    dbItemGetItem,
    dbItemHeadItem,
    dbItemPatchItem,
    dbItemPostItem,
    dbItemPutItem,
    msaInfoGetListGeohashes
]
    .sort( ( item ) => item.method.toLowerCase() === 'head' ? -1 : 0 );

if ( process.env.NODE_ENV !== 'production' ) {
    ( async () => {
        const recursivelyReadDirectory = require( '../utils/recursively-read-directory' );
        const { camelize }             = require( '../utils/general' );

        let dir = await recursivelyReadDirectory( __dirname );
        dir     = dir.filter( ( filename ) => filename !== __filename );

        if ( dir.length !== routes.length ) {
            dir = dir.map( ( filename ) => {
                let declarationName = filename;
                declarationName     = declarationName.replace( __dirname, '' );
                declarationName     = declarationName.replace( /\.js/g, '' );
                declarationName     = declarationName.replace( /\//g, ' ' );
                declarationName     = declarationName.replace( /\./g, ' ' );
                declarationName     = declarationName.replace( /-/g, ' ' );
                declarationName     = declarationName.trim();
                declarationName     = camelize( declarationName );

                const requireName = filename.replace( __dirname, '' );
                return `const ${ declarationName } = require( '.${ requireName }' );`;
            } );

            console.log( dir.join( '\n' ) );

            throw new Error( 'Not all routes are registered' );
        }
    } )();
}

module.exports = ( server ) => {
    for ( let i = 0; i < routes.length; i++ ) {
        const item = routes[ i ];
        logger.trace( `server.hookRoute ${ item.method } ${ item.route }` );

        // TODO::: add a hook to check for authentication if the handler file requires it
        const exec = [
            ( req, res, next ) => ( server.meters.reqMeter.mark(), next() ),
            ( req, res, next ) => {
                if ( res ) {
                    try {
                        res.set( { 'request-id': crypto.randomUUID() } );
                        item.exec( req, res, next );
                    }
                    catch ( e ) {
                        res.status( 500 ).json( { error: 'unknown server error', ...e } );
                    }
                }
                else {
                    res.status( 500 ).json( { error: 'unknown server error' } );
                }
            }
        ];

        // hook route to express
        router[ item.method.toLowerCase() ]( item.route, exec );
    }

    return router;
};
