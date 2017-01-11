//define([
//        'angular'
//        ], 
        !function() {
            'use strict';
            try {
                return angular.module('msAppController', []);;
            }
            catch(e) {
                    console.log(e);
            }
			
}();
//define([
//        'msControllers/msAppController'
//        ], 
        !function() {
            'use strict';
            try {
                var msAppController = angular.module('msAppController');
                msAppController.controller('msAlertController', ['$scope', '$attrs', function ($scope, $attrs) {
                    $scope.closeable = 'close' in $attrs;
                }]);
            }
            catch(e) {
                    console.log(e);
            }
            
            return msAppController;
			
}();
define([
        //'msControllers/msAppController'
    ],
    function () {
        'use strict';
        try {

            var msAppController = angular.module('msAppController');
            msAppController.controller('msController', ['$rootScope', '$scope', 'msAutenticacaoService', 'msRouteService',
                function ($rootScope, $scope, msAutenticacaoService, msRouteService) {

                    $scope.app = appConfig;

                    $scope.edit = function () {
                        $scope.$msNotify.info('Editando');
                    };

                    $scope.remove = function (url) {
                        $scope.$msNotify.error('Remoção');
                    };

                    $scope.view = function () {
                        $scope.$msNotify.error('Visualizando');
                    };


                    /**
                     * Controlador de MENU.
                     * Escopo GLOBAL da aplicação.
                     */
                    $scope.menu = [];

                    $scope.alterarMenu = function (data) {
                        if (data)
                            $scope.menu = data;
                    };

                    var loginModule = (typeof appConfig.login != 'undefined' && typeof appConfig.login.module != 'undefined') ? appConfig.login.module : 'login';

                    var loginRoutes = [{
                        module: loginModule,
                        view: 'login',
                        resolve: 'login',
                        controller: 'loginController',
                        text: 'Login'
                    },
                        {
                            module: loginModule,
                            text: 'logout',
                            resolve: 'login',
                            controller: 'loginController',
                            view: 'login'
                        }];

                    msRouteService.create(loginRoutes);

                    /*
                     * Edição de usuário logado
                     */
                    $scope.editUsuario = function () {
                    }

                    /*
                     * Atualização de grid do ngTable
                     */

                    $scope.reloadNgTable = function (ngTable, filtro) {
                        ngTable.$params.filtro = {};
                        angular.forEach(filtro, function (value, indice) {
                            if (value == null) {
                                if (ngTable.$params.filtro[indice]) {
                                    delete ngTable.$params.filtro[indice];
                                }
                            }
                            else {
                                if (typeof value == 'object') {
                                    ngTable.$params.filtro[indice] = new Array(value);
                                } else {
                                    if (value != 'null')
                                        ngTable.$params.filtro[indice] = value
                                }
                            }
                        });
                    }

                    $scope.ngTableOrderClick = function (ngTable, column) {
                        if (column.order)
                            ngTable.sorting(column.field, ngTable.isSortBy(column.field, 'asc') ? 'desc' : 'asc');
                    }

                    msAutenticacaoService.recuperarDadosUsuario().then(function (resultado) {
                    });

                }]);
        }
        catch (e) {
            console.log(e);
        }

        return msAppController;

    });
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