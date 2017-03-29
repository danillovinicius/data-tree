/*global define, Map, _, angular*/
define(['app'], function (app) {
    app.controller('tratarDemandaController', ['$rootScope', '$scope', '$state', '$filter', '$stateParams', 'EscopoCompartilhadoService', 'tratarDemandaService', 'comumService', 'demandaService', 'StatusDemandaEnum', '$timeout',
        function ($rootScope, $scope, $state, $filter, $stateParams, EscopoCompartilhadoService, tratarDemandaService, comumService, demandaService, StatusDemandaEnum, $timeout) {

            function clear() {
                $scope.bloquearCampoEncaminhamento = true;
                $scope.filtro = {tipificacaoComplementar: {}};
                $scope.tipificacaoComplementar = [];
                $scope.assuntos = [];
                $scope.listaSubAssuntos1 = [];
                $scope.listaSubAssuntos2 = [];
                $scope.listaSubAssuntos3 = [];
                $scope.farmacos = [];
                $scope.mostarCamposTipificacao = false;
                $scope.mostrarBotaoAdicionarNome = false;
                $scope.mostrarBotaoTipificacaoComplementar = false;
                $scope.showFarmaco = false;
                $scope.modoVisualizacao = true;
                $scope.tipificacaoDemanda = {
                    farmaco: {id: undefined},
                    assunto: undefined,
                    subAssunto1: undefined,
                    subAssunto2: undefined,
                    subAssunto3: undefined
                };
            }

            function goRegistrarAtendimento() {
                $state.transitionTo('registrar-atendimento');
            }

            function showMessageError(message) {
                $timeout(function () {
                    $scope.$msNotify.error(message, true);
                }, 500);
            }

            function filtrarAssuntoCadastrado() {
                angular.forEach($scope.assuntos, function (assunto) {
                    if (assunto.descricao == $scope.tipificacaoDemanda.assunto) {
                        $scope.tipificacaoDemanda.assunto = assunto;
                        if ($scope.tipificacaoDemanda.assunto && $scope.tipificacaoDemanda.assunto.id) {
                            carregarSubAssuntoTipificacao($scope.tipificacaoDemanda.assunto.id);
                        }
                        carregarFarmacos();
                    }
                });
            }

            function pesquisarAssuntoTipificacao() {
                tratarDemandaService.pesquisarAssuntoTipificacao($scope.demanda.classificacaoDemanda.id)
                    .then(function (resposta) {
                        $scope.assuntos = resposta.resultado;
                        filtrarAssuntoCadastrado();
                    }, function (error) {
                        showMessageError(error.data.mensagens)
                    });
            }

            function pesquisarAllFarmaco() {
                comumService.findAllFarmacos().then(function (resp) {
                    $scope.farmacos = resp.resultado;
                }, function (error) {
                    showMessageError(error.data.mensagens)
                });
            }

            function salvarTipificaoDemanda() {
                var parametros = {
                    tipificacaoDemanda: {
                        farmaco: $scope.tipificacaoDemanda.farmaco && $scope.tipificacaoDemanda.farmaco.id ? {id: $scope.tipificacaoDemanda.farmaco.id} : undefined,
                        assunto: $scope.tipificacaoDemanda.assunto,
                        subAssunto1: $scope.tipificacaoDemanda.subAssunto1,
                        subAssunto2: $scope.tipificacaoDemanda.subAssunto2,
                        subAssunto3: $scope.tipificacaoDemanda.subAssunto3
                    },
                    valorCampoTipificacaoComplementar: [],
                    demandaId: $scope.demanda.id
                };

                Object.keys($scope.filtro.tipificacaoComplementar).forEach(function (idCampo) {
                    if ($scope.filtro.tipificacaoComplementar[idCampo]) {
                        var valor = $scope.filtro.tipificacaoComplementar[idCampo];
                        valor.campoTipificacaoComplementar = {id: idCampo};
                        parametros.valorCampoTipificacaoComplementar.push(valor);
                    }
                });

                tratarDemandaService.salvarTipificacaoDaDemanda(parametros).then(function (resultado) {
                    $state.go('encaminhar-analisar-demanda', {'idDemanda': $scope.demanda.id, 'isOrigem': true});
                }, function (error) {
                    showMessageError(error.data.mensagens)
                });
            }

            function pesquisarSePossuiCampoTipificacaoComplementar() {
                if ($scope.tipificacaoDemanda.subAssunto1) {
                    tratarDemandaService.isPossuiCampoTipificacaoComplementar().then(function (resp) {
                        $scope.possuiCampoTipificacao = resp.resultado;
                    });
                }
            }

            function preencherValoresDoCampoTipifiCompl(resultado) {
                resultado.forEach(function (valor) {
                    var id = valor.campoTipificacaoComplementar.id;
                    $scope.tipificacaoComplementar[id] = valor.descricao;
                    $scope.tipificacaoComplementarGenericoAutoComplete(valor.campoTipificacaoComplementar, function () {
                        $scope.addTipificacaoComplentar(valor, valor.campoTipificacaoComplementar);
                    });
                });
            }

            function inicializarNomeDosCamposTipificacaoComplementar(valorCampoTipificacaoComplementar) {
                if (valorCampoTipificacaoComplementar) {
                    $scope.mostarCamposTipificacao = true;
                    $scope.buscarCamposTipificacaoComplementar(function () {
                        tratarDemandaService.recuperarValoresCampoCompl($scope.demanda.id)
                            .then(function (resposta) {
                                preencherValoresDoCampoTipifiCompl(resposta.resultado);
                            }, function (error) {
                                showMessageError(error.data.mensagens)
                            });
                    });
                }
            }

            function carregarSubAssuntoTipificacao(idAssunto) {
                var subassuntos = [{lista: 'listaSubAssuntos1', sub: 'subAssunto1', nivel: 1},{lista: 'listaSubAssuntos2', sub: 'subAssunto2', nivel: 2},{lista: 'listaSubAssuntos3', sub: 'subAssunto3', nivel: 3}];
                angular.forEach(subassuntos, function (item) {
                    executaConsultaSubAssuntoTipificacao(idAssunto, item.nivel, function (resposta) {
                        $scope[item.lista] = resposta.resultado;
                    });
                });
            }

            function visualizarEditarTipificacaoDemanda(resultado) {
                if ($scope.modoVisualizacao) {
                    $scope.showFarmaco = $scope.tipificacaoDemanda.farmaco && $scope.tipificacaoDemanda.farmaco.id;
                } else {
                    pesquisarAssuntoTipificacao();
                }
                pesquisarSePossuiCampoTipificacaoComplementar();
                inicializarNomeDosCamposTipificacaoComplementar(resultado.valorCampoTipificacaoComplementar);
            }

            function processarTipificacoes(resultado) {
                if (!$scope.isEmpty(resultado) && !$scope.isEmpty(resultado.demanda)) {
                    $scope.demanda = resultado.demanda;
                    $scope.statusDemandaFechada = _.contains([StatusDemandaEnum.FECHADA.id, StatusDemandaEnum.ARQUIVADA.id], $scope.demanda.statusDemanda.id);
                    if (resultado.tipificacaoDemanda) {
                        $scope.tipificacaoDemanda = resultado.tipificacaoDemanda;
                    }
                    $scope.modoVisualizacao = !$scope.demanda.tipificacaoEditavel || $scope.statusDemandaFechada;
                    visualizarEditarTipificacaoDemanda(resultado);
                } else {
                    showMessageError("Não foi possivel realizar a ação");
                    goRegistrarAtendimento();
                }
            }

            function recuperarDados(idDemanda) {
                tratarDemandaService.recuperarTipificacoes(idDemanda).then(function (resposta) {
                    processarTipificacoes(resposta.resultado);
                }, function (error) {
                    showMessageError(error.data.mensagens)
                });
            }

            function executaConsultaSubAssuntoTipificacao(id, nivel, callback) {
                tratarDemandaService.pesquisarSubAssuntoTipificacao(id, nivel).then(function (resposta) {
                    if (callback) {
                        callback(resposta);
                    }
                });
            }

            function carregarFarmacos() {
                $scope.farmacos = [];
                $scope.showFarmaco = false;
                if ($scope.tipificacaoDemanda.assunto && $scope.tipificacaoDemanda.assunto.farmaco && $scope.tipificacaoDemanda.assunto.farmaco === 'S') {
                    $scope.showFarmaco = true;
                    pesquisarAllFarmaco();
                }
            }

            $scope.pesquisarSubAssuntoTipificacao = function (resultado, nivel) {
                if ($scope.tipificacaoDemanda.assunto && $scope.tipificacaoDemanda.assunto.id) {
                    executaConsultaSubAssuntoTipificacao($scope.tipificacaoDemanda.assunto.id, nivel, function (resposta) {
                        $scope[resultado] = resposta.resultado;
                    });
                }
            };

            $scope.limparSubAssunto = function (listaNgModels) {
                angular.forEach(listaNgModels, function (sub) {
                    $scope.tipificacaoDemanda[sub] = null;
                });
            };

            $scope.limparLista = function (listaNgModels) {
                angular.forEach(listaNgModels, function (lista) {
                    $scope[lista] = [];
                });
            };

            $scope.tipificacaoComplementarGenericoAutoComplete = function (campo, callback) {
                var idCampo = campo.id;

                if (campo.orderCampo == 2) {
                    $scope.botaoNovoNome = $scope.tipificacaoComplementar[idCampo].length > 0;
                }

                if ($scope.filtro.tipificacaoComplementar[idCampo]) {
                    $scope.filtro.tipificacaoComplementar[idCampo] = undefined;
                }

                if ($scope.tipificacaoComplementar[idCampo] && $scope.tipificacaoComplementar[idCampo].length > 1) {
                    var parametros = {
                        idCampo: idCampo,
                        nome: $scope.tipificacaoComplementar[idCampo]
                    };

                    tratarDemandaService.pesquisarCampoNomeTipificacaoComplementar(parametros).then(function (resposta) {
                        $scope.listaTipificacaoComplementar[idCampo] = resposta.resultado;
                            $scope.mostrarBotaoAdicionarNome = campo.nome === $filter('translate')('label-nome-profissional');
                        if (callback) {
                            callback();
                        }
                    });

                } else {
                    $scope.listaTipificacaoComplementar[idCampo] = [];
                    if (campo.nome === $filter('translate')('label-nome-profissional')) {
                        $scope.mostrarBotaoAdicionarNome = false;
                    }
                }
            };

            $scope.assuntoOnSelect = function () {
                $scope.tipificacaoDemanda.farmaco.id = undefined;
                carregarFarmacos();
            };

            $scope.pesquisarSePossuiCampoTipificacaoComplementar = function () {
                if (_.isUndefined($scope.possuiCampoTipificacao) && !_.isUndefined($scope.tipificacaoDemanda.subAssunto1)) {
                    pesquisarSePossuiCampoTipificacaoComplementar();
                }
            };

            $scope.adicionarNovoNome = function (campo) {
                var nome = $scope.tipificacaoComplementar[campo.id];

                var parametros = {
                    nome: nome,
                    idCampoTipificacaoComplementar: campo.id
                };

                tratarDemandaService.adicionarValorCampoNome(parametros)
                    .then(function (resposta) {
                        $scope.$msAlert.success(resposta.mensagens, false);
                        $scope.tipificacaoComplementar[campo.id] = undefined;
                    });
            };

            $scope.buscarCamposTipificacaoComplementar = function (callback) {
                tratarDemandaService.buscarCamposTipificacaoComplementar(comumService.getRedeAutenticada().id).then(function (resp) {
                    $scope.camposTipificados = resp.resultado;
                    $scope.listaTipificacaoComplementar = {};
                    $scope.camposTipificados.forEach(function (campo) {
                        $scope.listaTipificacaoComplementar[campo.id] = [];
                    });
                    if (Object.keys($scope.listaTipificacaoComplementar).length > 0) {
                        $scope.mostarCamposTipificacao = true;
                    }
                    if (callback) {
                        callback();
                    }
                });
            };

            $scope.blurTipificacaoComplementar = function (campo) {
                if ($scope.filtro.tipificacaoComplementar[campo.id] == undefined
                    && campo.nome !== $filter('translate')('label-nome-profissional') && campo.orderCampo !== 2) {
                    $scope.tipificacaoComplementar[campo.id] = undefined;
                }
            };

            $scope.addTipificacaoComplentar = function ($item, campo) {
                $scope.filtro.tipificacaoComplementar[campo.id] = $item;
                if (campo.nome === $filter('translate')('label-nome-profissional')) {
                    $scope.mostrarBotaoAdicionarNome = false;
                }
            };

            $scope.isEmpty = function (value) {
                return comumService.validaCampoVazio(value);
            };

            $scope.cancelar = function () {
                $state.transitionTo('registrar-atendimento', {p: $scope.demanda.numeroProtocolo});
            };

            $scope.proximo = function () {
                var redeDestino = !$scope.demanda.tipificacaoEditavel;
                if (redeDestino || $scope.statusDemandaFechada) {
                    $state.transitionTo('tratar-demanda-tramitada', {idDemanda: $scope.demanda.id});
                } else {
                    salvarTipificaoDemanda();
                }
            };

            $scope.init = function () {
                clear();
                var demanda = EscopoCompartilhadoService.getObjeto('tratar-demanda');
                if (demanda && demanda.id) {
                    EscopoCompartilhadoService.removerFiltro('tratar-demanda');
                    recuperarDados(demanda.id);
                } else {
                    goRegistrarAtendimento();
                }
            };
        }]);
    return app;
});
