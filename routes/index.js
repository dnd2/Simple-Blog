const express = require('express'),
      i18n = require('i18n'),
      router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(req.acceptsLanguages());
  res.render('index', { title: 'Express' + i18n.__('example') });
});

module.exports = router;
