/** ****************************************************************************************************
 * File: getGeomColumn.js
 * Project: melior
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 10-Sep-2019
 *******************************************************************************************************/
'use strict';

const
    PostgresDB = require( '../../services/PostgresDB' );

module.exports = async table => {
    const geomColumn = await PostgresDB
        .select( PostgresDB.raw( 'row_to_json(fc)' ) )
        .from( function() {
            this.select(
                function() {
                    this.select( 'column_name' )
                        .distinct()
                        .from( PostgresDB.raw( 'information_schema.columns' ) )
                        .where( 'table_name', table )
                        .andWhere( 'udt_name', 'geometry' )
                        .as( 'column_name' );
                },
                function() {
                    this.select( 'type' )
                        .from( 'geometry_columns' )
                        .where( 'f_table_name', table )
                        .as( 'geom_type' );
                }
            ).as( 'fc' );
        } );

    if ( geomColumn.length ) {
        if ( Object.prototype.hasOwnProperty.call( geomColumn[ 0 ], 'row_to_json' ) ) {
            if (
                !geomColumn[ 0 ].row_to_json.column_name ||
                !geomColumn[ 0 ].row_to_json.geom_type
            )
            {
                return null;
            }

            return geomColumn[ 0 ].row_to_json;
        }
    }

    return null;
};
