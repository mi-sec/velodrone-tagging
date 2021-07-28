<template>
    <v-navigation-drawer
        v-model="sidebar.leftSidebar"
        clipped
        absolute
        overflow
        app
    >
        <v-tabs
            v-model="tab"
            color="success"
            slider-color="orange"
            height="36"
        >
            <v-tabs-slider color="orange"></v-tabs-slider>

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
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item
                v-for="tab in tabs"
                :key="tab.name"
                :value="`tab-${ tab.name }`"
            >
                <v-container class="component" fluid ma-0 pa-0>
                    <component v-bind:is="tab.component"></component>
                </v-container>
            </v-tab-item>
        </v-tabs-items>
    </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'LeftSidebar',
    data: () => ( {
        tab: null,
        tabs: [
            {
                name: 'AOI',
                icon: 'mdi-map-search-outline',
                component: async () => await import( '@/components/left-sidebar/AoiControl.vue' )
            }
            // {
            //     name: 'Object',
            //     icon: 'mdi-map-marker-path',
            //     component: () => import( '@/components/left-sidebar/ObjectControl.vue' )
            // }
            // {
            //     name: 'Options',
            //     icon: 'mdi-progress-wrench',
            //     component: async () => await import( '@/components/left-sidebar/OptionsControl.vue' )
            // }
        ]
    } ),
    computed: {
        ...mapState( [ 'sidebar' ] )
    }
};
</script>
