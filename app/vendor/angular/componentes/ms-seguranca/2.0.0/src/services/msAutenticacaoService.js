!function() {
    'use strict';

    var msSeguranca = angular.module('msSeguranca');

    msSeguranca.factory('msAutenticacaoService', ['$rootScope',  '$q', 'msSegurancaService', '$http', 'Restangular', '$msAlertService',
        function($rootScope, $q, msSegurancaService, $http, Restangular) {

            var getUserData = function(deferred, token) {
                if(!msSegurancaService.getUsuario()) {


                    Restangular.one(appConfig.login.url_usuario).get().then(function(response) {
                        msSegurancaService.setUsuario(response.resultado.usuario);
                        $rootScope.$broadcast('USER_LOGGED_IN', response.resultado.usuario);
                        deferred.resolve(msSegurancaService.getUsuario());
                    }, function(reason) {
                        deferred.reject(reason);
                    });
                }
                else {
                    deferred.resolve(msSegurancaService.getUsuario());
                }
            }

            var recuperarDadosUsuario = function() {
                var deferred = $q.defer();
                var token = msSegurancaService.getToken();
                if(msSegurancaService.isUsuarioAutenticado()) {
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    getUserData(deferred, token);
                }
                else {
                    deferred.reject('Não foi possível recuperar os dados do usuário.');
                }

                return deferred.promise;

            };

            var autenticar = function(credentials) {
                var deferred = $q.defer();

                var tempStr = credentials.client_id + ':' +  credentials.client_secret;
                /**
                 * Convertendo para formData
                 */
                credentials = $.param(credentials);

                var basicToken = base64_encode(tempStr);

                $http.defaults.headers.common['Authorization'] = 'Basic ' + basicToken;

                Restangular.all(appConfig.login.url).customPOST(credentials, null, null, {'Content-Type':'application/x-www-form-urlencoded'}).then(function(response) {
                    var token = response.access_token;
                    msSegurancaService.setToken(token);
                    $rootScope.$msAlert.clear();
                    $http.defaults.headers.common['Authorization'] = 'Bearer ' + token;
                    getUserData(deferred, token);
                }, function(reason) {
                    deferred.reject(reason);
                });

                return deferred.promise;
            };

            var sair = function() {
                try{
                    var deferred = $q.defer();

                    var params = {
                        token : msSegurancaService.getToken()
                    };

                    Restangular.all(appConfig.logout.url).post(params).then(function(response) {
                        msSegurancaService.setUsuarioAutenticado(false);
                        msSegurancaService.setUsuario(false);
                        delete $http.defaults.headers.common.Authorization;
                        //Parando o contador
                        $rootScope.$broadcast('timer-stop');
                        deferred.resolve(msSegurancaService);
                    }, function(reason) {
                        deferred.reject(reason);
                    });

                    return deferred.promise;
                }
                catch(e) {
                    $rootScope.$msAlert.error(e);
                }
            };

            return {
                autenticar: autenticar,
                sair: sair,
                recuperarDadosUsuario: recuperarDadosUsuario
            }

        }]);

    return msSeguranca;

}();