/**
 * Created by Michael on 2017/3/11.
 */
'use strict';
// http://www.th7.cn/web/html-css/201703/216905.shtml
// http://blog.csdn.net/u013558749/article/details/51645033
const gulp = require( 'gulp' ),
      sass = require( 'gulp-sass' ),
      uglify = require( 'gulp-uglify' ),
      clean = require( 'gulp-clean-css' );

gulp.task( 'sass', function() {
    gulp.src( 'src/scss/*.scss' )
        .pipe( sass() )
        .pipe( clean() )
        .pipe( gulp.dest( 'public/stylesheets/template' ) );
} );

gulp.task( 'img', function() {
    return gulp.src( 'src/img/*' )
        .pipe( gulp.dest( 'public/images' ) );
} );

gulp.task( 'js', function() {
    gulp.src( 'src/js/**/*.js' )
        .pipe( uglify() )
        .pipe( gulp.dest( 'public/javascripts' ) )
} );

gulp.task( 'watch', function() {
    gulp.watch( 'src/scss/*.scss', ["sass"] );
    gulp.watch( 'src/js/**/*.js', ["js"] );
} );

gulp.task( 'default', ['sass', 'js', 'watch'] );