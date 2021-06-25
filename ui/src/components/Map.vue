<template>
    <div
        id="map"
        ref="map"
    >
    </div>
</template>

<script>
import { mapActions, mapState, mapMutations } from 'vuex';

import 'mapbox-gl/dist/mapbox-gl.css';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';

import MapboxGL   from 'mapbox-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';

import setupDrawAoi    from '@/plugins/map/setupDrawAoi';
import setupDrawObject from '@/plugins/map/setupDrawObject';

MapboxGL.accessToken = 'pk.eyJ1IjoicGFyZWxsaW4iLCJhIjoiY2phNzhveXdwOGp3djMzcGcxYTUweW5lbSJ9.0vACz0ISAPpVAWkHLJ0Mlg';

export default {
    name: 'Map',
    data: () => ( {} ),
    computed: {
        ...mapState( 'draw', [ 'drawLayerId' ] ),
        ...mapState( 'map', [
            // the id of the source on mapbox canvas
            'mapDataSourceId',
            // the id of the mvt source-layer = "geodata"
            'mapSourceLayerId',

            // the id of the aoi layer to display from source
            'mapAoiLayerId',

            // the id of the data layer to display from source
            'mapDataLayerId'
        ] )
    },
    mounted() {
        const map = new MapboxGL.Map( {
            container: 'map',
            hash: true,
            customAttribution: 'mi-sec velodrone',
            style: 'mapbox://styles/mapbox/light-v10',
            pitchWithRotate: false,
            preserveDrawingBuffer: true
        } );

        map.on( 'load', () => {
            map.addLayer( {
                id: this.drawLayerId,
                type: 'fill',
                readonly: true,
                source: {
                    type: 'geojson',
                    data: null
                },
                paint: {
                    'fill-color': {
                        property: 'area',
                        stops: [
                            [ 0, 'rgb( 53, 175, 109 )' ],
                            [ 20000000, '#f00' ]
                        ]
                    }
                }
            } );

            map.addSource( this.mapDataSourceId, {
                type: 'vector',
                tiles: [
                    `${ this.config.api.baseUrl }msa/mvt/{z}/{x}/{y}`
                ],
                'line-width': 2,
                'line-opacity': [
                    'case',
                    [ 'boolean', [ 'feature-state', 'opacity' ], true ],
                    0.75,
                    0
                ]
            } );

            map.addLayer( {
                id: this.mapAoiLayerId,
                type: 'line',
                source: this.mapDataSourceId,
                'source-layer': this.mapSourceLayerId,
                paint: {
                    'line-color': [
                        'match', [ 'get', 'type' ], 'aoi', 'rgb( 53, 175, 109 )',
                        'rgb( 175, 57, 47 )'
                    ],
                    'line-width': 2,
                    'line-opacity': [
                        'case',
                        [ 'boolean', [ 'feature-state', 'opacity' ], true ],
                        0.75,
                        0
                    ]
                },
                filter: [ '==', 'type', 'aoi' ]
            }, this.drawLayerId );

            map.addLayer( {
                id: this.mapDataLayerId,
                type: 'line',
                source: this.mapDataSourceId,
                'source-layer': this.mapSourceLayerId,
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
            }, this.mapAoiLayerId );

            map.on( 'idle', this.addMapData );
            map.on( 'idle', this.addMapAoi );

            const draw = new MapboxDraw( {
                displayControlsDefault: false,
                modes: MapboxDraw.modes
            } );

            setupDrawAoi( this, draw );
            setupDrawObject( this, draw );

            // map.on( 'draw.create', evt => onCreate( evt, this ) );
            // map.on( 'draw.update', evt => onUpdate( evt, this ) );
            // map.on( 'draw.delete', evt => onDelete( evt, this ) );

            map.addControl( draw );
            this.addDraw( draw );

            this.$store.subscribe( ( mutation, state ) => {
                if ( mutation.type === 'map/toggleZoneSelection' ) {
                    map.off( 'click', this.snapToGeohashBounds );

                    if ( state.map.zoneSelection ) {
                        map.on( 'click', this.snapToGeohashBounds );
                    }
                }
            } );
        } );

        this.addMap( map );

        this.refreshTargetObjects();
    },
    methods: {
        ...mapMutations( 'map', [
            'addMap',
            'addMapAoi',
            'addMapData',
            'snapToGeohashBounds'
        ] ),
        ...mapMutations( 'draw', [ 'addDraw' ] ),
        ...mapActions( 'sidebar', [
            'initComponent',
            'openSidebarView'
        ] )
    }
};
</script>

<style>
#map {
    position: absolute;

    width: 100%;
    min-width: 100%;
    height: 100%;
    min-height: 100%;
}

.mapboxgl-ctrl-logo {
    display: none !important;
}
</style>
