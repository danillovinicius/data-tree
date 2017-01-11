var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-menu-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-menu.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-menu', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-menu.js'))
        .pipe(gulp.dest('dist'));
});