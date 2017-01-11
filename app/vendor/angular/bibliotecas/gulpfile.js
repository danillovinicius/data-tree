var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');


/**
 * Libs Versions Control
 */
var angularVersion = '1.2.22', jqueryNotyVersion = '2.2.1';
/**
 * AngularJS MIN
 */
gulp.task('angular', function() {
    return gulp.src([
        'src/angularjs/' + angularVersion + '/angular.js',
        'src/angularjs/' + angularVersion + '/angular-resource.js',
        'src/angularjs/' + angularVersion + '/angular-sanitize.js',
        'src/angularjs/' + angularVersion + '/angular-cookies.js'
    ])
        .pipe(concat('angular.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('angular-min', ['angular'], function() {
    return gulp.src([
        'dist/angular-' + angularVersion + '.js'
    ])
        .pipe(concat('angular.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

/**
 * jQuery TASK Minify and Concat
 */
gulp.task('jQuery', function() {
    return gulp.src([
        'src/jquery/1.11.1/jquery.min.js',
        'src/jquery-noty/' + jqueryNotyVersion + '/jquery.noty.packaged.min.js',
        'src/jquery-noty/' + jqueryNotyVersion + '/themes/default.js',
        'src/jquery-noty/' + jqueryNotyVersion + '/layouts/center.js',
        'src/jquery-noty/' + jqueryNotyVersion + '/layouts/topCenter.js',
        'src/jquery-noty/' + jqueryNotyVersion + '/layouts/topRight.js',
        'src/jquery-price-format/2.0/jquery.price_format.min.js'
    ])
        .pipe(concat('jquery.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('domReady', function() {
    return gulp.src([
        'src/requirejs-domready/2.0.1/domReady.js'
    ])
        .pipe(concat('domReady.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

/**
 * Utilitarios (SRC/MIN)
 */
gulp.task('util-min', function() {
    return gulp.src([
        'src/utils/sha256.js',
        'src/utils/functions.js',
        'src/utils/contraste.js',
        'src/jquery-rv-fontsize/2.0.3/rv-fontsize.min.js'
    ])
        .pipe(concat('utils.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('util', function() {
    return gulp.src([
        'src/utils/sha256.js',
        'src/utils/functions.js',
        'src/utils/contraste.js',
        'src/jquery-rv-fontsize/2.0.3/rv-fontsize.min.js'
    ])
        .pipe(concat('utils.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function(){
    gulp.start(
        'util',
        'util-min',
        'jQuery',
        'domReady',
        'angular-min'
    )
})