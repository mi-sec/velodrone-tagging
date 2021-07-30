<template>
    <v-dialog
        v-model="$store.state.controls.addExternalLayerModel"
        persistent
        max-width="400"
    >
        <v-card>
            <v-card-title>Add External Layer</v-card-title>

            <v-card-text>
                <v-form
                    ref="form"
                    v-model="valid"
                    :lazy-validation="lazy"
                >
                    <v-row dense>
                        <v-col cols="12">
                            <v-text-field
                                v-model="layerName"
                                label="Name *"
                                :counter="512"
                                :rules="layerNameRules"
                                required
                            />
                        </v-col>
                        <v-col cols="12">
                            <v-text-field
                                v-model="layerUrl"
                                label="URL *"
                                :counter="512"
                                :rules="layerUrlRules"
                                required
                            />
                        </v-col>

                        <v-col cols="12">
                            <v-checkbox
                                v-model="isQuerystringUppercase"
                                label="Uppercase Querystring?"
                            ></v-checkbox>
                        </v-col>
                    </v-row>
                </v-form>
            </v-card-text>

            <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn
                    color="green darken-1"
                    text
                    @click="closeWindow"
                >
                    Cancel
                </v-btn>
                <v-btn
                    color="green darken-1"
                    text
                    @click="submitForm"
                >
                    Submit
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<script>
import { mapMutations } from 'vuex';
import * as uuid        from 'uuid';
import BBox             from '@/plugins/geospatial/BBox';

export default {
    name: 'AddExternalLayerForm',
    data() {
        return {
            valid: false,
            lazy: false,
            layerName: '',
            layerNameRules: [
                v => !!v || 'Layer name is required',
                v => ( v && v.length <= 512 ) || 'Layer name must be less than 512 characters'
            ],
            layerUrl: '',
            layerUrlRules: [
                v => !!v || 'Layer URL is required'
            ],
            isQuerystringUppercase: false,
            errorMessage: ''
        };
    },
    methods: {
        ...mapMutations( [ 'setKeyboardInput' ] ),
        validate() {
            this.valid = this.$refs.form.validate();
            return this.valid;
        },
        closeWindow() {
            this.layerName              = '';
            this.layerUrl               = '';
            this.isQuerystringUppercase = false;
            this.errorMessage           = '';
            this.valid                  = false;

            this.$refs.form.resetValidation();
            this.setKeyboardInput( false );
            this.$store.state.controls.addExternalLayerModel = false;
        },
        setDefaultSearchParamsIfNotSet( params, key, value ) {
            if ( !params.has( key ) ) {
                params.set( key, value );
            }
        },
        setSearchParamCase( params, uppercase = false ) {
            for ( const [ key, val ] of [ ...params ] ) {
                params.delete( key );
                params.set( uppercase ? key.toUpperCase() : key.toLowerCase(), val );
            }
        },
        formatWmsUrl( url, uppercase = false ) {
            const wmsUrl = new URL( url );

            this.setSearchParamCase( wmsUrl.searchParams, false );

            wmsUrl.searchParams.set( 'bbox', '{bbox-epsg-3857}' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'format', 'image/jpeg' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'service', 'WMS' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'version', '1.1.1' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'request', 'GetMap' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'srs', 'EPSG:3857' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'width', '256' );
            this.setDefaultSearchParamsIfNotSet( wmsUrl.searchParams, 'height', '256' );

            this.setSearchParamCase( wmsUrl.searchParams, uppercase );

            wmsUrl.search = decodeURIComponent( wmsUrl.search );

            return wmsUrl;
        },
        async submitForm() {
            if ( !this.validate() ) {
                return;
            }

            // example:
            // https://img.nj.gov/imagerywms/Natural2015?
            //  bbox={bbox-epsg-3857}&
            //  format=image/png&
            //  service=WMS&
            //  version=1.1.1&
            //  request=GetMap&
            //  srs=EPSG:3857&
            //  transparent=true&
            //  width=256&
            //  height=256&
            //  layers=Natural2015

            const name       = `${ this.layerName }-${ uuid.v4() }`;
            const sourceName = `source-${ name }`;
            const layerName  = `layer-${ name }`;

            const url = this.formatWmsUrl( this.layerUrl, this.isQuerystringUppercase );
            console.log( url );
            console.log( url.href );
            this.$store.state.map.mapObject.addSource( sourceName, {
                type: 'raster',
                tiles: [ url.href ],
                tileSize: 256
            } );

            this.$store.state.map.mapObject.addLayer(
                {
                    id: layerName,
                    type: 'raster',
                    source: sourceName,
                    paint: {}
                },
                this.$store.state.map.mapAoiLayerId
            );

            this.closeWindow();
        }
    }
};
</script>

<style>
</style>
