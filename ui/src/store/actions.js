export default {
    async loadApiConfig( context ) {
        try {
            const data = await this.$api.loadConfig();
            context.commit( 'commitApiConfig', data );
        }
        catch ( e ) {
            this.$logger.error( e );
        }
    },

    async refreshTargetObjects( context ) {
        try {
            const data = await this.$api.getData( {
                table: 'target_object'
            } );

            console.log( data );
            context.commit( 'commitTargetObjectList', data );
        }
        catch ( e ) {
            console.error( e );
        }
    }
};
