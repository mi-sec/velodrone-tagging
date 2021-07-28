import Vue     from 'vue';
// import uuid             from 'uuid';
import Geohash from '@geonet/geohash';
// import turfBbox         from '@turf/bbox';
// import turfArea         from '@turf/area';
// import turfDistance     from '@turf/distance';
// import * as turfHelpers from '@turf/helpers';

Vue.use( {
    install() {
        Vue.prototype.$utils = {
            createGeohashPolygon( feature ) {
                if ( Geohash.validGeohash( feature ) ) {
                    feature = Geohash.toGeoJSON( feature, {
                        includeGeohashAsProperty: true,
                        includeFeatureBBox: true
                    } );
                }

                feature.properties.type = 'geohash';
                feature.properties.bbox = feature.bbox;

                return feature;
            }
        };

        Vue.prototype.$installUtils = function() {
            this.$store.$utils = Vue.prototype.$utils;
        };
    }
} );
