/**
 * Provide a simple way to handle a data lock
 * @Author Michael
 * @Date 2017.04.04
 * @Description
 * 1. 使用队列模式,将执行的action放入队列
 * 2. 判断当前锁是否被持有,如果持有则等待释放,否则获取该锁,执行回调
 * 3. 当锁被释放,则等待队列中下一个action,并传递给其执行
 * Reference: http://www.cnblogs.com/indream/p/3537210.html
 * http://www.cnblogs.com/hustskyking/p/javascript-asynchronous-programming.html
 */
var Lock = ( function() {
    var loc = function() {

    }

    loc.prototype = {

    };

    return loc;
})();