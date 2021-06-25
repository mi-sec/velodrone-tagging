'use strict';

module.exports = ( n ) => {
    // TODO: I really hate doing an unnecessary parse, try finding a way to regex instead
    try {
        JSON.parse( n );
        return true;
    }
    catch {
        return false;
    }
};
