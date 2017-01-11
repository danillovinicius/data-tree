var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-seguranca-min', function() {
    return gulp.src([
        'src/*.js',
        'src/services/msSegurancaService.js',
        'src/services/msAutenticacaoService.js',
        'src/directives/*.js'
    ])
        .pipe(concat('ms-seguranca.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('ms-seguranca', function() {
    return gulp.src([
        'src/*.js',
        'src/services/msSegurancaService.js',
        'src/services/msAutenticacaoService.js',
        'src/directives/*.js'
    ])
        .pipe(concat('ms-seguranca.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function() {
    gulp.start('ms-seguranca', 'ms-seguranca-min');
});