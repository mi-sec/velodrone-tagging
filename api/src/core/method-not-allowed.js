'use strict';

module.exports.route  = '*';
module.exports.method = 'ALL';
module.exports.exec   = ( req, res ) => {
    return res.status( 405 ).json( { error: `method ${ req.method } ${ req.path } not allowed` } );
};
