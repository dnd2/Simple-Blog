const express = require('express'),
      path = require('path'),
      favicon = require('serve-favicon'),
      logger = require('morgan'),
      cookieParser = require('cookie-parser'),
      bodyParser = require('body-parser'),
      i18n = require('i18n'),
      url  = require('url'),
      fs   = require('fs'),
      log  = require('./lib/log'),
      app  = express();

var index = require('./routes/index'),
    users = require('./routes/users');

// Config i18n
i18n.configure({
    locales: ['en', 'zh'],  // 声明包含的语言包
    directory: __dirname + '/locales', // 翻译json文件的路径
    defaultLocale: 'zh', // 默认语言
    logWarnFn: function (msg) {
        console.log('warn', msg);
    }
});

// view engine setup
app.engine('.html', require('ejs').__express); // 设置ejs解析html文件
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(i18n.init);
app.use(log.useLog);

app.use('/', index);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

function routeHandler(req, res, next) {
    var path = url.parse(req.url).pathname,
        name = path.split('/')[1];

    if ( path == '/' ) {
        name = 'index';
    }

    fs.stat( __dirname + '/routes/' + name + '.js', function( err, stat ) {
        if ( ! stat || ! stat.isFile() ) {
            var err = new Error( 'Not Found' );
            err.status = 404;
            next( err );
        }

        var route = require( './routes/' + name );
        app.get( '/' + name, route );
    } );
    next();
}

module.exports = app;

/**
 * https://segmentfault.com/a/1190000002632604
 * nvm - https://github.com/coreybutler/nvm-windows
 * debug - https://medium.com/@paul_irish/debugging-node-js-nightlies-with-chrome-devtools-7c4a1b95ae27#.ld0l1d46f
 * nodejs source project: https://github.com/gcfeng/booklist
 */