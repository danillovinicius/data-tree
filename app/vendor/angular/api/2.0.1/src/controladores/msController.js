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