/** ****************************************************************************************************
 * File: dragDrawPolygon.js
 * Project: tagger
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 09-Aug-2019
 *******************************************************************************************************/
'use strict';

import doubleClickZoom  from '@mapbox/mapbox-gl-draw/src/lib/double_click_zoom';
import * as Constants   from '@mapbox/mapbox-gl-draw/src/constants';
import DrawPolygon      from '@mapbox/mapbox-gl-draw/src/modes/draw_polygon';
import turfSimplify     from '@turf/simplify';
import { EventEmitter } from 'events';

export default function dragDrawPolygon( opts = {} ) {
    opts.disableDrag = opts.disableDrag || true;

    const dragDrawPolygon = DrawPolygon.constructor();

    for ( const attr in DrawPolygon ) {
        if ( Object.prototype.hasOwnProperty.call( DrawPolygon, attr ) ) {
            dragDrawPolygon[ attr ] = DrawPolygon[ attr ];
        }
    }

    const dragPan = {
        enable( ctx ) {
            setTimeout( () => {
                // First check we've got a map and some context.
                if (
                    !ctx.map ||
                    !ctx.map.dragPan ||
                    !ctx._ctx ||
                    !ctx._ctx.store ||
                    !ctx._ctx.store.getInitialConfigValue
                )
                {
                    return;
                }

                // Now check initial state wasn't false (we leave it disabled if so)
                if ( !ctx._ctx.store.getInitialConfigValue( 'dragPan' ) ) {
                    return;
                }

                ctx.map.dragPan.enable();
            }, 0 );
        },
        disable( ctx ) {
            setTimeout( () => {
                if ( !ctx.map || !ctx.map.dragPan ) {
                    return;
                }

                // Always disable here, as it's necessary in some cases.
                ctx.map.dragPan.disable();
            }, 0 );
        }
    };

    dragDrawPolygon.event = new EventEmitter();

    dragDrawPolygon.onSetup = function() {
        dragDrawPolygon.event.emit( 'setup', ...arguments );

        doubleClickZoom.disable( this );

        if ( opts.disableDrag ) {
            dragPan.disable( this );
        }

        this.clearSelectedFeatures();
        this.updateUIClasses( { mouse: Constants.cursors.ADD } );
        this.activateUIButton( Constants.types.POLYGON );
        this.setActionableState( { trash: true } );

        const feature = {
            type: Constants.geojsonTypes.FEATURE,
            properties: {},
            geometry: {
                type: Constants.geojsonTypes.POLYGON,
                coordinates: [ [] ]
            }
        };

        if ( opts.newFeatureType ) {
            feature.properties.type = opts.newFeatureType;
        }

        const polygon = this.newFeature( feature );

        this.addFeature( polygon );

        return {
            polygon,
            currentVertexPosition: 0,
            dragMoving: false
        };
    };

    dragDrawPolygon.onDrag = dragDrawPolygon.onTouchMove = function( state, e ) {
        dragDrawPolygon.event.emit( 'drag', ...arguments );

        state.dragMoving = true;
        this.updateUIClasses( { mouse: Constants.cursors.ADD } );
        state.polygon.updateCoordinate( `0.${ state.currentVertexPosition }`, e.lngLat.lng, e.lngLat.lat );
        state.currentVertexPosition++;
        state.polygon.updateCoordinate( `0.${ state.currentVertexPosition }`, e.lngLat.lng, e.lngLat.lat );
    };

    console.log( dragDrawPolygon );

    dragDrawPolygon.onMouseUp = dragDrawPolygon.onTouchEnd = function( state, e ) {
        dragDrawPolygon.event.emit( 'mouseup', ...arguments );

        if ( state.dragMoving ) {
            let tolerance = 0;

            if ( opts.tolerance ) {
                tolerance = opts.tolerance;
            }
            else {
                tolerance = ( 3 / ( ( this.map.getZoom() - 4 ) * 150 ) ) - 0.001;
            }

            turfSimplify( state.polygon, {
                mutate: true,
                highQuality: true,
                tolerance
            } );

            this.fireUpdate();
            this.changeMode( Constants.modes.SIMPLE_SELECT, { featureIds: [ state.polygon.id ] } );
        }
    };

    dragDrawPolygon.onStop = function() {
        dragDrawPolygon.event.emit( 'stop', ...arguments );
    };

    dragDrawPolygon.fireUpdate = function() {
        dragDrawPolygon.event.emit( 'update', ...arguments );

        this.map.fire( Constants.events.UPDATE, {
            action: Constants.updateActions.MOVE,
            features: this.getSelected().map( f => f.toGeoJSON() )
        } );
    };

    return dragDrawPolygon;
}
