export default {
    onMapDataAois( state ) {
        // filter for only AOI information
        // then filter out extras because MVT data comes in tiled
        // because of this, there could be four vector tiles made for one feature
        return state.map.onMapAoi
            .filter( ( data ) => data.properties.type === 'aoi' )
            .reduce(
                ( r, i ) => {
                    if ( !r.find( ( j ) => j.id === i.id ) ) {
                        r.push( i );
                    }
                    return r;
                }, []
            )
            .sort( ( a, b ) => a.id - b.id );
    }
};
