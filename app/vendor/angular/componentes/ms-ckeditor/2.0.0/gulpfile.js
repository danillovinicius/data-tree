var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat'),
    docs =  require('gulp-ngdocs');

gulp.task('ms-ckeditor-min', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-ckeditor.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-ckeditor', function() {
    return gulp.src([
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-ckeditor.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function() {
    gulp.start('ms-ckeditor-min', 'ms-ckeditor')
})