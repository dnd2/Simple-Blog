'use strict';

const fDb    = require( './data' ),
      Helper = require( 'underscore' ),
      path   = require( 'path' ),
      crypto = require( 'crypto' ),
      i18n = require( './i18n' ).init();

const ALIAS = 'articles';
/**
 * Created by Michael on 2017/4/4.
 */
class Article {
    construct() {
        this.articles = [];
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
            },
            curPage = params.page || 1,
            size    = params.size || 5;

        cateList = new Promise( function( resolve, reject ) {
            if ( ! Helper.isObject( params ) || typeof params == 'function' ) {
                articles.message = i18n.__( 'param_invalid' );
                reject( articles );
            }

            if ( ! Helper.isNumber( curPage ) || ! Helper.isNumber( size ) ) {
                articles.message = i18n.__( 'num_invalid' );
                reject( articles );
            }

            fDb.get( ALIAS, function( data ) {
                if ( ! data || data.total < 0 ) {
                    throw new Error( i18n.__( 'article_count_error' ) );
                }
                resolve( data );
            } );
        }).then( function( value ) {
            let result = { items: [], totalPage: 0, page: curPage, limit: size },
                start = 0,
                end = 0,
                len = value.articles.length;

            return new Promise( function( resolve, reject ) {
                if ( value.total <= 0 ) {
                    articles.message = 'Not found any item!';
                    articles.success = true;
                    resolve( articles );
                }

                start = ( curPage - 1 ) * size;
                end   = start + size;
                result.totalPage = Math.ceil( len / size );

                for ( var i = start; i < len && i < end; i++ ) {
                    result.items.push( value.articles[i] );
                }

                articles.message = 'No error has occurred!';
                articles.success = true;
                articles.result  = result;
                resolve( articles );
            });    
        }).catch( function( err ) {
            return new Promise( function( resolve ) {
                resolve( err );
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

                let i, len = data.articles.length, selected;

                for ( i = 0; i < len; i++ ) {
                    if ( id == data.articles[i].id ) {
                        selected = data.articles[i];
                        break;
                    }
                }

                resolve( selected );
            });
        }).then( function( value ) {
            return new Promise( function( resolve, reject ) {
                fDb.get( 'articles/' + value.id, ( data ) => {
                    let res = {
                        main: value,
                        content: data
                    };
                    resolve( res );
                });
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

           if ( ! Helper.isNumber( params.cid ) ) {
               article.message = i18n.__( 'article_cid_invalid' );
               reject( article );
           }

           fDb.get( ALIAS, function( data ) {
              resolve( data );
           });
        }).then( function( value ) {
            let total = value.total ? ++value.total : 1,
                image = params.img ? params.img : '',
                title = params.title ? params.title : '',
                keywords = params.keywords ? params.keywords : '',
                description = params.description ? params.description : '',
                cTime = Math.floor( new Date().getTime() / 1000 );

                value.total = total;
                value.articles.push({
                    id: total,
                    name: params.name,
                    alias: params.alias || params.name + '_' + total,
                    cid: params.cid,
                    created: cTime,
                    updated: cTime
                 });

            let reqParams = JSON.stringify( value );

            return new Promise( function( resolve, reject ) {
                fDb.set( ALIAS, reqParams, function( err ) {
                     if ( err ) {
                         reject( i18n.__( 'article_saved_fail' ) + ',' + err );
                     }

                     article.success = true;
                     article.id = total;
                     resolve( article );
                });
            });
        }).then( function( value ) {
            if ( true == value.success ) {
                let id = String( value.id ), data, aParams;
                    //    if ( params.image ) {
                    //         let hash = crypto.createHash( 'md5' ).update( id ),
                    //         imageName = hash.digest( 'hex' );
                    //     }
                       
                 data = {
                     title: params.title,
                     keywords: params.keywords || '',
                     description: params.description || '',
                     shortDesc: params.shortDesc || '',
                     desc: Buffer.from( params.content, 'UTF-8' ).toString( 'base64' )
                 };
                 aParams = JSON.stringify( data );

                 return new Promise( function( resolve, reject ) {
                    fDb.set( 'articles/' + id, aParams, function( err ) {
                        if ( err ) {
                            throw new Error( err );
                        }

                        article.message = i18n.__( 'article_saved_success' );
                        article.success = true;
                        resolve( article );
                    }, '.json');
                 });
            }
        }).catch( function( err ) {
            return new Promise( function( resolve, reject ) {
                resolve( err );
            });
        });      

       return artData;
    }

    /**
     * Modify the specific article
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
            if ( ! params.id || ! Helper.isNumber( params.id ) ) {
                article.message = i18n.__( 'param_invalid' );
                reject( article );
            }

            fDb.get( ALIAS, function( data ) {
                resolve( data );
           });
        }).then( function( value ) {
            let len = value.articles.length,
                updated = '{}',
                selected;

            if ( len <= 0 ) {
                throw new Error( i18n.__( 'article_edit_empty' ) );
            }    

            for ( let i = 0; i < len; i++ ) { 
                  if ( value.articles[i].id == params.id ) { 
                      selected = value.articles[i];
                      break;
                  }
            }

            if ( ! selected ) {
                throw new Error( i18n.__( 'article_edit_empty' ) );
            }
            // Check for the parameters is invalid or not
            if ( ! Helper.isEmpty( params.name ) ) {
                selected.name = params.name;
            }

            if ( params.cid ) {
                selected.cid = params.cid;
            }

            selected.updated = Math.floor( new Date().getTime() / 1000 );
            updated = JSON.stringify( value ); 
            return new Promise( function( resolve, reject ) {
                fDb.set( ALIAS, updated, function( err ) {
                    if ( err ) {
                        article.message = i18n.__( 'article_saved_fail' ) + ',' + err;
                        reject( article );
                    }

                    article.success = true;
                    article.id = params.id;
                    resolve( article );
                });
            });
        }).then( function( data ) { 
            let id = String( data.id ), aParams;
            data = {
                 title: params.title,
                 keywords: params.keywords || '',
                 description: params.description || '',
                 shortDesc: params.shortDesc || '',
                 desc: Buffer.from( params.content, 'UTF-8' ).toString( 'base64' )
            };
            aParams = JSON.stringify( data );
            return new Promise( function( resolve, reject ) {
                fDb.set( 'articles/' + id, aParams, function( err ) {
                    if ( err ) {
                        throw new Error( err );
                    }

                    article.message = i18n.__( 'article_saved_success' );
                    article.success = true;
                    resolve( article );
                }, '.json');
            });
       }).catch( function( err ) { 
            article.message = err.message;
            return new Promise( function( resolve, reject ) {
                resolve( article );
            });
       });

       return artData;
    }
    /**
     * Method to retrieve the number of the article item
     * @public
     * @return {Promise}
     */
    getArticleNum() {
        return new Promise( function( resolve, reject ) { 
            fDb.get( ALIAS, function( data ) { 
                if ( data && data.total ) {
                    resolve( data.total );
                } else {
                    resolve( 0 );
                }
            });
        });
    }
    /**
     * Method to get all articles of the specific category
     * @public
     * @param cid {Integer}
     * @return {Promise}
     */
    getArticlesByCid( cid ) {
        return new Promise( function( resolve, reject ) {
            fDb.get( ALIAS, function( data ) {
                if ( data && data.articles ) {
                    let result = [], i, len = data.articles.length;

                    if ( this.articles.length <= 0 ) {
                        this.articles = data.articles;
                    }

                    for ( i = 0; i < len; i++ ) {
                        if ( this.articles[i] == cid ) {
                            result.unshift( this.articles[i] );
                        }
                    }

                    resolve( result );
                } else {
                    resolve( [] );
                }
            });
        });
    }
}

module.exports = Article;