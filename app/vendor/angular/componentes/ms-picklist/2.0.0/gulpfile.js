var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-picklist-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-picklist.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-picklist', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-picklist.js'))
        .pipe(gulp.dest('dist'));
});