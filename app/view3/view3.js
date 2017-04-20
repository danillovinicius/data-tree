'use strict';

angular.module('myApp.view3', ['ngRoute'])

    .config(['$routeProvider', function ($routeProvider) {
        $routeProvider.when('/view3', {
            templateUrl: 'view3/view3.html',
            controller: 'View3Ctrl'
        });
    }])

    .controller('View3Ctrl', ['$scope','modalLocaisEncaminhamento', function ($scope, modalLocaisEncaminhamento) {
        $scope.abrirModalLocaisEncaminhamento = function () {
            modalLocaisEncaminhamento.abrir(function (redeSelecionada) {
                console.log(redeSelecionada);
            });
        };

    }])

    .factory("modalLocaisEncaminhamento", ['$modal', function ($modal) {

            var abrir = function (callBack) {

                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'view3/modalLocaisEncaminhamento.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {

                        $scope.redes = [
                            {id:1, nome:'Rede 1', nivel:'I'},
                            {id:2, nome:'Rede 2', nivel:'I'},
                            {id:3, nome:'Rede 3', nivel:'I'},
                            {id:4, nome:'Rede 4', nivel:'I'},
                            {id:5, nome:'Rede 5', nivel:'I'},
                            {id:6, nome:'Subede 6', nivel:'II'},
                            {id:7, nome:'Rede 7', nivel:'II'},
                            {id:8, nome:'Rede 8', nivel:'III'},
                            {id:9, nome:'Rede 9', nivel:'I'},
                            {id:10, nome:'Rede 10', nivel:'I'}
                        ];

                        $scope.filtro = {};

                        $scope.fechar = function () {
                            $modalInstance.close();
                        };

                        $scope.selecionarRede = function (redeSelecionada) {
                            $modalInstance.close();
                        };

                    }
                });
            };

            return {
                abrir: abrir
            };
        }])
;