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

import { onCreate, onUpdate, onDelete } from '@/plugins/map/drawEvents';
import setupDrawAoi                     from '@/plugins/map/setupDrawAoi';
import setupDrawObject                  from '@/plugins/map/setupDrawObject';

MapboxGL.accessToken = 'pk.eyJ1IjoicGFyZWxsaW4iLCJhIjoiY2phNzhveXdwOGp3djMzcGcxYTUweW5lbSJ9.0vACz0ISAPpVAWkHLJ0Mlg';

export default {
    name: 'Map',
    data: () => ( {} ),
    mounted() {


        this.$store.state.map.mapObject.on( 'load', () => {
            this.$store.state.map.mapObject.addLayer( {
                id: this.$store.state.map.draw.drawLayerId,
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

            // register MSA data source
            this.$store.commit( 'registerMsaMapDataSource' );
            // register MSA AOI data layer
            this.$store.commit( 'registerMsaMapAoiLayer' );
            // register MSA Standard data layer
            this.$store.commit( 'registerMsaMapDataLayer' );
            // register on-map Geohash source
            this.$store.commit( 'registerMapGeohashSource' );
            // register on-map Geohash layer
            this.$store.commit( 'registerMapGeohashLayer' );


            this.$store.state.map.draw.drawObject = new MapboxDraw( {
                displayControlsDefault: false,
                modes: MapboxDraw.modes
            } );

            setupDrawAoi( this, this.$store.state.map.draw.drawObject );
            setupDrawObject( this, this.$store.state.map.draw.drawObject );

            // this.$store.state.map.mapObject.on( 'draw.create', ( evt ) => onCreate( evt, this ) );
            // this.$store.state.map.mapObject.on( 'draw.update', ( evt ) => onUpdate( evt, this ) );
            // this.$store.state.map.mapObject.on( 'draw.delete', ( evt ) => onDelete( evt, this ) );

            this.$store.state.map.mapObject.addControl( this.$store.state.map.draw.drawObject );

            this.$store.subscribe( ( mutation, state ) => {
                // console.log( mutation );
                if ( mutation.type === 'toggleZoneSelection' ) {
                    this.$store.state.map.mapObject.off( 'click', this.snapToGeohashBounds );

                    if ( state.map.zoneSelection ) {
                        this.$store.state.map.mapObject.on( 'click', this.snapToGeohashBounds );
                    }
                }
            } );

            this.$store.state.map.mapObject.on( 'idle', this.addMapAoi );
            this.$store.state.map.mapObject.on( 'idle', this.addMapData );
        } );

        // this.refreshTargetObjects();
    },
    computed: {
        // ...mapState( [ 'draw' ] ),
        // ...mapState( [ 'map' ] )
    },
    methods: {
        ...mapMutations( [
            'addMapData',
            'addMapAoi',
            'snapToGeohashBounds'
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
