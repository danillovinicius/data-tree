var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-notify-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-notify.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-notify', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-notify.js'))
        .pipe(gulp.dest('dist'));
});