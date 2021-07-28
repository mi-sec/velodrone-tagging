<template>
    <v-layout justify-center>
        <v-dialog v-model="dialog" scrollable persistent max-width="600px">
            <v-card>
                <v-card-title>
                    <v-layout row ml-2>
                        <v-flex xs4>
                            <span class="headline">{{ title }}</span>
                        </v-flex>

                        <v-flex xs2>
                            <span class="subtitle-1">
                                id: {{ feature.id }}
                            </span>
                        </v-flex>

                        <v-flex xs6>
                            <span class="subtitle-1">
                                Created: {{ created }}
                            </span>
                        </v-flex>

                    </v-layout>
                </v-card-title>
                <v-divider></v-divider>
                <v-card-text style="height: 300px;">
                    <v-container grid-list-md>
                        <v-layout wrap>

                            <v-flex
                                xs12
                                v-for="( item, i ) in metadata"
                                :key="i"
                            >
                                <v-layout row>
                                    <v-flex xs6>
                                        <v-text-field
                                            v-model="item[ 0 ]"
                                            :value="item[ 0 ]"
                                            label="Key"
                                        ></v-text-field>
                                    </v-flex>
                                    <v-flex xs6>
                                        <v-text-field
                                            v-model="item[ 1 ]"
                                            :value="item[ 1 ]"
                                            label="Value"
                                        ></v-text-field>
                                    </v-flex>
                                </v-layout>
                            </v-flex>

                            <v-flex xs12>
                                <v-btn
                                    color="success"
                                    dark
                                    bottom
                                    right
                                    small
                                    fab
                                    @click="addMetadataProperty()"
                                >
                                    <v-icon>mdi-plus</v-icon>
                                </v-btn>
                            </v-flex>

                        </v-layout>
                    </v-container>
                </v-card-text>
                <v-divider></v-divider>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn color="blue darken-1" text @click="cancel()">{{ cancelText }}</v-btn>
                    <v-btn color="blue darken-1" text @click="accept()">{{ acceptText }}</v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
import { mapMutations } from 'vuex';

import moment from 'moment';

export default {
    name: 'EditMetadataForm',
    data() {
        return {
            dialog: false,
            title: '',
            feature: {},
            metadata: [],
            rootProperties: {},
            cancelText: 'Cancel',
            cancelAction: () => {},
            acceptText: 'Accept',
            acceptAction: () => {}
        };
    },
    mounted() {
        this.$eventBus.on( 'open-metadata-popup', data => {
            this.dialog = true;

            if ( !data.feature ) {
                console.error( '"feature" is required' );
            }

            this.setKeyboardInput( true );

            this.title   = data.title;
            this.feature = data.feature;

            this.metadata = Object.keys( this.feature.properties ).reduce(
                ( r, key ) => {
                    if ( key.startsWith( '__' ) ) {
                        r.push( [
                            key.substr( 2, key.length ),
                            this.feature.properties[ key ]
                        ] );
                    }
                    else {
                        this.rootProperties[ key ] = this.feature.properties[ key ];
                    }

                    return r;
                }, []
            );
        } );
    },
    computed: {
        created() {
            if ( this.feature.properties ) {
                return moment( this.feature.properties.created ).format( 'D MMM YYYY, HH:mm:ss' );
            }

            return '';
        }
    },
    methods: {
        ...mapMutations( [ 'setKeyboardInput' ] ),
        ...mapMutations( 'map', [ 'refreshMsaMapDataSource' ] ),
        addMetadataProperty() {
            this.metadata.push( [ '', '' ] );
        },
        cancel() {
            this.dialog   = false;
            this.metadata = [];
            this.setKeyboardInput( false );
            this.cancelAction();
        },
        async accept() {
            this.dialog = false;

            for ( let i = 0; i < this.metadata.length; i++ ) {
                this.metadata[ i ][ 0 ] = `__${ this.metadata[ i ][ 0 ] }`;
            }

            const metadata = {
                ...Object.fromEntries( this.metadata ),
                ...this.rootProperties
            };

            await this.$api.updateFeature( {
                id: this.feature.id,
                type: this.feature.type,
                properties: metadata
            } );

            this.metadata       = [];
            this.rootProperties = {};

            this.setKeyboardInput( false );
            this.acceptAction();
            this.refreshMsaMapDataSource();
        }
    }
};
</script>
