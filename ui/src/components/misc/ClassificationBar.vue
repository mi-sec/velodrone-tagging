<template>
    <v-system-bar
        app
        :height="$store.state.config.classification.height"
        :color="$store.state.config.classification.backgroundColor"
    >
        <v-spacer></v-spacer>
        <span
            :class="[
                'overline',
                'font-weight-bold',
                `${ $store.state.config.classification.textColor || 'white' }--text`
            ]"
        >
            {{ $store.state.config.classification.text }}
        </span>
        <v-spacer></v-spacer>
    </v-system-bar>
</template>

<script>
export default {
    name: 'ClassificationBar'
};
</script>
