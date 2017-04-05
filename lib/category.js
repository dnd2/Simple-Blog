'use strict';

var fDb    = require( './data' ),
    Helper = require( 'underscore' ),
    i18n   = require( './i18n' ).init(),
    path   = require( 'path' ),
    co     = require( 'co' );

class Category {
    construct() {
        this.alias = 'categories';
    }

    /**
     * Get a list of category according to the ID
     * @param Integer id
     * @param Function callback
     * @returns {boolean}
     */
    getCategories( id, callback ) {
        var result = [];
            id = id || 0;

        if ( isNaN( parseInt( id ) ) ) {
            callback( result );
            return false;
        }

        fDb.get( function( data ) {
            var categories = [];

            if ( data && data.categories ) {
                data.categories.forEach( function( curVal, index, arr ) {
                    if ( id == curVal.parent ) {
                        categories.push( curVal );
                    }
                });
            }

            callback( categories );
        });

        return true;
    }

    /**
     * Get the data of the specific category according to the ID
     * @param Integer id
     * @param Function callback
     * @returns {boolean}
     */
    getCategoryById( id, callback ) {
        if ( ! id || isNaN( parseInt( id ) ) ) {
            callback( {} );
            return false;
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

            callback( category );
        });

        return true;
    }

    /**
     * Save the data of the category into the file
     * @param Object cateParams
     * @param Function callback
     * @returns {boolean}
     */
    save( cateParams, callback ) {
        if ( ! Helper.isObject( cateParams ) ) {
            callback( false, i18n.__( 'param_invalid' ) );
            return false;
        }

        if ( Helper.isEmpty( cateParams.name ) ) {
            callback( false, i18n.__( 'empty_category_name' ) );
            return false;
        }

        let alias = this.alias;

        co( function* () {
           let cLen = yield new Promise( function( resolve, reject ) {
               fDb.get( alias, function( data ) {
                   if ( ! data || data.total < 0 ) {
                       throw new Error( i18n.__( 'category_count_error' ) );
                   }
                   resolve( data );
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
                    callback( false, i18n.__( 'category_item_not_existed' ) );
                    return false;
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
                    callback( false, i18n.__( 'category_saved_fail' ) );
                } else {
                    callback( true, i18n.__( 'category_saved_success' ) );
                }
            });
        }).catch( function( error ) {
            callback( false, i18n.__( 'category_saved_fail' ) + ',' + error );
        });

        return true;
    }

}

module.exports = Category;