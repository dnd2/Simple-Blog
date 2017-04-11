/**
 * Created by Dai on 3/22/17.
 */
'use strict';

const fs = require( 'fs' ),
      dirPath = require( 'path' ),
      Helper = require( 'underscore' ),
      log = require( './log' ).logger( 'data' );

var DataHelper = ( function( undefined ) {
    var data = function( path ) {
        this.path = path || dirPath.dirname( dirPath.dirname( __filename ) ) + '/data/';
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

                if ( err ) {
                    result = JSON.stringify( err );
                    log.info( result );
                } else {
                    result = data.toString();
                }

                callback( JSON.parse( result ) );

                return true;
            });
        },

        set: function( key, data, callback, ext ) {
            if ( typeof arguments[0] == 'function' || typeof arguments[0] == 'object' ) {
                key = key || 'categories';
            }

            key = key || 'categories';
            ext = ext || '.json';

            fs.writeFile( this.path + key + ext, data, function( err ) {
                if ( err ) {
                    log.info( JSON.stringify( err ) );
                }

                callback( err );
            });
        },

        isExisted: function( key ) {
            let data = new Promise( ( resolve ) => {
                this.get( key, function( data ) {
                    var has = false;

                    if ( data && data.total > 0 ) {
                        has = true;
                    }

                    resolve( has );
                });
            });

            return data;
        },
        /**
         * Retrieve the data of the article content
         * @param String file  Some text file
         * @param Function callback
         * @returns {boolean}
         */
        getText: function( file, callback ) {
            let result = {
                msg: '',
                success: false,
                data: ''
            };

            if ( ! Helper.isString( file ) || Helper.isEmpty( file ) ) {
                callback( result );
                return false;
            }

            fs.readFile( this.path + file, function( err, data ) {
                if ( err ) {
                    log.info( JSON.stringify( err ) );
                } else {
                    result.data = data.toString();
                }

                callback( result );
            });

            return true;
        }
    };

    return data;
})();

module.exports = new DataHelper();