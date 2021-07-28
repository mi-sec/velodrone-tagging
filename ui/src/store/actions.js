export default {
    async loadApiConfig( context ) {
        try {
            const data = await this.$api.loadConfig();
            context.commit( 'commitApiConfig', data );
        }
        catch ( e ) {
            this.$logger.error( e );
        }
    }
};
