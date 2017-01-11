//define([
//        'msControllers/msAppController',
//        'componentes/ms-seguranca/services/msAutenticacaoService',
//        ], 
        !function() {
            'use strict';
            try {
                var msAppController = angular.module('msAppController');
                msAppController.controller('msLoginController',  ['$scope', '$state', 'msAutenticacaoService', '$rootScope','$timeout',
                    function($scope, $state, msAutenticacaoService, $rootScope, $timeout) {                        
 
                        if(typeof $scope.formLogin == 'undefined') {
                            $scope.formLogin = {
                                email: '',
                                password: '',
                                client_id: '',
                                client_secret: ''
                            }
                        }
                        
                         $scope.login = function() {
                            try {
                                
                                if(!appConfig.login) {
                                    throw 'Não foi informada uma configuração de login para a aplicação. Vide appConfig(main.js)';
                                }

                               if($scope.msLoginForm.$valid) {
                                   
                                    var senhaCrypto = CryptoJS.SHA256($scope.formLogin.password).toString();
                                    
                                    var credentials = {
                                        grant_type : 'password',
                                        client_id : $scope.formLogin.client_id,
                                        client_secret : $scope.formLogin.client_secret,
                                        username : $scope.formLogin.email,
                                        password : senhaCrypto
                                    };
                                    
                                    msAutenticacaoService.autenticar(credentials).then(function(result) {
                                        $state.go(appConfig.login.sucesso);
                                        
                                    }, function(reason) {
                                        $scope.$msNotify.error(reason.data.mensagens);
                                    }) ;
                                }
                                else {                                    
                                    throw 'Os dados informados não conferem';
                                }
                            }
                            catch(e) {
                                $scope.$msNotify.error(e, true);
                            }
                        };

                        $scope.logout = function() {
                            try {
                                msAutenticacaoService.sair().then(function(result) {
                                    $state.go('login');
                                });
                            }
                            catch(e) {
                                $scope.$msNotify.error(e);
                            }
                        };
                    
                }]);
            }
            catch(e) {
                    console.log(e);
            }
            
            return msAppController;
			
}();