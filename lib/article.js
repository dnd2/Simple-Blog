'use strict';
/**
 * Created by Michael on 2017/4/4.
 */
const fDb    = require( './data' ),
      Helper = require( 'underscore' ),
      i18n   = require( './i18n' ).init(),
      path   = require( 'path' );

const ALIAS = 'articles';

class Article {
    construct() {
    }

    /**
     * Get a list of articles with pagination
     * @param Object params
     * @param Function callback
     * @returns {{message: string, success: boolean}}
     */
    getArticles( params, callback ) {
        let articles = {
            message: '',
            success: false
        };

        if ( ! Helper.isObject( params ) || typeof params == 'function' ) {
            articles.message = i18n.__( 'param_invalid' );
            return articles;
        }

        let curPage = params.page || 1,
            size    = params.size || 5;

        if ( ! Helper.isNumber( curPage ) || ! Helper.isNumber( size ) ) {
            articles.message = i18n.__( 'num_invalid' );
            return articles;
        }

        new Promise( function( resolve ) {
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

            if ( value.total <= 0 ) {
                callback( result );
                return true;
            }

            start = ( curPage - 1 ) * size;
            end   = start + size;
            result.totalPage = Math.ceil( len / size );

            for ( var i = start; i < len && i < end; i++ ) {
                result.items.push( value.articles[i] );
            }

            callback( result );
        });

        articles.message = 'No error has occurred!';
        articles.success = true;

        return articles;
    }

    /**
     * Get the data of the specific article according to the ID
     * @param Integer id
     * @param Function callback
     * @returns {Array}
     */
    getArticleById( id, callback ) {
        if ( ! Helper.isNumber( id ) ) {
            return [];
        }

        fDb.get( ALIAS, function( data ) {
            if ( ! data || ! data.articles ) {
                callback( {} );
            }

            let i, len = data.articles.length;

            for ( i = 0; i < len; i++ ) {
                if ( id == data.articles[i].id ) {
                    break;
                }
            }

            callback( data.articles[i] );
        });
    }

    /**
     * Add a new article
     * @param Object params
     * @param Function callback
     * @returns {{message: string, success: boolean}}
     */
    add( params, callback ) {
       let article = {
           message: '',
           success: false
       }, data;

       if ( ! Helper.isObject( params ) || typeof params == 'function' ) {
           article.message = i18n.__( 'param_invalid' );
           return article;
       }

       if ( Helper.isEmpty( params.name ) ) {
           article.message = i18n.__( 'article_name_empty' );
           return article;
       }

       if ( Helper.isEmpty( params.desc ) ) {
           article.message = i18n.__( 'article_desc_empty' );
           return article;
       }

       new Promise( function( resolve ) {
           fDb.get( ALIAS, function( data ) {
               resolve( data );
           });
       }).then( function( value ) {
           let total = value.total ? ++value.total : 1,
               image = params.img ? params.img : '',
               title = params.title ? params.title : '',
               keywords = params.keywords ? params.keywords : '',
               description = params.description ? params.description : '';

           data = {
               name: ALIAS,
               total: total,
               articles: []
           };

           data.articles.push(
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

           fDb.set( ALIAS, data, function( err ) {
               if ( err ) {
                   article.message = i18n.__( 'article_saved_fail' );
                   callback( article );
                   return article;
               }

               article.message = i18n.__( 'article_saved_success' );
               article.success = true;
               callback( article );
           });
       });

       return article;
    }

    modify() {

    }
}

module.exports = Article;