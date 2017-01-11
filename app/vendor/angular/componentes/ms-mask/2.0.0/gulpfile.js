var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-mask-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-mask.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-mask', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-mask.js'))
        .pipe(gulp.dest('dist'));
});