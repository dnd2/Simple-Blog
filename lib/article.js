'use strict';
/**
 * Created by Michael on 2017/4/4.
 */
const fDb    = require( './data' ),
      Helper = require( 'underscore' ),
      i18n   = require( './i18n' ).init(),
      path   = require( 'path' ),
      crypto = require( 'crypto' );

const ALIAS = 'articles';

class Article {
    construct() {
    }

    /**
     * Get a list of articles with pagination
     * @param Object params
     * @returns {Object}
     */
    getArticles( params ) {
        let cateList,
            articles = {
                message: '',
                success: false,
                data: {}
            };

        cateList = new Promise( function( resolve, reject ) {
            if ( ! Helper.isObject( params ) || typeof params == 'function' ) {
                articles.message = i18n.__( 'param_invalid' );
                reject( articles );
            }

            let curPage = params.page || 1,
                size    = params.size || 5;

            if ( ! Helper.isNumber( curPage ) || ! Helper.isNumber( size ) ) {
                articles.message = i18n.__( 'num_invalid' );
                reject( articles );
            }

            new Promise( function( resolveData ) {
                fDb.get( ALIAS, function( data ) {
                    if ( ! data || data.total < 0 ) {
                        throw new Error( i18n.__( 'article_count_error' ) );
                    }
                    resolveData( data );
                } );
            }).then( function( value ) {
                    let result = { items: [], totalPage: 0, page: curPage, limit: size },
                        start = 0,
                        end = 0,
                        len = value.articles.length;

                    if ( value.total <= 0 ) {
                        articles.message = 'Not found any item!';
                        articles.success = true;
                        resolve( result );
                    }

                    start = ( curPage - 1 ) * size;
                    end   = start + size;
                    result.totalPage = Math.ceil( len / size );

                    for ( var i = start; i < len && i < end; i++ ) {
                        result.items.push( value.articles[i] );
                    }

                    articles.message = 'No error has occurred!';
                    articles.success = true;

                    resolve( result );
            });
        });

        return cateList;
    }

    /**
     * Get the data of the specific article according to the ID
     * @param Integer id
     * @returns {Object}
     */
    getArticleById( id ) {
        let article = new Promise( function( resolve, reject ) {
            if ( ! Helper.isNumber( id ) ) {
                reject( {} );
            }

            fDb.get( ALIAS, function( data ) {
                if ( ! data || ! data.articles ) {
                    reject( {} );
                }

                let i, len = data.articles.length;

                for ( i = 0; i < len; i++ ) {
                    if ( id == data.articles[i].id ) {
                        break;
                    }
                }

                resolve( data.articles[i] );
            });
        });

        return article;
    }

    /**
     * Add a new article
     * @param Object params
     * @returns {Object}
     */
    add( params ) {
       let artData,
           article = {
               message: '',
               success: false
           };

       artData = new Promise( function( resolve, reject ) {
           if ( ! Helper.isObject( params ) || typeof params == 'function' ) {
               article.message = i18n.__( 'param_invalid' );
               reject( article );
           }

           if ( Helper.isEmpty( params.name ) ) {
               article.message = i18n.__( 'article_name_empty' );
               reject( article );
           }

           if ( Helper.isEmpty( params.desc ) ) {
               article.message = i18n.__( 'article_desc_empty' );
               reject( article );
           }

           if ( Helper.isEmpty( params.content ) ) {
               article.message = i18n.__( 'article_content_empty' );
               reject( article );
           }

           new Promise( function( resolveData ) {
               fDb.get( ALIAS, function( data ) {
                   resolveData( data );
               });
           }).then( function( value ) {
                   let total = value.total ? ++value.total : 1,
                       image = params.img ? params.img : '',
                       title = params.title ? params.title : '',
                       keywords = params.keywords ? params.keywords : '',
                       description = params.description ? params.description : '';

                   value.total = total;
                   value.articles.push(
                       {
                           id: total,
                           name: params.name,
                           desc: params.desc,
                           img: image,
                           title: title,
                           keywords: keywords,
                           description: description
                       }
                   );

                   let reqParams = JSON.stringify( value );

                   return new Promise( function( resolveItem, rejectItem ) {
                       fDb.set( ALIAS, reqParams, function( err ) {
                           if ( err ) {
                               rejectItem( i18n.__( 'article_saved_fail' ) + ',' + err );
                           }

                           article.success = true;
                           article.id = total;
                           resolveItem( article );
                       });
                   });
               }).then( function( value ) {
                   if ( true == value.success ) {
                       let id = String( value.id );
                       /*if ( params.image ) {
                        let hash = crypto.createHash( 'md5' ).update( id ),
                        imageName = hash.digest( 'hex' );
                        }*/

                       fDb.set( 'articles/' + id, params.content, function( err ) {
                           if ( err ) {
                               throw new Error( err );
                           }

                           article.message = i18n.__( 'article_saved_success' );
                           article.success = true;
                           resolve( article );
                       }, '.txt');
                   }
               }).catch( function( err ) {
                   article.message = err;
                   reject( article );
               });
       });

       return artData;
    }

    /**
     * 修改文章
     * @param Object params
     * @returns {Object}
     */
    modify( params ) {
        let artData,
            article = {
                success: false,
                message: ''
            };

        artData = new Promise( function( resolve, reject ) {
            if ( Helper.isEmpty( params.id ) ) {
                article.message = i18n.__( 'param_invalid' );
                reject( article );
            }
            // Check for the parameters is invalid or not
            for ( let item in params ) {
                if ( Helper.isEmpty( params[item] ) ) {
                    delete params[item];
                }
            }

            new Promise( function( resolveData ) {
                fDb.get( ALIAS, function( data ) {
                    resolveData( data );
                });
            }).then( function( value ) {
                    let len = value.articles.length,
                        updated = '{}';

                    for ( let i = 0; i < len; i++ ) {
                        if ( value.articles[i].id == params.id ) {
                            break;
                        }
                    }

                    for ( let val in params ) {
                        value.articles[i][val] = params[val];
                    }

                    updated = JSON.stringify( value );

                    return new Promise( function( resolveItem, rejectItem ) {
                        fDb.set( ALIAS, updated, function( err ) {
                            if ( err ) {
                                article.message = i18n.__( 'article_saved_fail' ) + ',' + err;
                                rejectItem( article );
                            }

                            article.success = true;
                            article.id = value.articles[i].id;
                            resolveItem( article );
                        });
                    });
                }).then( function( data ) {
                    let id = String( data.id );

                    if ( params.content ) {
                        fDb.set( 'articles/' + id, params.content, function( err ) {
                            if ( err ) {
                                throw new Error( err );
                            }

                            article.message = i18n.__( 'article_saved_success' );
                            article.success = true;
                            resolve( article );
                        }, '.txt');
                    }

                }).catch( function( err ) {
                    article.message = err;
                    reject( article );
                });
        });

        return artData;
    }
}

module.exports = Article;