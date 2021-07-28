<template>
    <v-container
        grid-list-xl
        style="background-color: orange;"
        fluid
        ma-1 pa-0 pl-1 pt-1 pb-1
    >
        <v-card
            v-for="( val, key ) in onMapDataAois"
            :key="key"
            class="mb-1"
            elevation="5"
            outlined
            tile
            ma-2
        >
            <v-layout wrap row ma-2 pa-1>
                <v-flex
                    xs10
                    ma-0
                    pa-0
                    v-ripple
                    @click="snapToBounds( val )"
                >
                    id: {{ val.id }}
                    <v-card-text
                        v-for="( pval, pkey ) in val.properties"
                        :key="pkey"
                        height="30"
                        class="ma-0 pa-0 text-caption"
                    >
                        {{ pkey.startsWith( '__' ) ? pkey.substr( 2, pkey.length ) : pkey }}: {{ pval }}
                    </v-card-text>
                </v-flex>

                <v-flex xs1 ma-0 pa-0>
                    <v-layout align-end justify-right column>

                        <v-tooltip
                            v-for="( item, i ) in aoiControlItems"
                            :key="i"
                            right
                            nudge-right="14px"
                        >
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    x-small
                                    class="mb-1"
                                    :fab="item.fab( val )"
                                    :color="item.color( val )"
                                    @click="item.click( val )"
                                >
                                    <v-icon>
                                        {{ item.iconInner( val ) }}
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>{{ item.name() }}</span>
                        </v-tooltip>
                    </v-layout>
                </v-flex>

            </v-layout>
        </v-card>
    </v-container>
</template>

<script>
import { mapMutations, mapState, mapGetters } from 'vuex';

import turfBbox from '@turf/bbox';
import Geohash  from '@geonet/geohash';

// TODO::: make metadata module
// TODO::: make a bunch of robust aoi information things: area, lat/lng, show time created, etc.
// TODO:: add search options from AOI metadata

export default {
    name: 'AoiControl',
    data() {
        return {
            showingGrid: false,
            aoiControlItems: [
                {
                    name: () => 'Snap To',
                    fab: () => {},
                    color: () => {},
                    iconInner: () => 'mdi-arrow-expand-all',
                    click: ( val ) => this.snapToBounds( val )
                },
                {
                    name: () => this.showingGrid ? 'Hide Grid' : 'Show Grid',
                    fab: () => {},
                    color: () => this.showingGrid ? 'blue' : '',
                    iconInner: () => this.showingGrid ? 'mdi-grid-off' : 'mdi-grid',
                    click: ( val ) => this.showingGrid ? this.removeGeohashGrid() : this.showGeohashGrid( val )
                },
                {
                    name: () => 'Edit Metadata',
                    fab: () => {},
                    color: () => {},
                    iconInner: () => 'mdi-pencil-plus',
                    click: ( val ) => this.editMetadata( val )
                },
                {
                    name: () => 'Edit Geometry',
                    fab: ( val ) => val.state.editing,
                    color: ( val ) => val.state.editing ? 'success' : '',
                    iconInner: ( val ) => val.state.editing ? 'mdi-check' : 'mdi-map-marker-path',
                    click: ( val ) => val.state.editing ? this.updateAoi( val ) : this.editAoi( val )
                },
                {
                    name: () => 'Delete AOI',
                    fab: () => {},
                    color: () => 'error',
                    iconInner: () => 'mdi-delete-outline',
                    click: ( val ) => this.deleteAoi( val )
                }
            ]
        };
    },
    computed: {
        ...mapGetters( [ 'onMapDataAois' ] )
        // TODO: one day, fix the issue where every show-grid button activates when only one is pushed
    },
    methods: {
        ...mapMutations( [
            'refreshMsaMapDataSource',
            'resetMapBounds',
            'toggleZoneSelection'
        ] ),
        async snapToBounds( feature ) {
            const extent = await this.$api.getFeatures( feature.id, 'extent' );

            this.resetMapBounds();
            this.$store.state.map.mapObject.fitBounds( extent, {
                padding: 100,
                animate: false
            } );
        },

        editMetadata( feature ) {
            this.$eventBus.emit( 'open-metadata-popup', {
                title: 'AOI Metadata',
                feature
            } );
        },

        deleteAoi( feature ) {
            this.$eventBus.emit( 'open-confirm-popup', {
                title: 'Delete AOI',
                text: `Are you sure you want to delete AOI: ${ feature.id }?`,
                cancelText: 'Cancel',
                cancelAction: () => {},
                acceptText: 'Accept',
                acceptAction: async () => {
                    await this.$api.deleteFeature( feature.id );
                    this.removeGeohashGrid();
                    this.$store.state.map.draw.drawObject.delete( feature.id );
                    this.refreshMsaMapDataSource();
                }
            } );
        },

        async updateAoi( feature ) {
            await this.$api.updateFeature(
                this.$store.state.map.draw.drawObject.get( feature.id )
            );

            this.$store.state.map.draw.drawObject.delete( feature.id );

            this.$store.state.map.mapObject.setFeatureState(
                {
                    id: feature.id,
                    source: this.$store.state.map.mapDataSourceId,
                    sourceLayer: this.$store.state.map.mapSourceLayerId
                },
                {
                    editing: false,
                    opacity: true
                }
            );

            this.refreshMsaMapDataSource();
        },

        async editAoi( feature ) {
            this.removeGeohashGrid();

            this.toggleZoneSelection( false );

            this.$store.state.map.mapObject.setFeatureState(
                {
                    id: feature.id,
                    source: this.$store.state.map.mapDataSourceId,
                    sourceLayer: this.$store.state.map.mapSourceLayerId
                },
                {
                    editing: true,
                    opacity: false
                }
            );

            const geojson = await this.$api.getFeatures( feature.id, 'geojson' );

            this.$store.state.map.draw.drawObject.add( geojson );

            this.$store.state.map.draw.drawObject.changeMode( 'direct_select', {
                featureId: `${ geojson.id }`
            } );

            this.resetMapBounds();
            this.$store.state.map.mapObject.fitBounds( turfBbox( geojson ), {
                padding: 100,
                animate: false
            } );
        },
        removeGeohashGrid() {
            this.showingGrid = false;

            const source = this.$store.state.map.mapObject.getSource( 'geohash-lines-source' );

            if ( source ) {
                source.setData( { type: 'FeatureCollection', features: [] } );
            }
        },
        async showGeohashGrid( feature ) {
            this.showingGrid = true;

            const
                extent  = await this.$api.getFeatures( feature.id, 'extent' ),
                results = { type: 'FeatureCollection', features: [] };

            this.resetMapBounds();
            this.$store.state.map.mapObject.fitBounds( extent, {
                padding: 100,
                animate: false
            } );

            new Geohash.GeohashStreamGeoJSON( {
                minLng: extent[ 0 ],
                minLat: extent[ 1 ],
                maxLng: extent[ 2 ],
                maxLat: extent[ 3 ],
                precision: 6,
                includeGeohashAsProperty: true,
                includeFeatureBBox: true
            } )
                .on( 'data', ( d ) => {
                    d = JSON.parse( d.toString() );
                    d = this.$utils.createGeohashPolygon( d );
                    results.features.push( d );
                } )
                .on( 'end', () => {
                    this.$store.state.map.mapObject
                        .getSource( this.$store.state.map.geohash.sourceId )
                        .setData( results );
                } );
        }
    }
};
</script>
