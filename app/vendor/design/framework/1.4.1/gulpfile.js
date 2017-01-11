var gulp = require('gulp'),
    sass = require('gulp-ruby-sass'),
    minifycss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    imagemin = require('gulp-imagemin'),
    cache = require('gulp-cache'),
    concat = require('gulp-concat'),
    del = require('del');


var componentesDir = '../componentes/';
var bibliotecasDir = '../bibliotecas/';
var controladoresDir = 'src/controladores/';

/**
 * Minify de CSS e unificação em um arquivo.
 */
gulp.task('css', function() {
    return gulp.src(
        [
            'src/css/componentes.css',
            'src/css/content.css',
            'src/css/contraste.css',
            'src/css/datepicker.css',
            'src/css/geral.css',
            'src/css/ico.css',
            'src/css/ico-style.css',
            'src/css/menu.css',
            'src/css/normalize.css',
            'src/css/style.css',
            'src/css/template.css'
        ]
    )
        .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'))
        .pipe(concat('style.min.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('dist/css'));
});

/**
 * Comprimindo as imagens e cacheando
 */
 gulp.task('images', function() {
    return gulp.src('src/images/**/*')
    .pipe(cache(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true })))
    .pipe(gulp.dest('dist/images'));
});

/**
 * Executando a limpeza das pastas antes de efetuar o deploy
 */
gulp.task('clear', function(cb) {
    del(['dist/css', 'dist/images'], cb)
});

/**
 * Centralizando todas as atividades de deploy em uma unica
 */
gulp.task('deploy-design', ['clear'], function() {
    gulp.start('css', 'images')
})