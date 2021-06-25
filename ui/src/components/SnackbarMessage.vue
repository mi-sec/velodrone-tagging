<template>
    <v-snackbar
        v-model="snackbarMessage.isOpen"
        top
        timeout="3000"
    >
        {{ snackbarMessage.text }}

        <template v-slot:action="{ attrs }">
            <v-btn
                :color="snackbarMessage.color || 'error'"
                text
                v-bind="attrs"
                @click="snackbarMessage.isOpen = false"
            >
                <v-icon>mdi-close</v-icon>
            </v-btn>
        </template>
    </v-snackbar>
</template>

<script>
import { mapState } from 'vuex';

export default {
    name: 'SnackbarMessage',
    data: () => ( {} ),
    methods: {},
    computed: {
        ...mapState( [ 'snackbarMessage' ] )
    }
};
</script>
