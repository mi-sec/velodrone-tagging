<template>
    <div>
        <Map/>
        <ConfirmPopup/>
    </div>
</template>

<script>
import Map          from '@/components/Map';
import ConfirmPopup from '@/components/misc/ConfirmPopup';

export default {
    name: 'Home',
    components: {
        Map,
        ConfirmPopup
    },
    data: () => ( {} ),
    mounted() {

        window.addEventListener( 'keydown', ( e ) => {
            if ( !this.$store.state.keyboardInput ) {
                return this.$eventBus.emit( `keydown-${ e.key }`, e );
            }

            return true;
        } );

        this.$eventBus.on( 'keydown-a', ( opts ) => {
            console.log( this.$store.state.keyboardInput );
            if ( !this.$store.state.keyboardInput ) {
                return this.changeMode( 'draw_aoi' );
            }

            return true;
        } );
    },
    methods: {
        changeMode( mode, opts = {} ) {
            this.$store.state.map.draw.drawObject.changeMode( mode, opts );
        }
    }
};
</script>
