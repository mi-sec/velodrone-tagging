<template>
    <v-layout justify-center>
        <v-dialog
            v-model="dialog"
            :max-width="width"
            @keydown.esc="cancel()"
            @keydown.enter="accept()"
        >
            <v-card>
                <v-card-title class="headline">{{ title }}</v-card-title>
                <v-card-text>{{ text }}</v-card-text>
                <v-card-actions>
                    <v-spacer></v-spacer>
                    <v-btn text color="green darken-1" @click="cancel()">
                        {{ cancelText }}
                    </v-btn>
                    <v-btn
                        text
                        color="green darken-1"
                        @click="accept()"
                    >
                        {{ acceptText }}
                    </v-btn>
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-layout>
</template>

<script>
export default {
    name: 'ConfirmPopup',
    data() {
        return {
            dialog: false,
            width: '400px',
            title: 'Confirm',
            text: 'Are you sure?',
            cancelText: 'Cancel',
            cancelAction: () => {},
            acceptText: 'Accept',
            acceptAction: () => {}
        };
    },
    mounted() {
        this.$eventBus.on( 'open-confirm-popup', data => {
            this.dialog = true;

            const keys = Object.keys( data );

            for ( let i = 0; i < keys.length; i++ ) {
                if ( Object.prototype.hasOwnProperty.call( this, keys[ i ] ) ) {
                    this[ keys[ i ] ] = data[ keys[ i ] ];
                }
                else {
                    this.$logger.error( `invalid property "${ keys[ i ] }"` );
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
