<template>
    <v-tabs
        v-model="active"
        color="success"
        slider-color="orange"
        height="36"
    >
        <v-tab
            v-for="tab in tabs"
            :key="tab.name"
            :href="`#tab-${ tab.name }`"
            style="min-width: 64px !important;"
        >
            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-icon v-on="on">{{ tab.icon }}</v-icon>
                </template>
                <span>{{ tab.name }}</span>
            </v-tooltip>
        </v-tab>

        <v-tab-item
            v-for="tab in tabs"
            :key="tab.name"
            :value="`tab-${ tab.name }`"
        >
            <v-container class="component" fluid ma-0 pa-0>
                <component v-bind:is="tab.component"></component>
            </v-container>
        </v-tab-item>
    </v-tabs>
</template>

<script>
export default {
    name: 'ControlBar',
    data() {
        return {
            active: null,
            tabs: [
                {
                    name: 'AOI',
                    icon: 'mdi-map-search-outline',
                    component: async () => await import( '@/components/left-sidebar/AoiControl.vue' )
                },
                {
                    name: 'Object',
                    icon: 'mdi-map-marker-path',
                    component: async () => await import( '@/components/left-sidebar/ObjectControl.vue' )
                },
                {
                    name: 'Options',
                    icon: 'mdi-progress-wrench',
                    component: async () => await import( '@/components/left-sidebar/OptionsControl.vue' )
                }
            ]
        };
    },
    async mounted() {
        for ( let i = 0; i < this.tabs.length; i++ ) {
            if ( Object.prototype.hasOwnProperty.call( this.tabs[ i ], 'component' ) ) {
                this.tabs[ i ].component = ( await this.tabs[ i ].component() ).default;
            }
        }

        // map.setFilter( this.mapDataLayerId, [
        // 	'==', 'type', 'aoi'
        // ] );
    },
    computed: {},
    methods: {}
};
</script>
