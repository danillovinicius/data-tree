var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');

gulp.task('ms-validator-min', function() {
    return gulp.src([
        'bibliotecas/momentjs/2.8.2/moment.min.js',
        'bibliotecas/angular-validator/0.2.3/angular-validator.min.js',
        'bibliotecas/utils/cpf_cnpj/cpf_cnpj.min.js',
        'src/*.js',
        'src/**/*.js'
    ])
    .pipe(concat('ms-validator.min.js'))
    .pipe(uglify({mangle: false}))
    .pipe(gulp.dest('dist'));
});

gulp.task('ms-validator', function() {
    return gulp.src([
        'bibliotecas/momentjs/2.8.2/moment.min.js',
        'bibliotecas/angular-validator/0.2.3/angular-validator.min.js',
        'bibliotecas/utils/cpf_cnpj/cpf_cnpj.min.js',
        'src/*.js',
        'src/**/*.js'
    ])
        .pipe(concat('ms-validator.js'))
        .pipe(gulp.dest('dist'));
});