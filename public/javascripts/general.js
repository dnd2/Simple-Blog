/**
 * Created by Michael on 2017/3/12.
 */
var Country = (function () {
    var country = function () {
    };
    country.prototype = {
        list: function () {
            $.get('/country', {}, function (response) {
            }, 'json');
        },
        add: function () {
        }
    };
    return country;
})();
$(function () {
    var country = new Country();
    $('.dropdown').dropdown();
    //country.list();
});
var a = 1123;
console.log(a);
