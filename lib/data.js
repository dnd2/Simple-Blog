/**
 * Created by Dai on 3/22/17.
 */
const fs = require( 'fs' );

var DataHelper = ( function( undefined ) {
    var data = function( path ) {
        this.path = path || __dirname.replace( '/lib', '' ) + '/data/';
    };

    function checkDataFiles( path ) {
        return new Promise( function( resolve ) {
            fs.stat( path, function( err, stat ) {
                if ( stat ) {
                    stat.path = path;
                }
                resolve( stat );
            } );
        } );
    }

    data.prototype = {
        init: function() {
            Promise.all( [
                checkDataFiles( this.path + 'categories.json' ),
                checkDataFiles( this.path + 'articles.json' )
            ]).then( function( values ) {
                values.forEach( function( value ) {

                });
            }).catch( function( error ) {
                console.log(error);
            } );

        }
    };

    return data;
})();

module.exports = new DataHelper();