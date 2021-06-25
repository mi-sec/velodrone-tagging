<template>
    <v-footer
        app
        height="30px"
        inset
    >
        <v-spacer></v-spacer>
        <span class="my-n10 overline">{{ now }}</span>
    </v-footer>
</template>

<script>
import moment from 'moment';

export default {
    name: 'Footer',
    data: () => ( {
        now: moment().format( 'D MMM YYYY, HH:mm:ss' )
    } ),
    mounted() {
        this.timeInterval = setInterval(
            () => this.now = moment().format( 'D MMM YYYY, HH:mm:ss' ), 60
        );
    },
    beforeDestroy() {
        clearInterval( this.timeInterval );
    }
};
</script>
