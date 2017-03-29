define(['app'], function (app) {

        'use strict';

        app.factory('tramiteUtils', function () {

            var montarTipificacaoInLine = function (resposta) {
                var tipificacaoDemanda = '';

                if (!resposta || !resposta.resultado) {
                    return tipificacaoDemanda;
                }

                if (resposta.resultado.tipificacaoDemanda.assunto) {
                    tipificacaoDemanda = resposta.resultado.tipificacaoDemanda.assunto;
                }

                if (resposta.resultado.tipificacaoDemanda.subAssunto1) {
                    tipificacaoDemanda += ' > ' + resposta.resultado.tipificacaoDemanda.subAssunto1;
                }

                if (resposta.resultado.tipificacaoDemanda.subAssunto2) {
                    tipificacaoDemanda += ' > ' + resposta.resultado.tipificacaoDemanda.subAssunto2;
                }

                if (resposta.resultado.tipificacaoDemanda.subAssunto3) {
                    tipificacaoDemanda += ' > ' + resposta.resultado.tipificacaoDemanda.subAssunto3;
                }

                return tipificacaoDemanda;
            };

            return {
                montarTipificacaoInLine: function (resposta) {
                    return montarTipificacaoInLine(resposta);
                }
            }

        });

        app.service('tramiteValidador', ['comumService', 'TramiteEnum', 'encaminhamentoDemandaService', '$filter', 'arvoreUtils', '$rootScope',
            function (comumService, TramiteEnum, encaminhamentoDemandaService, $filter, arvoreUtils, $rootScope) {

                var atendimento = {
                    demanda: {id: null},
                    redeDestino: null,
                    origem: null,
                    encaminhamentos: []
                };

                var validadorTree = {
                    tipo_encaminhamento: {
                        qt_providencia: 0,
                        qt_conhecimento: 0,
                        qt_pendente_resposta: 0
                    },
                    root: [{id_children: null}],
                    children: [{id: null, qt_nodes_children: 0}]
                };

                var qtEncaminhamentoChildren = function (){
                    var redeLogada = comumService.getRedeAutenticada();

                    var total = 0;
                    angular.forEach(validadorTree.children, function(rede){
                        if (rede.id == redeLogada.id){
                            total = rede.qt_nodes_children;
                        }
                    });
                    return total;
                };

                var validarLocal = function (callback, callbackError) {
                    var redeLogada = comumService.getRedeAutenticada();

                    var origem = !atendimento.origem || (atendimento.origem.redeOrigem.id == redeLogada.id);

                    if (origem) {
                        if (validadorTree.root.length >= TramiteEnum.MAX_ENCAMINHAMENTO_ORIGEM) {
                            callbackError($filter('translate')('MI150'));
                            return;
                        }
                    } else {
                        var count = qtEncaminhamentoChildren();
                        if (count >= TramiteEnum.MAX_ENCAMINHAMENTO_DESTINO) {
                            callbackError($filter('translate')('MI188'));
                            return;
                        }
                    }

                    if (arvoreUtils.verificarDuplicidade(atendimento.encaminhamentos, atendimento.redeDestino)) {
                        callbackError($filter('translate')('ME093'));
                    } else {
                        callback();
                    }
                };

                var processarStatusArvore = function (arvore){
                    validadorTree = arvoreUtils.processarStatusArvore(arvore);
                };

                this.validarEncaminhamento = function (parametros, arvore, callbackSucesso, callbackError) {
                    processarStatusArvore(arvore);
                    atendimento = parametros;

                    validarLocal(function(){
                        encaminhamentoDemandaService
                            .validarEncaminhamento(parametros)
                            .then(callbackSucesso, callbackError);
                    }, callbackError);
                };

                this.validarSalvarEncaminhamento = function (parametros, arvore, callbackSucesso, callbackError) {
                    processarStatusArvore(arvore);
                    var qtEncTipoProvidencia = validadorTree.tipo_encaminhamento.qt_providencia;

                    if(parametros.encaminhamentoDemanda.length <= 0){
                        return;
                    }

                    if (qtEncTipoProvidencia <= 0) {
                        callbackError($filter('translate')('ME082'));
                    } else {
                        callbackSucesso();
                    }
                };

                this.verificarSeJaExisteUmaProvidencia = function ($scope, idAtual) {

                    for (var i = 0; i < $scope.demanda.encaminhamentosDemanda.length; i++) {
                        for (var j = 0; j < $scope.demanda.encaminhamentosDemanda[i].length; j++) {

                            if ($scope.demanda.encaminhamentosDemanda[i][j].id &&
                                $scope.demanda.encaminhamentosDemanda[i][j].id == idAtual) {
                                continue;
                            }

                            if ($scope.demanda.encaminhamentosDemanda[i][j].tipoEncaminhamento == 'P') {
                                return true;
                            }
                        }
                    }

                    return false;
                };

                this.verificarSegundoEncaminhamento = function (encaminhamentos) {
                    if (encaminhamentos.length >= 1) {
                        comumService.enviaMensagemSobreCampo('mensagemProvidencia', $filter('translate')('MI138'));
                        for (var i = 0; i < encaminhamentos.length; i++) {
                            for (var j = 0; j < encaminhamentos[i].length; j++) {
                                var situacao = encaminhamentos[i][j].situacaoAprovacaoGestor;
                                if (situacao && situacao.id == TramiteEnum.AGUARDANDO_APROVACAO_GESTOR) {
                                    comumService.enviaMensagemSobreCampo('mensagemEnviadaParaAprovacao', $filter('translate')('MI137'));
                                    return;
                                }
                            }
                        }
                    }
                };

                this.verificarBloqueioEncaminhamento = function (dataPrimeiroEncaminhamento, MAX_DIAS_BLOQUEIO, callbackError) {
                    var hoje = new Date();
                    var utc1 = Date.UTC(dataPrimeiroEncaminhamento.getFullYear(), dataPrimeiroEncaminhamento.getMonth(), dataPrimeiroEncaminhamento.getDate());
                    var utc2 = Date.UTC(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
                    var qtdDias = Math.floor((utc2 - utc1) / ( 1000 * 60 * 60 * 24));

                    if (qtdDias > MAX_DIAS_BLOQUEIO) {
                        callbackError($filter('translate')('MI149'));
                    }
                };

                this.verificarBloqueioAdicionarEncaminhamento = function ($scope) {
                    var redeLogada = comumService.getRedeAutenticada();

                    if ($scope.origem.redeOrigem.id == redeLogada.id) {
                        //TODO verificar quantidade de encaminhamentos validos realizados pela origem;
                        return $scope.demanda.encaminhamentosDemanda.length > 5;
                    } else {

                        for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {

                            if ($scope.demanda.encaminhamentosDemanda[j]) {

                                for (var i = 1; i < $scope.demanda.encaminhamentosDemanda[j].length; i++) {

                                    if ($scope.demanda.encaminhamentosDemanda[j][i].redeOrigem.id == redeLogada.id) {
                                        return true;
                                    }
                                }
                            }
                        }
                    }
                };

                this.validarAprovacaoGestor = function (encaminhamentos) {
                    for (var j = 0; j < encaminhamentos.length; j++) {
                        if (encaminhamentos[j]) {
                            for (var i = 0; i < encaminhamentos[j].length; i++) {
                                var situacao = encaminhamentos[j][i].situacaoAprovacaoGestor;
                                if (situacao && situacao.id == TramiteEnum.AGUARDANDO_APROVACAO_GESTOR) {
                                    return true;
                                }
                            }
                        }
                    }
                    return false;
                };

                this.isAprovadoPeloGestor = function (node) {
                    if (node.node.situacaoAprovacaoGestor && node.node.situacaoAprovacaoGestor.id == 3) {
                        comumService.enviaMensagemSobreCampo('mensagemNaoAprovacao', $filter('translate')('MI151'));
                    }
                };

            }]);

        return app;

    }
);
