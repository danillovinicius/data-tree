var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-snap-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-snap.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-snap-src', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-snap.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-snap', function() {
    gulp.start('ms-snap-src', 'ms-snap-min');
});

