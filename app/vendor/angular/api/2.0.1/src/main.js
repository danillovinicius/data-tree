
if(!appConfig) {
	console.log('Não foi definido um configurador da aplicação.');
	//return;
}
var sufixo = '';
var bust = (new Date()).getTime();
if(!appConfig.ambiente.nome) {
	appConfig.ambiente.nome = 'dev';
}
else {
    if(appConfig.ambiente.nome == 'prod') {
        sufixo = '.min';
        bust = appConfig.versao_app;
    }
}

if(!bibliotecasDir) {
    throw new Error('Informe uma pasta válida para as bibliotecas');
}

if(!componentesDir) {
    throw new Error('Informe uma pasta válida para os componentes');
}

if(!apiDir) {
    throw new Error('Informe uma pasta válida para a api');
}

requirejs.config({
    urlArgs: "bust=" + bust,
    paths: {
        /**
         * Externals
         */
        'jQuery'                : [bibliotecasDir + 'dist/jquery.min'],
        'angular'               : [bibliotecasDir + 'dist/angular' + sufixo],
        'ngTable'               : [bibliotecasDir + '/src/ng-table/0.3.1/ng-table' + sufixo],
        'restangular'           : [bibliotecasDir + '/src/restangular/1.3.1/restangular' + sufixo],
        'ckeditor'              : [bibliotecasDir + '/src/ckeditor/4.4.3/ckeditor'],
        'd3'                    : [bibliotecasDir + '/src/d3/3.4.11/d3' + sufixo],
        'domReady'              : [bibliotecasDir + '/dist/domReady.min'],
        'lodash'                : [bibliotecasDir + '/src/lo-dash/2.4.1/lodash.min' + sufixo],
        'utils'                 : [bibliotecasDir + 'dist/utils.min'],
        
        /**
         * Internals
         */
        'componentes'           : [componentesDir],
        'msAppJs'               : [apiDir + 'dist/app' + sufixo],
        'appStarter'            : [apiDir + 'dist/app-starter' + sufixo],
        'angularLibsStarter'    : [apiDir + 'dist/angular-libs-starter' + sufixo],
        'msModal'               : [componentesDir + 'ms-modal/2.0.0/dist/ms-modal' + sufixo],
        'msPicklist'            : [componentesDir + 'ms-picklist/2.0.0/dist/ms-picklist' + sufixo],
        'msBreadcrumb'          : [componentesDir + 'ms-breadcrumb/2.0.0/dist/ms-breadcrumb' + sufixo],
        'msValidator'           : [componentesDir + 'ms-validator/2.0.0/dist/ms-validator' + sufixo],
        'msCkeditor'            : [componentesDir + 'ms-ckeditor/2.0.0/dist/ms-ckeditor' + sufixo],
        'msMask'                : [componentesDir + 'ms-mask/2.0.0/dist/ms-mask' + sufixo],
        'msMenu'                : [componentesDir + 'ms-menu/2.0.0/dist/ms-menu' + sufixo]
    },
    shim: {
        'jQuery'                : { exports: 'jQuery' },
        'angular'               : { deps: ['jQuery'], exports: 'angular'},	
        'angularLibs'           : { deps: ['angular'], exports: 'angularLibs'},	
        'ckeditor'              : { exports: 'ckeditor'},
        'appStarter'            : { deps: ['angular'], exports: 'appStarter'},
        'ngTable'               : { deps: ['angular'], exports: 'ngTable'},
        'restangular'           : { deps: ['angular', 'lodash'], exports: 'restangular'},
        'msModal'               : { deps: ['angular'], exports: 'msModal'},
        'msPicklist'            : { deps: ['angular'], exports: 'msPicklist'},
        'msBreadcrumb'          : { deps: ['angular'], exports: 'msBreadcrumb'},
        'msValidator'           : { deps: ['angular'], exports: 'msValidator'},
        'msMenu'                : { deps: ['angular'], exports: 'msMenu'},
        'msCkeditor'            : { deps: ['angular'], exports: 'msCkeditor'},
        'msMask'                : { deps: ['msValidator'], exports: 'msMask'},
        'lodash'                : {exports: 'lodash'}
    }
    ,priority: ["appStarter"]
    ,deps: ['appStarter']
});
