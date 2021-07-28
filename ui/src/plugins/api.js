import Vue from 'vue';

Vue.use( {
    install() {
        const $axios  = Vue.prototype.$axios;
        const $logger = Vue.prototype.$logger;

        Vue.prototype.$api = {
            baseUrl: null,
            async loadConfig() {
                try {
                    const { data } = await $axios( {
                        method: 'get',
                        baseURL: this.baseUrl,
                        url: '/config'
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async getFeatures( id = 'all', operation = '', params = {} ) {
                try {
                    const { data } = await $axios( {
                        method: 'get',
                        baseURL: this.baseUrl,
                        url: `/msa/${ id }/${ operation }`,
                        params
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async intersectsGeohash( geohash = '', params = {} ) {
                try {
                    const { data } = await $axios( {
                        method: 'get',
                        baseURL: this.baseUrl,
                        url: `/msa/intersectsGeohash/${ geohash }`,
                        params
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async createFeature( geojson ) {
                try {
                    const { data } = await $axios( {
                        method: 'post',
                        baseURL: this.baseUrl,
                        url: '/msa',
                        data: geojson
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async updateFeature( geojson ) {
                try {
                    $logger.log( geojson );
                    const { data } = await $axios( {
                        method: 'put',
                        baseURL: this.baseUrl,
                        url: `/msa/${ geojson.id }`,
                        data: geojson
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async deleteFeature( id ) {
                try {
                    if ( !id ) {
                        return new Error( 'id is required' );
                    }

                    const { data } = await $axios( {
                        method: 'delete',
                        baseURL: this.baseUrl,
                        url: `/msa/${ id }`
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async listGeohashes( params = {} ) {
                try {
                    params.where     = params.where || 'properties->>\'type\' = \'object\'';
                    params.precision = params.precision || 6;

                    const { data } = await $axios( {
                        method: 'get',
                        baseURL: this.baseUrl,
                        url: '/msa/info/geohash',
                        params
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async getData( { table, ...params } ) {
                try {
                    const { data } = await $axios( {
                        method: 'get',
                        baseURL: this.baseUrl,
                        url: `/db/${ table }`,
                        params
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async createTargetObjects( body ) {
                try {
                    const { data } = await $axios( {
                        method: 'post',
                        baseURL: this.baseUrl,
                        url: '/db/target_object',
                        data: body
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            },

            async patchUpdate( table, id, instructions ) {
                try {
                    const { data } = await $axios( {
                        method: 'patch',
                        baseURL: this.baseUrl,
                        url: `/db/${ table }/${ id }`,
                        data: instructions
                    } );

                    return data;
                }
                catch ( e ) {
                    $logger.error( e );
                }
            }
        };

        Vue.prototype.$installApi = function( baseUrl ) {
            this.$store.$api = Vue.prototype.$api;

            Vue.prototype.$api.baseUrl = baseUrl;
        };
    }
} );
