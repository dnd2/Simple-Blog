'use strict';
const express = require('express'),
    i18n = require('../lib/i18n').init(),
    fDb  = require('../lib/data'),
    Helper = require( 'underscore' ),
    Category = require( '../lib/category' ),
    router = express.Router();

let category = new Category();

router.get( '/category/list', function( req, res, next ) {
    category.getCategories().then( function( data ) {
       res.send( data );
    });
});

router.get( '/category/:id', function( req, res, next ) {
    category.getCategoryById( res.params.id ).then( function( data ) {
        res.send( data );
    });
});

router.post( '/category/add', function( req, res, next ) {
    category.save( req.body ).then( function( data ) {
        res.send( data );
    });
});

router.post( '/category/modify', function( req, res, next ) {
    if ( Helper.isEmpty( req.body.id ) ) {
        res.send( JSON.stringify( {success: false, message: i18n.__( 'category_id_invalid' )} ) );
    }

    category.save( req.body ).then( function( data ) {
        res.send( data );
    });
});

module.exports = router;