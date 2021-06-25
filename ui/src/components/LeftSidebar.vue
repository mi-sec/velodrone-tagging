<template>
    <v-navigation-drawer
        v-model="sidebar.leftSidebar"
        clipped
        absolute
        overflow
        app
    >
        <!--<component v-bind:is="leftView"></component>-->
    </v-navigation-drawer>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'LeftSidebar',
    data: () => ( {} ),
    methods: {},
    computed: {
        ...mapState( [ 'sidebar' ] )
    }
};
</script>
