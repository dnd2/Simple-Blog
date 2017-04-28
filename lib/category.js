'use strict';

const fDb    = require( './data' ),
      Helper = require( 'underscore' ),
      path   = require( 'path' ),
      co     = require( 'co' ),
      i18n   = require( './i18n' ).init(),
      log    = require( './log' ).logger( 'data' );

const ALIAS = 'categories';

/**
 * Category class provides a simple way to handle the data of the category
 *
 * @Author Michael
 * @Date 2017.04.10
 * @Version 1.0.0
 */
class Category {
    construct() {
    }

    /**
     * Get a list of category according to the ID
     * @param Function callback
     * @param Integer id
     * @returns {Object}
     */
    getCategories( id ) {
        let result = [],
            category;

        id = id || 0;

        category = new Promise( function( resolve, reject ) {
            if ( isNaN( parseInt( id ) ) ) {
                reject( result );
            }

            fDb.get( function( data ) {
                var categories = [];

                if ( data && data.categories ) {
                    if ( 0 === id ) {
                        categories = data.categories;
                    } else {
                        data.categories.forEach( function( curVal, index, arr ) {
                            if ( id == curVal.parent ) {
                                categories.push( curVal );
                            }
                        });
                    }
                }

                try {
                    resolve( JSON.stringify( categories ) );
                } catch ( err ) {
                    log.info( err );
                    reject( err );
                }
            });
        });

        return category;
    }

    /**
     * Get the data of the specific category according to the ID
     * @param Integer id
     * @returns {Object}
     */
    getCategoryById( id ) {
        let cate = new Promise( function( resolve, reject ) {
            if ( ! id || isNaN( parseInt( id ) ) ) {
                reject( {} );
            }

            fDb.get( function( data ) {
                var category = {};

                if ( data && data.categories ) {
                    const len = data.categories.length;

                    for ( let i = 0; i < len; i++ ) {
                        if ( id == data.categories[i].id ) {
                            category = data.categories[i];
                            break;
                        }
                    }
                }

                try {
                    resolve( JSON.stringify( category ) );
                } catch ( err ) {
                    log.info( err );
                    reject( err );
                }
            });
        });

        return cate;
    }

    /**
     * Save the data of the category into the file
     * @param Object cateParams
     * @returns {Object}
     */
    save( cateParams ) {
        let cateData,
            result = {
                success: false,
                message: ''
            };

        cateData = new Promise( function( resolve, reject ) {
            if ( ! Helper.isObject( cateParams ) ) {
                result.message = i18n.__( 'param_invalid' );
                reject( result );
            }

            if ( Helper.isEmpty( cateParams.name ) ) {
                result.message = i18n.__( 'empty_category_name' );
                reject( result );
            }

            co( function* () {
                let cLen = yield new Promise( function( res ) {
                    fDb.get( ALIAS, function( data ) {
                        if ( ! data || data.total < 0 ) {
                            throw new Error( i18n.__( 'category_count_error' ) );
                        }
                        res( data );
                    });
                });
                return cLen;
            }).then( function( value ) { 
                let id = value.total ? ++value.total : 1,
                    params = '';

                if ( cateParams.id && cateParams.id > 0 ) {
                    let len = value.categories.length, i, state = false;

                    for ( i = 0; i < len; i++ ) {
                        if ( cateParams.id == value.categories[i].id ) {
                            state = true;
                            break;
                        }
                    }

                    if ( false === state ) {
                        result.message = i18n.__( 'category_item_not_existed' );
                        reject( result );
                    }

                    value.categories[i].name   = cateParams.name;
                    value.categories[i].parent = cateParams.parent;
                    value.categories[i].level  = cateParams.level;
                } else {
                    value.total = id;
                    value.categories.push( {
                        id: id,
                        name: cateParams.name,
                        parent: cateParams.parent || 0,
                        level: cateParams.level
                    } );
                }

                params = JSON.stringify( value );

                fDb.set( ALIAS, params, function( err ) {
                    if ( err ) {
                        result.message = i18n.__( 'category_saved_fail' );
                        reject( result );
                    } else {
                        result.message = i18n.__( 'category_saved_success' );
                        result.success = true;
                        resolve( result );
                    }
                });
            }).catch( function( error ) { 
                result.message = i18n.__( 'category_saved_fail' ) + ',' + error;
                reject( result );
            });
        });

        return cateData;
    }
    /**
     * Method to retrieve the number of the category item
     * @public
     * @return {Promise}
     */
    getCategoryNum() {
        return new Promise( function( resolve, reject ) {
            fDb.get( function( data ) {
                if ( data && data.total ) {
                    resolve( data.total );
                } else {
                    resolve( 0 );
                }
            });
        });
    }
}

module.exports = Category;