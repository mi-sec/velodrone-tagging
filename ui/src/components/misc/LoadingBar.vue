<template>
    <v-layout justify-center>
        <v-dialog
            v-model="dialog"
            :max-width="width"
            hide-overlay
            persistent
        >
            <v-card
                color="primary"
                dark
            >
                <v-card-text>
                    {{ title }}

                    <v-progress-linear
                        :indeterminate="indeterminate || progress <= 0"
                        :value="progress"
                        color="white"
                        class="mb-0"
                    ></v-progress-linear>

                </v-card-text>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
export default {
    name: 'LoadingBar',
    data() {
        return {
            dialog: false,
            width: '300px',
            title: 'Please stand by...',
            indeterminate: true,
            progress: 0,
            cancelText: 'Cancel',
            cancelAction: () => {},
            acceptText: 'Accept',
            acceptAction: () => {}
        };
    },
    mounted() {
        this.$eventBus.on( 'open-loading-popup', data => {
            this.dialog = true;

            const keys = Object.keys( data );

            for ( let i = 0; i < keys.length; i++ ) {
                if ( Object.prototype.hasOwnProperty.call( this, keys[ i ] ) ) {
                    this[ keys[ i ] ] = data[ keys[ i ] ];
                }
                else {
                    console.error( `invalid property "${ keys[ i ] }"` );
                }
            }
        } );

        this.$eventBus.on( 'update-loading-popup', data => {
            const keys = Object.keys( data );

            for ( let i = 0; i < keys.length; i++ ) {
                if ( Object.prototype.hasOwnProperty.call( this, keys[ i ] ) ) {
                    this[ keys[ i ] ] = data[ keys[ i ] ];
                }
                else {
                    console.error( `invalid property "${ keys[ i ] }"` );
                }
            }
        } );
    },
    methods: {
        cancel() {
            this.dialog = false;
            this.cancelAction();
        },
        accept() {
            this.dialog = false;
            this.acceptAction();
        }
    }
};
</script>
