<template>
    <v-container
        style="background-color: orange;"
        fluid
        mt-1
        pa-1
    >
        <v-card
            :dark="getDarkMode"
            elevation="5"
            outlined
            tile
        >
            <v-card-title class="subtitle-2" v-if="currentGeohash">
                <div>
                    Geohash:
                    <code class="font-weight-bold">{{ currentGeohash }}</code>
                </div>
            </v-card-title>

            <v-card-title class="subtitle-2" v-if="imageSelected">
                <div>
                    Image:
                    <code class="font-weight-bold">{{ imageSelected.properties.image_id }}</code>
                </div>
            </v-card-title>

            <v-card-text>
                <span>Object Count:</span>
            </v-card-text>

            <v-card-actions>
                <v-btn
                    :disabled="!currentGeohash || !imageSelected"
                    tile
                    :loading="loading"
                    @click="processArea()"
                >
                    Process Area
                </v-btn>
            </v-card-actions>

        </v-card>
    </v-container>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';

import Geohash          from '@geonet/geohash';
import turfBbox         from '@turf/bbox';
import turfArea         from '@turf/area';
import turfDistance     from '@turf/distance';
import * as turfHelpers from '@turf/helpers';
import { saveAs }       from 'file-saver';

export default {
    name: 'OptionsControl',
    data() {
        return {
            loading: false
        };
    },
    mounted() {
    },
    computed: {
        ...mapGetters( [ 'getDarkMode' ] ),
        ...mapState( 'draw', [ 'drawLayerId' ] ),
        ...mapState( 'map', [
            'mapDataSourceId',
            'mapSourceLayerId',
            'currentGeohash'
        ] ),
        ...mapGetters( 'map',
                       {
                           map: 'getMap',
                           mapObjects: 'onMapDataObjects'
                       }
        ),
        ...mapGetters( 'draw', { draw: 'getDraw' } ),
        ...mapGetters( 'imagery', [ 'getCurrentSource' ] ),
        imageSelected() {
            return this.$store.state[ this.getCurrentSource ].currentImageFeature;
        }
    },
    methods: {
        ...mapMutations( 'map', [
            'refreshMsaMapDataSource',
            'resetMapBounds',
            'toggleZoneSelection'
        ] ),

        async processArea() {
            this.loading = true;

            this.$eventBus.emit( 'open-loading-popup', {
                progress: 0
            } );

            const
                geohashFeature = Geohash.toGeoJSON( this.currentGeohash ),
                imageryStore   = this.$store.state[ this.getCurrentSource ];

            this.$eventBus.emit( 'update-loading-popup', {
                title: 'generating zip'
            } );

            const
                id        = `${ imageryStore.currentImageFeature.properties.image_id }-${ this.currentGeohash }`,
                zip       = this.$utils.generateZip(),
                zipFolder = zip.folder( id ),
                info      = {
                    id,
                    geohash: this.currentGeohash,
                    area: ( Math.round( turfArea( geohashFeature ) * 100 ) / 100 ),
                    bbox4326: turfBbox( geohashFeature ),
                    createdOn: Date.now(),
                    image_id: imageryStore.currentImageFeature.properties.image_id,
                    imageFeature: imageryStore.currentImageFeature
                };

            this.$eventBus.emit( 'update-loading-popup', {
                title: 'determining ground sample distance'
            } );

            const
                xDistance = turfDistance(
                    turfHelpers.point( [ info.bbox4326[ 0 ], info.bbox4326[ 1 ] ] ),
                    turfHelpers.point( [ info.bbox4326[ 2 ], info.bbox4326[ 1 ] ] ),
                    { units: info.imageFeature.properties.gsd_unit || 'meters' }
                ),
                yDistance = turfDistance(
                    turfHelpers.point( [ info.bbox4326[ 0 ], info.bbox4326[ 1 ] ] ),
                    turfHelpers.point( [ info.bbox4326[ 0 ], info.bbox4326[ 3 ] ] ),
                    { units: info.imageFeature.properties.gsd_unit || 'meters' }
                );

            let
                pixelWidth  = ( xDistance / info.imageFeature.properties.gsdx ) * 2,
                pixelHeight = ( yDistance / info.imageFeature.properties.gsdy ) * 2;

            if ( pixelWidth > info.imageFeature.properties.width ) {
                pixelWidth = info.imageFeature.properties.width;
            }

            if ( pixelHeight > info.imageFeature.properties.height ) {
                pixelHeight = info.imageFeature.properties.height;
            }

            info.imageSize = {
                width: pixelWidth,
                height: pixelHeight
            };

            info.epsg4326Url = imageryStore.component.generateChipUrl(
                info.imageSize,
                imageryStore.wms.url,
                'EPSG:4326',
                info.bbox4326
            );

            const
                epsg4326Png = await this.$axios( {
                    method: 'get',
                    url: info.epsg4326Url,
                    responseEncoding: 'base64',
                    responseType: 'arraybuffer',
                    onDownloadProgress: e => this.$eventBus.emit( 'update-loading-popup', {
                        title: 'downloading geohash',
                        progress: ( ( e.loaded / e.total ) * 100 ),
                        indeterminate: false
                    } )
                } );

            zipFolder.file(
                'epsg4326.png',
                Buffer.from( epsg4326Png.data, 'base64' ),
                { base64: true }
            );

            zipFolder.file( 'info.json', JSON.stringify( info ) );

            this.$eventBus.emit( 'update-loading-popup', {
                title: 'processing',
                progress: 0,
                indeterminate: true
            } );

            const content = await zip.generateAsync(
                { type: 'blob' },
                e => this.$eventBus.emit( 'update-loading-popup', {
                    title: 'processing',
                    progress: e.percent,
                    indeterminate: !( e.percent > 0 )
                } )
            );

            saveAs( content, `${ id }.zip` );

            try {
                const data = new FormData();
                data.append( id, content, `${ id }.zip` );

                await this.$axios( {
                    method: 'post',
                    baseURL: this.$store.state.config.api.baseUrl,
                    url: '/process/package',
                    headers: { 'Content-Type': 'multipart/form-data' },
                    data,
                    onUploadProgress: e => this.$eventBus.emit( 'update-loading-popup', {
                        title: 'uploading to api',
                        progress: ( ( e.loaded / e.total ) * 100 ),
                        indeterminate: false
                    } )
                } );
            }
            finally {
                setTimeout( () => {
                    this.loading = false;
                    this.$eventBus.emit( 'update-loading-popup', {
                        dialog: false
                    } );
                }, 200 );
            }

        }
    }
};
</script>
