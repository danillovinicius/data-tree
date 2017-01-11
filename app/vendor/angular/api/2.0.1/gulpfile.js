var gulp = require('gulp'),
    jshint = require('gulp-jshint'),
    uglify = require('gulp-uglify'),
    concat = require('gulp-concat');


var componentesDir = '../componentes/';
var bibliotecasDir = '../bibliotecas/';
var controladoresDir = 'src/controladores/';

/**
 * Controladores SRC/MIN
 */
gulp.task('controllers', function () {
    return gulp.src([
        controladoresDir + 'msAppController.js',
        controladoresDir + 'msAlertController.js',
        controladoresDir + 'msController.js',
        controladoresDir + 'msLoginController.js'
    ])
        .pipe(concat('controllers.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('controllers-min', ['controllers'], function () {
    return gulp.src([
        'dist/controllers.js'
    ])
        .pipe(concat('controllers.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});


/**
 * Bibliotecas iniciais à aplicação (SRC/MIN)
 */
gulp.task('angular-libs-starter', function () {
    return gulp.src([
        bibliotecasDir + 'src/angular-timer/1.0.11/angular-timer.js',
        bibliotecasDir + 'src/angular-ui-utils/0.1.1/ui-utils.js',
        bibliotecasDir + 'src/angular-translate/2.0.0/angular-translate.js',
        bibliotecasDir + 'src/angular-translate-loader-partial/0.1.6/angular-translate-loader-partial.js',
        bibliotecasDir + 'src/angular-ui-router/0.2.7/angular-ui-router.js',

    ])
        .pipe(concat('angular-libs-starter.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('angular-libs-starter-min', ['angular-libs-starter'], function () {
    return gulp.src([
        'dist/angular-libs-starter.js'
    ])
        .pipe(concat('angular-libs-starter.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});


/**
 * Modulos iniciais para a aplicação (SRC/MIN)
 */
gulp.task('modules-starter',
    function () {
        return gulp.src([
            componentesDir + '/ms-notify/dist/ms-notify.js',
            componentesDir + '/ms-spinner/dist/ms-spinner.js',
            componentesDir + '/ms-seguranca/dist/ms-seguranca.js',
            componentesDir + '/ms-route/dist/ms-route.js',
            componentesDir + '/ms-utils/dist/ms-utils.js',
            bibliotecasDir + 'dist/utils.js'
        ])
            .pipe(concat('modules-starter.js'))
            .pipe(gulp.dest('dist'));
    });

gulp.task('modules-starter-min', ['modules-starter'],
    function () {
        return gulp.src([
            'dist/modules-starter.js'
        ])
            .pipe(concat('modules-starter.min.js'))
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest('dist'));
    });


/**
 * Arquivo de inicio da aplicação (SRC/MIN)
 */

gulp.task('app-starter', [
        'angular-libs-starter',
        'modules-starter',
        'controllers'
    ],
    function () {
        return gulp.src([
            'dist/angular-libs-starter.js',
            'dist/modules-starter.js',
            'dist/controllers.js'
        ])
            .pipe(concat('app-starter.js'))
            .pipe(gulp.dest('dist'));
    });

gulp.task('app-starter-min', [
        'app-starter'
    ],
    function () {
        return gulp.src([
            'dist/app-starter.js'
        ])
            .pipe(concat('app-starter.min.js'))
            .pipe(uglify({mangle: false}))
            .pipe(gulp.dest('dist'));
    });

/**
 * Arquivo MAIN (configuração) (SRC/MIN)
 */

gulp.task('main', function () {
    return gulp.src(['src/main.js'])
        .pipe(concat('main.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('main-min', ['main'], function () {
    return gulp.src(['dist/main.js'])
        .pipe(concat('main.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

/**
 * Arquivo de geração da APP (SRC/MIN)
 */

gulp.task('app', function () {
    return gulp.src(['src/app.js'])
        .pipe(concat('app.js'))
        .pipe(gulp.dest('dist'));
});

gulp.task('app-min', ['app'], function () {
    return gulp.src(['dist/app.js'])
        .pipe(concat('app.min.js'))
        .pipe(uglify({mangle: false}))
        .pipe(gulp.dest('dist'));
});

gulp.task('build', function () {
    gulp.start(
        'app-starter-min',
        'app-min',
        'main-min'
    )
})

