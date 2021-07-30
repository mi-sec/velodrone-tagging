import turfPointWithin from '@turf/boolean-within';
import Geohash         from '@geonet/geohash';

export default {
    commitApiConfig( state, appConfig ) {
        state.config = appConfig;
    },

    commitTargetObjectList( state, data ) {
        state.targetObjects = data;
    },

    // query the on-map aoi layer items
    addMapAoi( state ) {
        this.$logger.trace( 'mutations.addMapAoi' );
        state.map.onMapAoi = state.map.mapObject.queryRenderedFeatures(
            { layers: [ state.map.mapAoiLayerId ] }
        );
    },

    // query the on-map draw layer items
    addMapData( state ) {
        this.$logger.trace( 'mutations.addMapData' );
        state.map.onMapData = state.map.mapObject.queryRenderedFeatures(
            { layers: [ state.map.mapDataLayerId ] }
        );
    },

    snapToGeohashBounds( state, e ) {
        this.$logger.trace( 'mutations.snapToGeohashBounds' );
        const source = state.map.mapObject.getSource( 'geohash-lines-source' );

        if ( !source ) {
            return;
        }

        const currentFeatures = source._data.features;

        if (
            state.map.mapLocked &&
            currentFeatures.length &&
            turfPointWithin( {
                type: 'Point',
                coordinates: [ e.lngLat.lng, e.lngLat.lat ]
            }, currentFeatures[ 0 ] )
        )
        {
            return;
        }

        state.map.currentGeohash = Geohash.encode( e.lngLat.lng, e.lngLat.lat, 6 );

        const feature = this.$utils.createGeohashPolygon( state.map.currentGeohash );

        state.map.mapObject.getSource( 'geohash-lines-source' ).setData( {
            type: 'FeatureCollection',
            features: [ feature ]
        } );

        state.map.mapObject.setMaxBounds( [ [ -180, -90 ], [ 180, 90 ] ] );

        state.map.mapObject.fitBounds(
            feature.properties.bbox,
            { duration: 200, padding: 100 },
            { newBounds: true }
        );

        const setMaxBoundsOnMoveEnd = ( evt ) => {
            if ( evt.newBounds ) {
                state.map.mapObject.off( 'moveend', setMaxBoundsOnMoveEnd );
                this.commit( 'lockMapBounds' );
            }
        };

        state.map.mapObject.on( 'moveend', setMaxBoundsOnMoveEnd );
    },

    registerMapGeohashSource( state ) {
        this.$logger.trace( 'mutations.registerMapGeohashSource' );
        state.map.mapObject.addSource(
            state.map.geohash.sourceId,
            {
                type: 'geojson',
                data: { type: 'FeatureCollection', features: [] },
                generateId: true
            }
        );
    },
    registerMapGeohashLayer( state ) {
        this.$logger.trace( 'mutations.registerMapGeohashLayer' );
        state.map.mapObject.addLayer( {
            id: state.map.geohash.layerId,
            type: state.map.geohash.geometryType,
            source: state.map.geohash.sourceId,
            paint: state.map.geohash.paint,
            filter: [ '==', 'type', 'geohash' ]
        }, state.map.draw.drawLayerId );
    },

    registerMsaMapDataSource( state ) {
        this.$logger.trace( 'mutations.registerMsaMapDataSource' );
        state.map.mapObject.addSource(
            state.map.mapDataSourceId,
            {
                type: 'vector',
                tiles: [
                    `${ process.env.VUE_APP_API_BASE_URL }msa/mvt/{z}/{x}/{y}`
                ],
                'line-width': 2,
                'line-opacity': [
                    'case',
                    [ 'boolean', [ 'feature-state', 'opacity' ], true ],
                    0.75,
                    0
                ]
            }
        );
    },

    registerMsaMapAoiLayer( state ) {
        this.$logger.trace( 'mutations.registerMsaMapAoiLayer' );
        state.map.mapObject.addLayer( {
            id: state.map.mapAoiLayerId,
            type: 'line',
            source: state.map.mapDataSourceId,
            'source-layer': state.map.mapSourceLayerId,
            paint: {
                'line-color': [
                    'match', [ 'get', 'type' ], 'aoi', 'rgb( 53, 175, 109 )',
                    'rgb( 175, 57, 47 )'
                ],
                'line-width': 4,
                'line-opacity': [
                    'case',
                    [ 'boolean', [ 'feature-state', 'opacity' ], true ],
                    0.75,
                    0
                ]
            },
            filter: [ '==', 'type', 'aoi' ]
        }, state.map.draw.drawLayerId );
    },

    registerMsaMapDataLayer( state ) {
        this.$logger.trace( 'mutations.registerMsaMapDataLayer' );
        state.map.mapObject.addLayer( {
            id: state.map.mapDataLayerId,
            type: 'line',
            source: state.map.mapDataSourceId,
            'source-layer': state.map.mapSourceLayerId,
            paint: {
                'line-color': [
                    'case',
                    [ 'boolean', [ 'feature-state', 'hover' ], false ],
                    'rgb(0,255,147)',
                    'rgb( 0, 152, 255 )'
                ],
                'line-width': 2,
                'line-opacity': [
                    'case',
                    [ 'boolean', [ 'feature-state', 'opacity' ], true ],
                    0.75,
                    0
                ]
            },
            filter: [
                'all',
                [ '==', 'type', 'object' ]
            ]
        }, state.map.mapAoiLayerId );
    },

    refreshMsaMapDataSource( state ) {
        this.$logger.trace( 'mutations.refreshMsaMapDataSource' );
        state.map.mapObject.removeLayer( state.map.mapAoiLayerId );
        state.map.mapObject.removeLayer( state.map.mapDataLayerId );
        state.map.mapObject.removeSource( state.map.mapDataSourceId );
        this.commit( 'registerMsaMapDataSource' );
        this.commit( 'registerMsaMapAoiLayer' );
        this.commit( 'registerMsaMapDataLayer' );
    },

    toggleZoneSelection( state, override = null ) {
        this.$logger.trace( 'mutations.toggleZoneSelection' );
        if ( override !== null ) {
            state.map.zoneSelection = override;
        }
        else {
            state.map.zoneSelection = !state.map.zoneSelection;
        }
    },

    lockMapBounds( state, bounds = null ) {
        this.$logger.trace( 'mutations.lockMapBounds' );
        state.map.mapLocked = true;
        bounds              = bounds || state.map.mapObject.getBounds();
        state.map.mapObject.setMaxBounds( bounds );
    },

    resetMapBounds( state ) {
        this.$logger.trace( 'mutations.resetMapBounds' );
        state.map.mapLocked = false;
        state.map.mapObject.setMaxBounds( [ [ -180, -90 ], [ 180, 90 ] ] );
    },

    setKeyboardInput( state, override ) {
        this.$logger.trace( 'mutations.setKeyboardInput' );
        if ( override !== undefined ) {
            state.keyboardInput = override;
        }
        else {
            state.keyboardInput = !state.keyboardInput;
        }
    }
};
