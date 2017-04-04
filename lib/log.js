/**
 * Created by Michael on 2017/4/4.
 */
/**
 * Application Log
 * @type {exports}
 * @desc http://www.cnblogs.com/yjfengwen/p/3827217.html
 */
const log  = require( 'log4js' ),
      path = require( 'path' );

log.configure({
    appenders: [
        {type: 'console'},
        {
            type: 'file',
            filename: 'logs/access.log',
            maxLogSize: 1024, // 超过1024会自动生成一个新文件
            backups: 3,
            category: 'normal'
        }
    ],
    replaceConsole: true // 让所有console输出到日志中，以[INFO] console代替console默认样式
});

/**
 * 暴露到应用的日志接口，调用该方法前必须确保已经configure过
 * @param name 指定log4js配置文件中的category。依此找到对应的appender。
 *              如果appender没有写上category，则为默认的category。可以有多个
 * @returns {Logger}
 */
exports.logger = function( name ) {
    const logger = log.getLogger( name );
    // 日志输出级别(logjs日志输出级别： trace, debug, info, warn, error, fatal)
    logger.setLevel( 'INFO' );
    return logger;
}
/**
 * 用于express中间件，调用该方法前必须确保已经configure过
 * @returns {Function|*}
 */
exports.useLog = function() {
    return log.connectLogger( log.getLogger( 'app' ), {level: log.levels.INFO} );
}