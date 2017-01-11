var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-utils-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-utils.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-utils', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-utils.js'))
        .pipe(gulp.dest('dist'));
});