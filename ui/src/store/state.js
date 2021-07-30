export default {
    config: {
        classification: {
            text: 'DEVELOPMENT',
            textColor: 'black',
            backgroundColor: '#808080',
            height: 12
        }
    },

    keyboardInput: false,

    snackbarMessage: {
        isOpen: false,
        isError: false,
        text: ''
    },

    sidebar: {
        leftSidebar: true,
        rightSidebar: false
    },

    controls: {
        addExternalLayerModel: false
    },

    targetObjects: [],
    targetObjectModal: null,

    map: {
        mapObject: null,
        // the id of the source on mapbox canvas
        mapDataSourceId: '__tagger-data-source',
        // the id of the mvt source-layer = "geodata"
        mapSourceLayerId: 'geodata',
        // the id of the aoi layer to display from source
        mapAoiLayerId: '__tagger-aoi-layer',
        // the id of the data layer to display from source
        mapDataLayerId: '__tagger-data-layer',

        geohash: {
            sourceId: 'geohash-lines-source',
            layerId: 'geohash-lines',
            geometryType: 'line',
            paint: {
                'line-color': '#007bff',
                'line-width': 5,
                'line-opacity': 0.8
            }
        },

        zoneSelection: null,

        onMapAoi: [],
        onMapData: [],

        managedData: [],

        mapLocked: false,

        currentGeohash: '',

        draw: {
            drawObject: null,
            drawLayerId: '__tagger-draw-layer'
        }
    }
};
