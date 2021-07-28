<template>
    <v-alert
        v-model="show"
        v-bind="localAttrs"
        :dismissible="dismissible"
        :type="type"
        class="mb-4"
    >
        This is a {{ type }} alert.
        https://vuetifyjs.com/en/components/alerts
    </v-alert>
</template>
