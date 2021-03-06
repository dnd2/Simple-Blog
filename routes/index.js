'use strict';
const express = require('express'),
    i18n = require('../lib/i18n').init(),
    fDb  = require('../lib/data'),
    Category = require( '../lib/category' ),
    router = express.Router();

/**
 *  GET home page.
 *  https://github.com/nswbmw/N-blog
 */
router.get('/', function(req, res, next) {
    // 检查用户是否是首次访问，首次访问进入新建类目页面
    let cate   = new Category(), params, navItems;

    navItems = i18n.__( 'nav_guide' ).split( ',' );
    params = {
       title: i18n.__( 'title' ),
       desc: i18n.__( 'desc' ),
       nav: navItems,
   };

    fDb.isExisted().then( function( has ) {
        params.has = has;

        if ( true === has ) { 
            cate.getCategories().then( function( data ) {
                params.categories = data.categories;
                res.render( 'index', params );
            });
        } else { 
            res.render('index', params);
        }
    }).catch( function( err ) {
        params.error = err;
        res.render('index', params);
    });
});

router.get( '/step/:id', function( req, res, next ) {
    let config = fDb.getConfig();

    
});

module.exports = router;