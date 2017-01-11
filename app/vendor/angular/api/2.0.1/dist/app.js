define(['appStarter'], function() {
    'use strict';

    /*
     * Create the module
     */

    var app =  angular.module('msApp', [
                                        'msRoute',
                                        'msAppController',
                                        'msSeguranca',
                                        'msNotify',
                                        'msUtils',
                                        'ui.utils',
                                        //'ui.bootstrap',
                                        'timer',
                                        'ngSanitize'
                                 ]);

    //var requireConfig = requirejs.s.contexts._.config;
    var appBaseUrl = (typeof appConfig.appBaseUrl != "undefined") ? appConfig.appBaseUrl : 'app';

    /*
     * Configurando LazyLoading e translate
     */
    var lazyLoadingConfig = function(app) {
        app.config(['$controllerProvider', '$provide', '$compileProvider',
                function($controllerProvider, $provide, $compileProvider){

                app._controller = app.controller;
                app._service = app.service;
                app._directive = app.directive;
                app._factory = app.factory;
                app._provider = app.provider;
                app._value = app.value;

                app.controller = function( name, constructor ) {
                    $controllerProvider.register( name, constructor );
                    return( this );

                };

                app.service = function( name, constructor ) {
                    $provide.service( name, constructor );
                    return( this );

                };

                app.factory = function( name, constructor ) {
                    $provide.factory( name, constructor );
                    return( this );

                };

                app._directive = function( name, constructor ) {
                    $compileProvider.directive( name, constructor );
                    return( this );

                };

                app.value = function( name, value ) {
                    $provide.value( name, value );
                    return( this );
                };
                
                $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|local|data):/);
        }]);
    }

    app.createModule = function(name, dependencies) {
        //dependencies.push('msApp');
        var module = angular.module(name, dependencies);
        lazyLoadingConfig(module);

        require([
            'domReady!'
            ], function (document){
                'use strict';

                    angular.element(document).ready(function() {
                        angular.bootstrap(document, [name]);
                    });
        });

        return module;
    }

    /*
     * Configurando o HTTP INTERCEPTOR e as ROTAS
     */
    app.config(['$httpProvider', '$provide',  '$translateProvider',
                function($httpProvider, $provide, $translateProvider){


            $provide.factory('msHttpInterceptor', ['$q', '$injector', '$rootScope', 'msSegurancaService',
                function($q, $injector, $rootScope, msSegurancaService) {
                var $http, msAutenticacaoService, $state;
                return {
                        'request': function(config) {
                            //notificationChannel = notificationChannel || $injector.get('msRequestSpinner');
                            $http = $http || $injector.get('$http');
                            /*
                             * Atualizando o tempo de acesso;
                             */
                            $rootScope.limite = msSegurancaService.contador();

                            return config || $q.when(config);
                        },
                       'requestError': function(rejection) {
                          return $q.reject(rejection);
                        },
                        'response': function(response) {
                            $http = $http || $injector.get('$http');

//                                                if ($http.pendingRequests.length < 1) {
//                                                    notificationChannel = notificationChannel || $injector.get('msRequestSpinner');
//                                                    notificationChannel.requestEnded();
//                                                }
                          return response || $q.when(response);
                        },
                       'responseError': function(rejection) {

                            $http = $http || $injector.get('$http');
//                                                if ($http.pendingRequests.length < 1) {
//                                                    notificationChannel = notificationChannel || $injector.get('msRequestSpinner');
//                                                    notificationChannel.requestEnded();
//                                                }

                            /*
                             * 404 Interceptor para content text/HTML
                             * Outros contents devem ser tratados pela aplicação
                             */
                            if(rejection.status == 404 && rejection.headers('Content-Type').match('text/html')) {
                                rejection.data = {mensagens: [{texto: ''}]};
                                rejection.data.mensagens[0].texto = (typeof appConfig.erros != "undefined" && typeof appConfig.erros._404_ != "undefined") ? appConfig.erros._404_ : 'O recurso ' + rejection.config.url + ' não foi encontrado.';

                            }

                            /*
                             * 500 Interceptor
                             */
                            if(rejection.status == 500) {
                                rejection.data = {mensagens: [{texto: ''}]};
                                rejection.data.mensagens[0].texto  = (typeof appConfig.erros != "undefined" && typeof appConfig.erros._500_ != "undefined") ? appConfig.erros._500_ : 'Ocorreu um erro no servidor.';

                            }

                            /*
                             * 401 Interceptor
                             */
                            if(rejection.status == 401) {
                                msAutenticacaoService = msAutenticacaoService || $injector.get('msAutenticacaoService');
                                $state = $state || $injector.get('$state');
                                msAutenticacaoService.sair().then(function(result) {
                                    $rootScope.$msNotify.info('Seu acesso expirou');
                                    $state.go(appConfig.defaultRoute);
                                });
                            }

                            /*
                             * 403 Interceptor
                             */
                            if(rejection.status == 403) {
                                rejection.data = {mensagens: [{texto: ''}]};
                                rejection.data.mensagens[0].texto = (typeof appConfig.erros != "undefined" && typeof appConfig.erros._403_ != "undefined") ? appConfig.erros._403_ : 'Proibido.';
                            }
                            //console.log(rejection);
                            return $q.reject(rejection);
                        }
                };
            }]);

            $httpProvider.interceptors.push('msHttpInterceptor');

            /*
             * Translate
             */

            var bust = (new Date()).getTime();
            $translateProvider.useLoader('$translatePartialLoader', {
              urlTemplate: appBaseUrl + '/pages/{part}/nls/{lang}.json?bust=' + bust
            });

            $translateProvider.preferredLanguage('pt_BR');
    }]);


    /**
     * filtros padrões da aplicação
     */

    app.filter('msHifenizar', function() {
            return function (palavra) {
                return retira_acentos(palavra.toLowerCase()).replace(/\s/g, "-");
            };
    })
        .filter('msJoin', function () {
            return function (input,delimiter) {
                return (input || []).join(delimiter || ',');
            };
    })
        .filter('msRemoverAcentuacao', function() {
            return function (palavra) {
                var com_acento = "áàãâäéèêëíìîïóòõôöúùûüçÁÀÃÂÄÉÈÊËÍÌÎÏÓÒÕÖÔÚÙÛÜÇ";
                var sem_acento = "aaaaaeeeeiiiiooooouuuucAAAAAEEEEIIIIOOOOOUUUUC";
                var nova="";
                for(i=0;i<palavra.length;i++) {
                    if (com_acento.search(palavra.substr(i,1))>=0) {
                        nova += sem_acento.substr(com_acento.search(palavra.substr(i,1)),1);
                    }
                    else {
                        nova+=palavra.substr(i,1);
                    }
                }
                return nova;
            };
    });

    return app;

});
