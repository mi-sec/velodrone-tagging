<template>
    <v-app>
        <AppBar/>
        <LeftSidebar/>

        <v-main>
            <v-container fluid ma-0 pa-0>
                <SnackbarMessage/>
                <router-view></router-view>
            </v-container>
        </v-main>

        <Footer/>
    </v-app>
</template>

<script>
import AppBar          from '@/components/AppBar';
import LeftSidebar     from '@/components/LeftSidebar';
import SnackbarMessage from '@/components/SnackbarMessage';
import Footer          from '@/components/Footer';

export default {
    name: 'App',
    components: { AppBar, SnackbarMessage, LeftSidebar, Footer },
    data: () => ( {} ),
    beforeCreate() {
        this.$installAxios();
        this.$installLogger();
    },
    computed: {}
};
</script>

<style>
html, body {
    overflow: hidden;
    margin: 0;
    padding: 0;

    width: 100%;
    height: 100%;
}
</style>
