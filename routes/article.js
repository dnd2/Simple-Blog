'use strict';
const express = require('express'),
    i18n = require('../lib/i18n').init(),
    fDb  = require('../lib/data'),
    Helper = require( 'underscore' ),
    Article = require( '../lib/article' ),
    router = express.Router();

let article = new Article();

router.get( '/article/list', function( req, res, next ) {
    article.getArticles().then( function( data ) {
       res.send( data );
    });
});

router.get( '/article/:id', function( req, res, next ) {
    article.getArticleById( res.params.id ).then( function( data ) {
        res.send( data );
    });
});

router.post( '/article/add', function( req, res, next ) {
    article.save( req.body ).then( function( data ) {
        res.send( data );
    });
});

router.post( '/article/modify', function( req, res, next ) {
    if ( Helper.isEmpty( req.body.id ) ) {
        res.send( JSON.stringify( {success: false, message: i18n.__( 'article_id_invalid' )} ) );
    }

    article.save( req.body ).then( function( data ) {
        res.send( data );
    });
});

module.exports = router;