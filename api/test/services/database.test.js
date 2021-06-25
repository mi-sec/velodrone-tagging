'use strict';

const
    chai       = require( 'chai' ),
    { expect } = chai;

const db = require( '../../src/api/services/database' );

module.exports = function() {
    it( 'should provice a nedb interface', ( done ) => {
        expect( db ).to.have.property( 'find' ).and.be.a( 'function' );
        done();
    } );
};
