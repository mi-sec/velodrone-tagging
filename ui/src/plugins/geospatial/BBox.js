'use strict';

import Vector4D                        from './Vector4D';
import {
    EARTH_ELLIPSOID,
    DEG_TO_RAD,
    EPSG3857_X_MIN,
    EPSG3857_Y_MIN,
    EPSG3857_X_MAX,
    EPSG3857_Y_MAX,
    EPSG4326_X_MIN,
    EPSG4326_X_MAX,
    EPSG4326_Y_MIN,
    EPSG4326_Y_MAX
}                                      from './geoUtils';
import { isString } from '../general';

class BBox extends Vector4D
{
    constructor( ...props )
    {
        super( ...props );

        this.x1 = this.x;
        this.y1 = this.y;
        this.x2 = this.z;
        this.y2 = this.w;

        this.EPSG = BBox.isEPSG4326Bbox( this ) ? 'EPSG4326' :
            BBox.isEPSG3857Bbox( this ) ? 'EPSG:3857' : 'unknown';
    }

    area()
    {
        const
            dLat = ( this.y2 - this.y1 ) * DEG_TO_RAD,
            dLon = ( this.x2 - this.x1 ) * DEG_TO_RAD,
            a    = Math.sin( dLat / 2 ) ** 2 +
                Math.cos( this.y1 * DEG_TO_RAD ) *
                Math.cos( this.y2 * DEG_TO_RAD ) *
                Math.sin( dLon / 2 ) ** 2,
            c    = 2 * Math.atan2( Math.sqrt( a ), Math.sqrt( 1 - a ) );

        return EARTH_ELLIPSOID * c;
    }

    static isValidBboxRange( bbox, xmin, xmax, ymin, ymax, reportError = false )
    {
        if ( !( bbox instanceof BBox ) ) {
            return new Error( 'bbox is not instanceof BBox' );
        }
        else if ( bbox.x1 <= xmin || bbox.x1 >= xmax ) {
            return reportError ? new Error( `bbox.x1 is out of range [${ xmin }, ${ xmax }] got ${ bbox.x1 }` ) : false;
        }
        else if ( bbox.x2 <= xmin || bbox.x2 >= xmax ) {
            return reportError ? new Error( 'bbox.x2 is out of range' ) : false;
        }
        else if ( bbox.y1 <= ymin || bbox.y1 >= ymax ) {
            return reportError ? new Error( 'bbox.y1 is out of range' ) : false;
        }
        else if ( bbox.y2 <= ymin || bbox.y2 >= ymax ) {
            return reportError ? new Error( 'bbox.y2 is out of range' ) : false;
        }

        return true;
    }

    static isEPSG4326Bbox( bbox )
    {
        let bboxData;
        if ( bbox instanceof BBox ) {
            bboxData = bbox;
        }
        else if ( !isString( bbox ) ) {
            return new Error( 'bbox must be a string' );
        }
        else {
            bboxData = new BBox( bbox.split( ',' ).map( ( i ) => i.trim() ) );
        }

        if ( !/(-?\d{1,3}(.\d+)?),(-?\d{1,3}(.\d+)?),(-?\d{1,3}(.\d+)?),(-?\d{1,3}(.\d+))/.test( bbox ) ) {
            return false;
        }

        return BBox.isValidBboxRange( bboxData, EPSG4326_X_MIN, EPSG4326_X_MAX, EPSG4326_Y_MIN, EPSG4326_Y_MAX );
    }

    static isEPSG3857Bbox( bbox )
    {
        let bboxData;
        if ( bbox instanceof BBox ) {
            bboxData = bbox;
        }
        else if ( !isString( bbox ) ) {
            return new Error( 'bbox must be a string' );
        }
        else {
            bboxData = new BBox( bbox.split( ',' ).map( ( i ) => i.trim() ) );
        }

        if ( !/(-?\d+(.\d+)?),(-?\d+(.\d+)?),(-?\d+(.\d+)?),(-?\d+(.\d+))/.test( bbox ) ) {
            return new Error( 'bbox does not appear to be an EPSG3857 string' );
        }

        return BBox.isValidBboxRange( bboxData, EPSG3857_X_MIN, EPSG3857_X_MAX, EPSG3857_Y_MIN, EPSG3857_Y_MAX );
    }

    toArray()
    {
        return [ this.x1, this.y1, this.x2, this.y2 ];
    }

    toString()
    {
        return `${ this.x1 },${ this.y1 },${ this.x2 },${ this.y2 }`;
    }

    toJSON()
    {
        return { x1: this.x1, y1: this.y1, x2: this.x2, y2: this.y2 };
    }

    static [ Symbol.hasInstance ]( instance )
    {
        return instance.constructor.name === 'BBox';
    }
}

export default BBox;
