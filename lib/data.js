/**
 * Created by Dai on 3/22/17.
 */
const fs = require( 'fs' );

var DataHelper = ( function( undefined ) {
    var data = function( path ) {
        this.path = path || __dirname.replace( '/lib', '' ) + '/data/';
    };
    /**
     * @private
     * @type {{object}}
     */
    var iData = {
        categories: '{"name":"categories","total":0,"categories":[]}',
        articles: '{"name":"articles","total":0,"articles":[]}'
    };

    /**
     * Check if the data file is existed or not. If not a new file will be created
     * @private
     * @param fileType
     * @returns {Promise}
     */
    function checkDataFiles( path, fileType ) {
        path = path + fileType + '.json';
        return new Promise( function( resolve ) {
            fs.stat( path, function( err, stat ) {
                if ( stat ) {
                    stat.path = path;
                    stat.err  = 1;
                    stat.default = iData[fileType]
                } else if ( err ) {
                    stat = {
                        err: err.errno,
                        path: err.path,
                        default: iData[fileType]
                    };
                }
                resolve( stat );
            } );
        } );
    }

    data.prototype = {
        /**
         * Initialize the data
         * @public
         * @returns {void}
         */
        init: function() {
            Promise.all( [
                checkDataFiles( this.path, 'categories' ),
                checkDataFiles( this.path, 'articles' )
            ]).then( function( values ) {
                values.forEach( function( value ) {
                    if ( value.err < 0 || ! value.isFile() ) {
                        fs.open( value.path, 'a', function( err, fd ) {
                            var buf = new Buffer( value.default ),
                                offset = 0,
                                len = buf.length,
                                filePosition = null;

                            fs.write( fd, buf, offset, len, filePosition, function( err, readByte ) {});
                        });
                    }
                });
            }).catch( function( error ) {
                console.log(error);
            } );

        },
        /**
         * Get the data of the article according to the file name
         * @public
         * @param key
         * @param callback
         * @returns {boolean}
         */
        get: function( key, callback ) {
            if ( typeof arguments[0] == 'function' ) {
                callback = key;
                key = 'categories';
            }

            key = key || 'categories';

            fs.readFile( this.path + key + '.json', function( err, data ) {
                var result = "[]";

                if ( ! err ) {
                    result = data.toString();
                }

                callback( JSON.parse( result ) );

                return true;
            });
        },

        set: function( key, data ) {
            if ( typeof arguments[0] == 'function' || typeof arguments[0] == 'object' ) {
                key = key || 'categories';
            }

            key = key || 'categories';

            fs.writeFile( this.path + key + '.json', data, function( err ) {
                if ( err ) {
                    console.log( err );
                }
            });
        }
    };

    return data;
})();

module.exports = new DataHelper();