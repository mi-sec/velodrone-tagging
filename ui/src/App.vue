<template>
    <v-app>
        <ClassificationBar/>

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
import { mapActions }    from 'vuex';
import AppBar            from '@/components/AppBar';
import LeftSidebar       from '@/components/LeftSidebar';
import SnackbarMessage   from '@/components/SnackbarMessage';
import Footer            from '@/components/Footer';
import ClassificationBar from '@/components/misc/ClassificationBar';

export default {
    name: 'App',
    components: { ClassificationBar, AppBar, SnackbarMessage, LeftSidebar, Footer },
    beforeCreate() {
        this.$installAxios();
        this.$installLogger();
        this.$installUtils();

        this.$installApi( process.env.VUE_APP_API_BASE_URL );
    },
    async mounted() {
        await this.loadApiConfig();

        const data = this.$api.getAuth();
        console.log( data );
    },
    methods: {
        ...mapActions( [ 'loadApiConfig' ] )
    }
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
