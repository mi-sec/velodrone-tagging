'use strict';

module.exports = function( form, req ) {
    return new Promise( ( res, rej ) => {
        form.parse( req, ( err, fields, files ) => {
            if ( err ) {
                rej( err );
            }
            else {
                res( { fields, files } );
            }
        } );
    } );
};
