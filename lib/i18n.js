/**
 * 国际化初始化
 *
 * @Author Michael
 * @Date 2017.04.05
 * @Version 1.0.0
 */
const i18n = require( 'i18n' ),
      path = require( 'path' );

exports.init = function() {
    i18n.configure({
        locales: ['en', 'zh'],
        directory: path.dirname( __dirname ) + '/locales',
        defaultLocale: 'zh',
        logWarnFn: function (msg) {
            console.log( 'warn', msg );
        }
    });

    return i18n;
}
