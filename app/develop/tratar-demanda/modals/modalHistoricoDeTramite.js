/*global define, angular*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalHistoricoDeTramite", ['$modal', '$filter', '$sce', 'encaminhamentoDemandaService', 'arvoreUtils',
        function ($modal, $filter, $sce, encaminhamentoDemandaService, arvoreUtils) {

            var abrir = function (demanda, callback) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalHistoricoDeTramite.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {

                        $scope.fechar = function () {
                            if (callback) {
                                callback();
                            }

                            $modalInstance.close();
                        };

                        var montarNiveis = function () {

                            encaminhamentosDemanda.forEach(function (fila) {

                                var marginLeft = 4;
                                var nivel = 1;

                                if (fila) {
                                    fila.forEach(function (enc) {

                                        if (!enc.temporario) {
                                            var content = $filter('translate')('conteudo-historico');

                                            content = content.replace(/<%>/g, 'style="margin-left: ' + marginLeft + '%"');

                                            content = content.replace('<NOME>', (!enc.redeDestino.isSubRede) ? enc.redeDestino.ouvidoria.nome : enc.redeDestino.subrede.nome);
                                            content = content.replace('<NIVEL>', 'NIVEL ' + nivel);
                                            content = content.replace('<DATA>', (enc.dataEncaminhamento) ? $filter('date')(enc.dataEncaminhamento, 'dd-MM-yyyy HH:mm:ss') : '');

                                            content = content.replace('<SITUACAO>', (enc.statusEncaminhamentoDemanda.descricao) ? enc.statusEncaminhamentoDemanda.descricao : '');
                                            content = content.replace('<TIPO>', (enc.tipoEncaminhamento == 'C') ? $filter('translate')('conhecimento') : $filter('translate')('providencia'));
                                            content = content.replace('<COMENTARIO>', enc.comentarioParecer);

                                            HTML += '<div style="margin-top: 4%">' + content + '</div>';

                                            nivel += 1;
                                            marginLeft += 4;
                                        }
                                    });
                                }

                            });

                        };

                        var montarOrigem = function () {

                            var origem = encaminhamentosDemanda[0][0];

                            if (origem.temporario) {
                                return;
                            }

                            HTML = HTML.replace(/<%>/g, '');
                            HTML = HTML.replace('<NOME>', origem.redeOrigem.ouvidoria.nome);
                            HTML = HTML.replace('<NIVEL>', 'ORIGEM');
                            HTML = HTML.replace('<DATA>', (origem.dataEncaminhamento) ? $filter('date')(origem.dataEncaminhamento, 'dd-MM-yyyy HH:mm:ss') : '');

                            HTML = HTML.replace('<SITUACAO>', (origem.statusEncaminhamentoDemanda.descricao) ? origem.statusEncaminhamentoDemanda.descricao : '');
                            HTML = HTML.replace('<TIPO>', (origem.tipoEncaminhamento == 'C') ? $filter('translate')('conhecimento') : $filter('translate')('providencia'));
                            HTML = HTML.replace('<COMENTARIO>', origem.comentarioParecer);

                            montarNiveis();
                            $scope.htmlString = $sce.trustAsHtml(HTML);
                        };

                        var HTML = $filter('translate')('conteudo-historico');
                        var encaminhamentosDemanda = undefined;

                        var init = function () {
                            if (encaminhamentosDemanda && encaminhamentosDemanda[0]) {
                                montarOrigem();
                            }
                        };

                        if (demanda && demanda.encaminhamentosDemanda) {
                            // vindo do encaminharAnalisarDemandaController
                            encaminhamentosDemanda = angular.copy(demanda.encaminhamentosDemanda);
                            init();
                        } else {
                            encaminhamentoDemandaService.pesquisarPelaDemanda(demanda.id).then(function (resposta) {
                                encaminhamentosDemanda = resposta.resultado;
                                arvoreUtils.modificarEstruturaSeHouveSubRede(encaminhamentosDemanda);
                                init();
                            });
                        }

                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
