<template>
    <v-app-bar
        app
        flat
        dense
        clipped-right
        clipped-left
        floating
        :height="appBarHeight"
    >
        <v-app-bar-nav-icon
            tile text icon
            :height="appBarHeight"
            @click="$store.state.sidebar.leftSidebar = !$store.state.sidebar.leftSidebar"
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
                        :height="appBarHeight"
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

            <v-tooltip
                v-for="item in toolbarItems"
                :key="item.name"
                bottom
            >
                <template v-slot:activator="{ on }">
                    <v-btn
                        x-small tile text icon
                        width="32px"
                        height="30px"
                        :color="item.color( $store )"
                        v-on="on"
                        @click="item.click( $store )"
                    >
                        <v-icon>{{ item.icon( $store ) }}</v-icon>
                    </v-btn>
                </template>
                <span>{{ item.tooltip( $store ) }}</span>
            </v-tooltip>

            <v-spacer></v-spacer>
        </v-container>

        <AddExternalLayerForm/>
        <CreateTargetObjectForm/>
    </v-app-bar>
</template>

<script>
import { mapMutations, mapState } from 'vuex';

import AddExternalLayerForm   from '@/components/layer-controls/AddExternalLayerForm';
import CreateTargetObjectForm from '@/components/misc/CreateTargetObjectForm';

export default {
    name: 'LeftSidebar',
    components: { AddExternalLayerForm, CreateTargetObjectForm },
    data() {
        return {
            appBarHeight: '30px',
            toolbarItems: [
                {
                    name: 'AddExternalLayerForm',
                    color: () => {},
                    click: () => this.$store.state.controls.addExternalLayerModel =
                        !this.$store.state.controls.addExternalLayerModel,
                    icon: () => 'mdi-file-image-outline',
                    tooltip: () => 'Add WMS Layer'
                },
                {
                    name: 'zoneSelector',
                    color: () => this.$store.state.map.zoneSelection ? 'green' : '',
                    click: () => this.toggleZoneSelection(),
                    icon: () => this.$store.state.map.zoneSelection ? 'mdi-selection-off' : 'mdi-view-grid-plus',
                    tooltip: () => this.$store.state.map.zoneSelection ? 'Turn Off Selector' : 'Turn On Selection'
                },
                {
                    name: 'mapLock',
                    color: () => this.$store.state.map.mapLocked ? 'red' : '',
                    click: () => this.$store.state.map.mapLocked ? this.resetMapBounds() : this.lockMapBounds(),
                    icon: () => this.$store.state.map.mapLocked ? 'mdi-lock' : 'mdi-lock-open-outline',
                    tooltip: () => this.$store.state.map.mapLocked ? 'Unlock Map' : 'Lock Map'
                }
            ],
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
        };
    },
    computed: {
        ...mapState( [ 'controls', 'map' ] )
    },
    methods: {
        ...mapMutations( [
            'lockMapBounds',
            'resetMapBounds',
            'toggleZoneSelection',
            'addWMSLayer',
            'setKeyboardInput'
        ] ),
        changeMode( mode, opts = {} ) {
            if ( mode.startsWith( 'draw' ) ) {
                this.$store.state.map.draw.drawObject.changeMode( mode, opts );
            }
            else {
                // custom logic for target object input
                if ( mode === 'target_object' ) {
                    this.setKeyboardInput( true );
                    this.$store.state.targetObjectModal = true;
                }
            }
        }
    }
};
</script>
