/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalPreviaEmailController", ['$modal', '$filter', 'modalEditarEmailController', 'ngTableParams', '$q', 'encaminhamentoDemandaService', 'ResourcesService', 'demandaService',
        function ($modal, $filter, modalEditarEmailController, ngTableParams, $q, encaminhamentoDemandaService, ResourcesService, demandaService) {

            var abrir = function (idDemanda, idRedeOrigem, idUltimoEncaminhamento, callBack) {

                $modal.open({
                    windowClass: 'modal-previa-email',
                    templateUrl: 'app/pages/tratar-demanda/views/modalPreviaEmailFechamento.tpl.html',
                    size: 'lg',
                    controller: function ($scope, $modalInstance) {

                        $scope.arquivos = [];
                        $scope.respostas = [];

                        $scope.init = function () {
                            $q.all([carregarRespostas(idDemanda, idRedeOrigem), carregarArquivos(idUltimoEncaminhamento, idDemanda)]).then(function (resposta) {
                                if (resposta[0]) {
                                    $scope.respostas = resposta[0].resultado;
                                }

                                if (resposta[1]) {
                                    $scope.arquivos = resposta[1].resultado;
                                }
                            });
                        };

                        var carregarRespostas = function (idDemanda, idRedeOrigem) {
                            return encaminhamentoDemandaService.montarPreviaEmailFecharDemanda(idDemanda, idRedeOrigem);
                        };

                        var carregarArquivos = function (idUltimoEncaminhamento, idDemanda) {
                            return encaminhamentoDemandaService.carregarArquivosDemadaEncaminhamento(idUltimoEncaminhamento, idDemanda);
                        };

                        $scope.getUrlDownload = function (idArquivo) {
                            return '/' + ResourcesService.resourceUrls.comum + '/arquivo/' + idArquivo;
                        };

                        $scope.removerArquivo = function (arquivo) {
                            var indice = $scope.arquivos.findIndex(function (elem) {
                                return elem.id = arquivo.id;
                            });
                            $scope.arquivos.splice(indice, 1);
                        };

                        $scope.enviar = function () {
                            var rede = {'id': idRedeOrigem};
                            var demanda = {'id': idDemanda, 'rede': rede, 'arquivos': obterIdsArquivosEnvio()};
                            demandaService.enviarEmailFechamentoDemanda(demanda)
                                .then(function (resposta) {
                                    if(callBack){
                                        callBack();
                                    }
                                    $modalInstance.close();
                            });
                        };

                        var obterIdsArquivosEnvio = function () {
                            var idsArquivos = [];
                            angular.forEach($scope.arquivos, function (elem) {
                                idsArquivos.push({'id': elem.id});
                            });
                            return idsArquivos;
                        };

                        $scope.fechar = function () {
                            $modalInstance.close();
                        };

                        $scope.editar = function () {
                            $scope.fechar();
                            modalEditarEmailController.abrir(idDemanda, idRedeOrigem, idUltimoEncaminhamento, function (resposta) {
                                if (resposta.reabrir) {
                                    abrir(idDemanda, idRedeOrigem, idUltimoEncaminhamento, function (resposta) {

                                    });
                                }
                            });
                        };

                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
