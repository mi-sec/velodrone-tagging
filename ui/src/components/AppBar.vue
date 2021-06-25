<template>
    <v-app-bar
        app
        flat
        dense
        clipped-right
        clipped-left
        floating
        height="30px"
    >
        <v-app-bar-nav-icon
            tile text icon
            height="30px"
            @click="sidebar.leftSidebar = !sidebar.leftSidebar"
        />

        <v-container class="py-0 fill-height">

            <v-menu
                offset-y
                open-on-hover
            >
                <template v-slot:activator="{ on, attrs }">
                    <v-btn
                        tile
                        text
                        v-bind="attrs"
                        v-on="on"
                        height="30px"
                    >
                        Create
                    </v-btn>
                </template>

                <v-list>
                    <v-list-item
                        v-for="(item, i) in createDropDownMenu"
                        :key="i"
                        dense
                        @click="changeMode( item.action, item.opts )"
                    >
                        <v-list-item-title>{{ item.title }}</v-list-item-title>
                    </v-list-item>
                </v-list>
            </v-menu>

            <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                    <v-btn
                        x-small tile text icon
                        width="32px"
                        height="30px"
                        v-on="on"
                        @click="controls.addExternalLayerModel = !controls.addExternalLayerModel"
                    >
                        <v-icon>mdi-file-image-outline</v-icon>
                    </v-btn>
                </template>
                <span>Add WMS Layer</span>
            </v-tooltip>

            <v-spacer></v-spacer>
        </v-container>

        <AddExternalLayer/>
    </v-app-bar>
</template>

<script>
import { mapState }     from 'vuex';

import AddExternalLayer from '@/components/layer-controls/AddExternalLayer';

export default {
    name: 'LeftSidebar',
    components: { AddExternalLayer },
    data: () => ( {
        createDropDownMenu: [
            {
                title: 'AOI (a)',
                action: 'draw_aoi'
            },
            {
                title: 'OBJECT (o)',
                action: 'draw_object'
            },
            {
                title: 'TARGET OBJECT',
                action: 'target_object'
            }
        ]
    } ),
    methods: {},
    computed: {
        ...mapState( [ 'sidebar', 'controls' ] )
    }
};
</script>
