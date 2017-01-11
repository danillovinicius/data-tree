var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-spinner-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-spinner.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-spinner', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-spinner.js'))
        .pipe(gulp.dest('dist'));
});