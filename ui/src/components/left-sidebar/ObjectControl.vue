<template>
    <v-container
        grid-list-xl
        style="background-color: orange;"
        fluid
        ma-0
        pa-0
    >
        <v-card
            v-for="( val, key ) in mapObjects"
            :key="key"
            :dark="getDarkMode"
            class="mb-1"
            elevation="5"
            outlined
            tile
            ma-1
            v-on:mouseenter="hoverObject( val, true )"
            v-on:mouseleave="hoverObject( val, false )"
        >
            <v-layout wrap row ma-2 pa-2>

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
                        class="ma-0 pa-0"
                    >
                        {{ pkey.startsWith( '__' ) ? pkey.substr( 2, pkey.length ) : pkey }}: {{ pval }}
                    </v-card-text>
                </v-flex>

                <v-flex xs1 ma-0 pa-1>
                    <v-layout align-center justify-center column>

                        <v-tooltip right nudge-right="14px">
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    x-small text icon
                                    @click="editMetadata( val )"
                                >
                                    <v-icon>mdi-pencil-plus</v-icon>
                                </v-btn>
                            </template>
                            <span>Edit Metadata</span>
                        </v-tooltip>

                        <v-tooltip right nudge-right="14px">
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    x-small text icon
                                    @click="deleteObject( val )"
                                >
                                    <v-icon>mdi-delete-outline</v-icon>
                                </v-btn>
                            </template>
                            <span>Delete Object</span>
                        </v-tooltip>

                    </v-layout>
                </v-flex>

                <v-flex xs1 ma-0 pa-1>
                    <v-layout align-center justify-center column>

                        <v-tooltip right>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    x-small text icon
                                    @click="snapToBounds( val )"
                                >
                                    <v-icon>mdi-arrow-expand-all</v-icon>
                                </v-btn>
                            </template>
                            <span>Snap To</span>
                        </v-tooltip>

                        <v-tooltip right>
                            <template v-slot:activator="{ on }">
                                <v-btn
                                    v-on="on"
                                    x-small
                                    :icon="!val.state.editing"
                                    :fab="val.state.editing"
                                    :color="val.state.editing ? 'success' : ''"
                                    @click="val.state.editing ? updateObject( val ) : editObject( val )"
                                >
                                    <v-icon>
                                        {{ val.state.editing ? 'mdi-check' : 'mdi-map-marker-path' }}
                                    </v-icon>
                                </v-btn>
                            </template>
                            <span>Edit Geometry</span>
                        </v-tooltip>

                        <v-menu>
                            <template v-slot:activator="{ on: menu }">
                                <v-tooltip right>
                                    <template v-slot:activator="{ on: tooltip }">
                                        <v-btn
                                            v-on="{ ...tooltip, ...menu }"
                                            icon
                                            x-small
                                            :color="
												targetObjects &&
												Object.prototype.hasOwnProperty.call( val.properties, '__class' ) ?
												'success' :
												'error'
											"
                                            :disabled="!targetObjects"
                                        >
                                            <v-icon>mdi-target</v-icon>
                                        </v-btn>
                                    </template>
                                    <span>Select Classifier</span>
                                </v-tooltip>
                            </template>
                            <v-list dense>
                                <v-list-item
                                    v-for="( tobj, i ) in targetObjects"
                                    :key="i"
                                    @click="selectTargetObject( tobj, val )"
                                >
                                    <v-list-item-title>{{ tobj.object_name }}</v-list-item-title>
                                </v-list-item>
                            </v-list>
                        </v-menu>

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

export default {
    name: 'ObjectControl',
    data() {
        return {
            showingGrid: false
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
            'targetObjects'
        ] ),
        ...mapGetters( 'map',
            {
                map: 'getMap',
                mapObjects: 'onMapDataObjects'
            }
        ),
        ...mapGetters( 'draw', { draw: 'getDraw' } )
    },
    methods: {
        ...mapMutations( 'map', [
            'refreshMsaMapDataSource',
            'resetMapBounds',
            'toggleZoneSelection'
        ] ),
        async snapToBounds( feature ) {
            const extent = await this.$api.getFeatures( feature.id, 'extent' );

            this.resetMapBounds();
            this.map.fitBounds( extent, {
                padding: 100,
                animate: false
            } );
        },

        editMetadata( feature ) {
            this.$eventBus.emit( 'open-metadata-popup', {
                title: 'Object Metadata',
                feature
            } );
        },

        deleteObject( feature ) {
            this.$eventBus.emit( 'open-confirm-popup', {
                title: 'Delete Object',
                width: '400px',
                text: `Are you sure you want to delete Object: ${ feature.id }?`,
                cancelText: 'Cancel',
                cancelAction: () => {},
                acceptText: 'Accept',
                acceptAction: async () => {
                    await this.$api.deleteFeature( feature.id );
                    this.removeGeohashGrid();
                    this.draw.delete( feature.id );
                    this.refreshMsaMapDataSource();
                }
            } );
        },

        async updateObject( feature ) {
            await this.$api.updateFeature( this.draw.get( feature.id ) );

            this.draw.delete( feature.id );

            this.map.setFeatureState(
                {
                    id: feature.id,
                    source: this.mapDataSourceId,
                    sourceLayer: this.mapSourceLayerId
                },
                {
                    editing: false,
                    opacity: true
                }
            );

            this.refreshMsaMapDataSource();
        },

        async editObject( feature ) {
            this.removeGeohashGrid();

            this.toggleZoneSelection( false );

            this.map.setFeatureState(
                {
                    id: feature.id,
                    source: this.mapDataSourceId,
                    sourceLayer: this.mapSourceLayerId
                },
                {
                    editing: true,
                    opacity: false
                }
            );

            const geojson = await this.$api.getFeatures( feature.id, 'geojson' );

            this.draw.add( geojson );

            this.draw.changeMode( 'direct_select', {
                featureId: `${ geojson.id }`
            } );

            this.resetMapBounds();
            this.map.fitBounds( turfBbox( geojson ), {
                padding: 100,
                animate: false
            } );
        },
        removeGeohashGrid() {
            this.showingGrid = false;

            const source = this.map.getSource( 'geohash-lines-source' );

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
            this.map.fitBounds( extent, {
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
                .on( 'data', d => {
                    d = JSON.parse( d.toString() );
                    d = this.$utils.createGeohashPolygon( d );
                    results.features.push( d );
                } )
                .on( 'end',
                    () => this.map.getSource( 'geohash-lines-source' ).setData( results )
                );
        },

        hoverObject( obj, hoverOn ) {
            this.map.setFeatureState(
                {
                    id: obj.id,
                    source: obj.source,
                    sourceLayer: obj.sourceLayer
                },
                { hover: hoverOn }
            );
        },

        async selectTargetObject( classifier, obj ) {
            await this.$api.patchUpdate( 'geodata', obj.id, [
                {
                    op: 'add',
                    path: '/properties/target_object_id',
                    value: classifier.id
                },
                {
                    op: 'add',
                    path: '/properties/target_object',
                    value: classifier.object_name
                },
                {
                    op: 'add',
                    path: '/properties/__class',
                    value: classifier.object_name
                }
            ] );

            this.$store.commit( 'refreshMsaMapDataSource' );
            // TODO:: notify the user of successful update
        }
    }
};
</script>
