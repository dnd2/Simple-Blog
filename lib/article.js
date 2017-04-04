/**
 * Created by Michael on 2017/4/4.
 */
var fDb    = require( './data' ),
    Helper = require( 'underscore' ),
    i18n   = require( 'i18n' ),
    path   = require( 'path' );

i18n.configure({
    locales: ['en', 'zh'],
    directory: path.dirname( __dirname ) + '/locales',
    defaultLocale: 'zh',
    logWarnFn: function ( msg ) {
        console.log( 'warn', msg );
    }
});

class Article {
    construct() {
        this.alias = 'articles';
    }

    getArticles() {

    }

    getArticleById() {

    }

    add() {

    }

    modify() {

    }
}