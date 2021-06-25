'use strict';

const
    chai       = require( 'chai' ),
    chaiHttp   = require( 'chai-http' ),
    { expect } = chai;

chai.use( chaiHttp );

module.exports = function( app ) {
    let data = {};

    it( 'GET /db/ (no items)', ( done ) => {
        chai
            .request( app )
            .get( '/db/' )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'array' );
                expect( res.body ).to.deep.eq( [] );
                done();
            } );
    } );

    it( 'POST /db/', ( done ) => {
        chai
            .request( app )
            .post( '/db/' )
            .send( { hello: 'world' } )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'object' );
                expect( res.body ).to.have.property( '_id' ).and.be.a( 'string' );
                expect( res.body ).to.have.property( 'hello' ).and.eq( 'world' );
                data._id = res.body._id;
                done();
            } );
    } );

    it( 'GET /db/ (items)', ( done ) => {
        chai
            .request( app )
            .post( '/db/' )
            .send( { hello: 'hello' } )
            .end( () => {
                chai
                    .request( app )
                    .get( '/db/' )
                    .end( ( err, res ) => {
                        expect( res ).to.have.status( 200 );
                        expect( res.body ).to.be.an( 'array' ).with.length( 2 );
                        done();
                    } );
            } );
    } );

    it( 'GET /db/ (query)', ( done ) => {
        chai
            .request( app )
            .get( '/db/' )
            .query( { hello: 'world' } )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'array' ).with.length( 1 );
                expect( res.body[ 0 ] ).to.be.an( 'object' ).that.has.property( 'hello' ).that.eq( 'world' );
                done();
            } );
    } );

    it( 'GET /db/ (count)', ( done ) => {
        chai
            .request( app )
            .get( '/db/' )
            .query( { count: '' } )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.a( 'number' ).and.eq( 2 );
                done();
            } );
    } );

    it( 'GET /db/:_id', ( done ) => {
        chai
            .request( app )
            .get( `/db/${ data._id }` )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'object' );
                expect( res.body ).to.have.property( '_id' ).that.eq( data._id );
                expect( res.body ).to.have.property( 'hello' ).that.eq( 'world' );
                done();
            } );
    } );

    it( 'PUT /db/:_id', ( done ) => {
        chai
            .request( app )
            .put( `/db/${ data._id }` )
            .send( { update: { hello: 'hello' } } )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'number' ).and.eq( 1 );

                chai
                    .request( app )
                    .get( `/db/${ data._id }` )
                    .end( ( err, res ) => {
                        expect( res ).to.have.status( 200 );
                        expect( res.body ).to.be.an( 'object' );
                        expect( res.body ).to.have.property( '_id' ).that.eq( data._id );
                        expect( res.body ).to.have.property( 'hello' ).that.eq( 'hello' );

                        // change it back
                        chai
                            .request( app )
                            .put( `/db/${ data._id }` )
                            .send( { update: { hello: 'world' } } )
                            .end( () => done() );
                    } );
            } );
    } );

    it( 'PUT /db/', ( done ) => {
        chai
            .request( app )
            .put( '/db/' )
            .send( {
                query: { _id: data._id },
                update: { hello: 'hello' }
            } )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'number' ).and.eq( 1 );

                chai
                    .request( app )
                    .get( `/db/${ data._id }` )
                    .end( ( err, res ) => {
                        expect( res ).to.have.status( 200 );
                        expect( res.body ).to.be.an( 'object' );
                        expect( res.body ).to.have.property( '_id' ).that.eq( data._id );
                        expect( res.body ).to.have.property( 'hello' ).that.eq( 'hello' );

                        // change it back
                        chai
                            .request( app )
                            .put( `/db/${ data._id }` )
                            .send( { update: { hello: 'world' } } )
                            .end( () => done() );
                    } );
            } );
    } );

    it( 'DELETE /db/:_id', ( done ) => {
        chai
            .request( app )
            .delete( `/db/${ data.id }` )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'number' ).and.eq( 1 );

                chai
                    .request( app )
                    .get( `/db/${ data.id }` )
                    .end( ( err, res ) => {
                        expect( res ).to.have.status( 404 );
                        expect( res.body ).to.be.an( 'object' );
                        expect( res.body ).to.have.property( 'error' ).that.eq( `item ${ data.id } not found` );
                        done();
                    } );
            } );
    } );

    it( 'DELETE /db/', ( done ) => {
        chai
            .request( app )
            .delete( '/db/' )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 200 );
                expect( res.body ).to.be.an( 'number' ).and.eq( 1 );

                chai
                    .request( app )
                    .get( '/db/' )
                    .end( ( err, res ) => {
                        expect( res ).to.have.status( 200 );
                        expect( res.body ).to.be.an( 'array' ).with.length( 0 );
                        done();
                    } );
            } );
    } );

    it( 'GET /badpath', ( done ) => {
        chai
            .request( app )
            .get( '/badpath' )
            .end( ( err, res ) => {
                expect( res ).to.have.status( 405 );
                expect( res.body ).to.be.an( 'object' );
                expect( res.body )
                    .to.have.property( 'error' )
                    .that.eq( `method ${ res.req.method } ${ res.req.path } not allowed` );
                done();
            } );
    } );
};
