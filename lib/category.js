'use strict';

const fDb    = require( './data' ),
      Helper = require( 'underscore' ),
      i18n   = require( './i18n' ).init(),
      path   = require( 'path' ),
      co     = require( 'co' );

const ALIAS = 'categories';

/**
 * Category Class provides a simple way to handle the data of the category
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

                resolve( categories );
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

                resolve( category );
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

                fDb.set( alias, params, function( err ) {
                    if ( err ) {
                        result.message = i18n.__( 'category_saved_fail' );
                        reject( result );
                    } else {
                        result.message = i18n.__( 'category_saved_success' );
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

}

module.exports = Category;