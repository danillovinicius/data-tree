var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-route-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-route.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-route', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-route.js'))
        .pipe(gulp.dest('dist'));
});