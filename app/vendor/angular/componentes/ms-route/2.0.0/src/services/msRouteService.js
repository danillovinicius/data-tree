!function() {
    'use strict';
    var msRoute = angular.module('msRoute');

    msRoute.factory('msRouteService', [ '$log', '$http', '$q', '$state', '$rootScope', 'msSegurancaService', 
         function($log, $http, $q, $state, $rootScope, msSegurancaService){

            'use strict';

            var appBaseUrl = (typeof appConfig.appBaseUrl != "undefined") ? appConfig.appBaseUrl : 'app';

            var setState = function(content) {
                angular.forEach(content, function(object, key) {
                    try{
                        if(object.children) {
                            setState(object.children);
                        }

                        if(object.inner) {
                            setState(object.inner);
                        }

                        var tpl = (object.view) ? object.view : retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var url = retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var state = url;


                        var textClean = retira_acentos(object.text);
                        var tpl = (object.view) ? object.view : retira_acentos(object.text.toLowerCase()).replace(/\s/g, "-");
                        var url = textClean.toLowerCase().replace(/\s/g, "-");

                        var state = url;

                        var wordsControl = (object.module) ? object.module.split('-') : new Array();
                        var secondName = '';
                        if(wordsControl.length > 1) {
                            for (var i=1;i<wordsControl.length;i++)
                            { 
                                secondName += wordsControl[i].charAt(0).toUpperCase() + wordsControl[i].slice(1);
                            }
                        }

                        var control = (wordsControl.length) ? wordsControl[0].toLowerCase() + secondName + 'Controller' : null;
                        //console.log(control);
                        if(object.state) {
                            if(object.state.url) {
                                url = object.state.url;
                            }
                            if(object.state.name) {
                                state = object.state.name;
                            }
                        }

                        var bootstrapJs = (object.resolve) ? object.resolve : object.module;
                        var bust = (new Date()).getTime();
                        if(!$state.get(state)) {
                            msRoute.$stateProvider
                                .state(state, {
                                        url: "/" + url ,
                                        templateUrl: appBaseUrl + '/pages/' + object.module + '/views/' + tpl + '.tpl.html?t=' + bust,
                                        resolve: resolve(['pages/' + object.module + '/' + bootstrapJs]),
                                        controller: (object.controller) ? object.controller : control ,
                                        breadcrumb: object.breadcrumb ? object.breadcrumb : object.text,
                                        roles: object.roles ? object.roles : false,
                                        module: object.module
                                        ,onEnter: (object.onEnter) ? object.onEnter() : function(){}
                                 });
                         }


                    }
                    catch(e) {
                        $log.error(e);
                    }
                });
            }

            var create = function(content) {

                var deferred = $q.defer();

                var defaultRoute = 'login';

                angular.forEach(arguments, function(content) {

                    if(msSegurancaService.isUsuarioAutenticado()) {
                        defaultRoute = (typeof appConfig.login.sucesso != "undefined") ? appConfig.login.sucesso : 'login';
                    }
                    else {
                        defaultRoute = (typeof appConfig.defaultRoute != "undefined") ? appConfig.defaultRoute : 'home';
                    }

                    msRoute.$urlRouterProvider.otherwise(defaultRoute);

                    if(typeof content == 'string') {
                        $http.get(content).then(function(success) {
                            setState(success.data);
                            deferred.resolve(success.data);
                        }, function(reason){
                            $rootScope.$msAlert.error('Erro na criação de rotas : ' + reason);
                        });
                    }
                    else {
                        setState(content);
                        deferred.resolve(content);
                    }
                });
                return deferred.promise;
            }

            return {
                create: create
            };
    }]);

    return msRoute;
		
}();