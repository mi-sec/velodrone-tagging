/** ****************************************************************************************************
 * File: getPrimaryKeyColumn.js
 * Project: melior
 * @author Nick Soggin <iSkore@users.noreply.github.com> on 09-Sep-2019
 *******************************************************************************************************/
'use strict';

const
    PostgresDB = require( '../../services/PostgresDB' );

module.exports = async table => {
    let primaryKey = await PostgresDB
        .select( 'column_name' )
        .from( 'information_schema.key_column_usage' )
        .where( 'table_name', table );

    if ( primaryKey.length ) {
        if ( Object.prototype.hasOwnProperty.call( primaryKey[ 0 ], 'column_name' ) ) {
            primaryKey = primaryKey[ 0 ].column_name;
        }
    }

    return primaryKey;
};
