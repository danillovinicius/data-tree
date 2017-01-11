/*global define, angular, Map*/
define(['app', 'angularTreeview'], function (app) {

    "use strict";

    app.controller('encaminharAnalisarDemandaController',
        ['$scope', '$rootScope', '$state', '$filter', '$upload', '$q', '$stateParams', 'EscopoCompartilhadoService', 'demandaService', 'ResourcesService', 'comumService', 'msModalService', 'modalRegistrarDemanda', 'ngTableParams', 'configurarPrazoDemandaService', 'encaminhamentoDemandaService', 'modalLocaisEncaminhamento', 'arquivosUtils', 'modalReaproveitarAnexo', '$location', '$anchorScroll', 'modalHistoricoDeTramite', 'modalEncaminharDemanda', 'modalEncaminhamentoRedeSemAcesso', '$validator', 'arvoreUtils', 'tramiteValidador', 'modalPreviaEmailFecharDemanda', 'manterRedeService', 'tratarDemandaService', 'tramiteUtils', 'TramiteEnum', 'StatusDemandaEnum',
            function ($scope, $rootScope, $state, $filter, $upload, $q, $stateParams, EscopoCompartilhadoService, demandaService, ResourcesService, comumService, msModalService, modalRegistrarDemanda, ngTableParams, configurarPrazoDemandaService, encaminhamentoDemandaService, modalLocaisEncaminhamento, arquivosUtils, modalReaproveitarAnexo, $location, $anchorScroll, modalHistoricoDeTramite, modalEncaminharDemanda, modalEncaminhamentoRedeSemAcesso, $validator, arvoreUtils, tramiteValidador, modalPreviaEmailFecharDemanda, manterRedeService, tratarDemandaService, tramiteUtils, TramiteEnum, StatusDemandaEnum) {

                $scope.CONFIG = {
                    MAX_DIAS_BLOQUEIO: 3,
                    OPEN_DATE_PICKET: false,
                    MIN_DATE: new Date(),
                    MAX_DATE: new Date()
                };

                var IS_ORIGEM = !$stateParams.encaminhado || $stateParams.encaminhado == 'false';

                var PIORIDADE_ALTA = 1;
                var PIORIDADE_MEDIA = 2;
                var PIORIDADE_BAIXA = 3;
                var PIORIDADE_URGENTE = 4;

                var AGUARDANDO_APROVACAO_GESTOR = 1;

                var PRAZO_UNICO = 'U';
                var PROVIDENCIA = 'P';
                var CONHECIMENTO = 'C';
                var ENCAMINHAMENTO = 'E';

                var SIM = 'S';
                var NAO = 'N';

                var ALTERADO = 'ALTERADO';
                var NAO_ALTERADO = 'NAO_ATERADO';

                var ESFERA = 'ESFERA';
                var TIPO_OUVIDORIA = 'TIPO_OUVIDORIA';
                var UF = 'UF';
                var MUNICIPIO = 'MUNICIPIO';
                var NIVEL = 'NIVEL';

                var formatarArquivo = function (file) {

                    var selecionaArquivo = 'file-input';

                    comumService.limpaMensagensDeObrigatoriedadePorIds([selecionaArquivo]);

                    var existeArquivo = false;
                    var a = file.name.split(".");
                    var fileExtensao = a[a.length - 1];

                    angular.forEach($scope.demanda.arquivos, function (arquivo) {
                        if (file.name === arquivo.nomeArquivo && fileExtensao === arquivo.extensao) {
                            existeArquivo = true;
                        }
                    });

                    var fileFormatado = {
                        extensao: fileExtensao,
                        decricaoPalavraChave: file.name,
                        dataUpload: file.lastModifiedDate,
                        nomeArquivo: file.name,
                        tamanho: file.size,
                        tipoArquivo: file.type
                    };

                    if (!arquivosUtils.validaMaximo2Mega(fileFormatado.tamanho)) {
                        goToAchor();
                        $scope.$msAlert.error($filter('translate')('ME013'));
                        return;
                    }

                    var validarExtensao = comumService.verificarExtensaoArquivoValida(fileFormatado);

                    if (existeArquivo) {
                        comumService.enviaMensagemSobreCampo(selecionaArquivo, $filter('translate')('MI096'));
                    } else if (validarExtensao) {
                        comumService.enviaMensagemSobreCampo(selecionaArquivo, validarExtensao);
                    } else {
                        var url = 'api/manter-demanda/upload/'.concat($scope.demanda.id);
                        $rootScope.$msNotify.loading();
                        $upload.upload({
                            url: url,
                            file: file
                        }).then(function (resposta) {
                            fileFormatado.id = resposta.data.resultado;
                            angular.forEach(angular.element("input[type='file']"), function (inputElem) {
                                angular.element(inputElem).val(null);
                            });

                            if (!$scope.demanda.arquivos) {
                                $scope.demanda.arquivos = [];
                            }

                            $scope.demanda.arquivos.splice(0, 0, fileFormatado);

                            $rootScope.$msNotify.close();
                        }, function (reason) {
                            goToAchor();
                            $scope.$msAlert.error(reason.data.mensagens);
                            $rootScope.$msNotify.close();
                        });
                    }
                };

                var goToAchor = function () {
                    $location.hash('anchor');
                    $anchorScroll();
                };

                var bloquearCalendario = function () {
                    $scope.isPrazoSelecionado = true;
                    $scope.bloquearFiltroPioridade = true;
                };

                var desbloquearCalendario = function () {
                    $scope.isPrazoSelecionado = true;
                    $scope.bloquearFiltroPioridade = false;
                };

                var callbackErrorMessage = function(resultado){
                    goToAchor();
                    var mensagem = resultado.data ? resultado.data.mensagens : resultado;
                    $scope.$msAlert.error(mensagem, true);
                };

                var preencherComboRede = function (dict) {
                    $scope.redes.map(function (rede) {
                        dict[ESFERA][rede.ouvidoria.esferaAdministrativa.id] = rede.ouvidoria.esferaAdministrativa;

                        dict[TIPO_OUVIDORIA][rede.ouvidoria.tipoOuvidoria.id] = rede.ouvidoria.tipoOuvidoria;

                        dict[UF][rede.ouvidoria.endereco.municipio.uf.id] = rede.ouvidoria.endereco.municipio.uf;

                        dict[MUNICIPIO][rede.ouvidoria.endereco.municipio.id] = rede.ouvidoria.endereco.municipio;

                        dict[NIVEL][1] = {id: 1};
                    });
                };

                var preencherComboSubRede = function (dict) {
                    $scope.subRedes.map(function (resubRede) {
                        dict[ESFERA][resubRede.rede.ouvidoria.esferaAdministrativa.id] = resubRede.rede.ouvidoria.esferaAdministrativa;

                        dict[TIPO_OUVIDORIA][resubRede.rede.ouvidoria.tipoOuvidoria.id] = resubRede.rede.ouvidoria.tipoOuvidoria;

                        dict[UF][resubRede.rede.ouvidoria.endereco.municipio.uf.id] = resubRede.rede.ouvidoria.endereco.municipio.uf;

                        dict[MUNICIPIO][resubRede.rede.ouvidoria.endereco.municipio.id] = resubRede.rede.ouvidoria.endereco.municipio;

                        dict[NIVEL][resubRede.nivel] = {id: resubRede.nivel};
                    });
                };

                var carregarComboBoxRede = function () {

                    var dict = {};

                    [ESFERA, TIPO_OUVIDORIA, UF, MUNICIPIO, NIVEL].forEach(function (key) {
                        dict[key] = {};
                    });

                    preencherComboRede(dict);
                    preencherComboSubRede(dict);

                    $scope.esferas = comumService.objectKeysMap(dict, ESFERA);
                    $scope.tipos = comumService.objectKeysMap(dict, TIPO_OUVIDORIA);
                    $scope.ufs = comumService.objectKeysMap(dict, UF);
                    $scope.municipios = comumService.objectKeysMap(dict, MUNICIPIO);
                    $scope.niveis = comumService.objectKeysMap(dict, NIVEL);
                };

                var validarEncaminhamentos = function () {
                    var encaminhamentos = $scope.demanda.encaminhamentosDemanda;
                    if ($scope.acao == ENCAMINHAMENTO) {
                        var dataEncaminhamento = new Date(encaminhamentos[0][0].dataEncaminhamento);

                        tramiteValidador.verificarBloqueioEncaminhamento(dataEncaminhamento, $scope.CONFIG.MAX_DIAS_BLOQUEIO, function (resultado) {
                            callbackErrorMessage(resultado);
                            $scope.bloquearEncaminhamento = true;
                        });

                        tramiteValidador.verificarSegundoEncaminhamento(encaminhamentos);
                        $scope.aprovacaoGestor = tramiteValidador.validarAprovacaoGestor(encaminhamentos);
                        $scope.maximoEncaminhamento = tramiteValidador.verificarBloqueioAdicionarEncaminhamento($scope);
                    }
                };

                var preencherCalendario = function () {

                    $scope.filtro.tipoPrioridade = ($scope.demanda.prioridade) ? $scope.demanda.prioridade.id : undefined;
                    $scope.filtro.prazoResposta = $scope.demanda.dataLimiteDemanda;

                    if (!$scope.filtro.prazoResposta) {
                        $scope.calcularDataLimitePrazoDaDemanda();
                    }

                    if (!IS_ORIGEM && !$scope.filtro.tipoPrioridade) {
                        $scope.showCampoPrioridade = false;
                    }
                };

                var recuperarEncaminhamentos = function () {
                    comumService.iniciarTelaDeAguarde($rootScope);
                    $scope.demanda.encaminhamentosDemanda = [];

                    encaminhamentoDemandaService.pesquisarPelaDemanda($scope.demanda.id).then(function (resposta) {
                        comumService.fecharTelaDeAguarde($rootScope);
                        var contemEncaminhamento = resposta.resultado[0] && resposta.resultado[0][0];

                        if (contemEncaminhamento) {
                            $scope.demanda.encaminhamentosDemanda = resposta.resultado;
                            arvoreUtils.modificarEstruturaSeHouveSubRede($scope.demanda.encaminhamentosDemanda);
                            criarArvore();
                            validarEncaminhamentos();
                        } else {
                            desbloquearCalendario();
                        }
                    }, function (error) {
                        comumService.fecharTelaDeAguarde($rootScope);
                    });
                };

                var montarPrazoDemanda = function (resposta) {
                    $scope.prazoDemanda = resposta.resultado;

                    if ($scope.prazoDemanda && $scope.prazoDemanda.tipoConfiguracaoPrazo == PRAZO_UNICO) {
                        $scope.showCampoPrioridade = false;
                    }
                    preencherCalendario();
                };

                var montarRedes = function (resposta) {
                    $scope.redes = resposta.resultado.redes != undefined ? resposta.resultado.redes : [];
                    $scope.subRedes = resposta.resultado.subredes != undefined ? resposta.resultado.subredes : [];
                    carregarComboBoxRede();
                };

                var exibeOpcaoAnalisar = function () {
                    var statusAnalise = [StatusDemandaEnum.NOVA.id, StatusDemandaEnum.EM_ANALISE.id];
                    var analisar = _.contains(statusAnalise, $scope.demanda.statusDemanda.id);
                    $scope.exibeOpcaoAnalisar = IS_ORIGEM && analisar;
                };

                var montarDemanda = function (resposta) {
                    $scope.demanda = resposta.resultado;
                    recuperarEncaminhamentos();
                    exibeOpcaoAnalisar();
                };

                var recuperarDados = function () {
                    comumService.iniciarTelaDeAguarde($rootScope);

                    $q.all([demandaService.buscarPorId($stateParams.idDemanda),
                        configurarPrazoDemandaService.recuperarConfiguracaoDaRedeTramitar(),
                        encaminhamentoDemandaService.obterRedesVinculadas()])
                        .then(function (res) {
                            comumService.fecharTelaDeAguarde($rootScope);

                            if (res[0].resultado) {
                                montarDemanda(res[0]);
                            }

                            if (res[1]) {
                                montarPrazoDemanda(res[1])
                            }

                            if (res[2]) {
                                montarRedes(res[2]);
                            }
                        });
                };

                var compartilhar = function (arquivo) {
                    var parametros = {
                        arquivos: [arquivo],
                        demanda: {id: $scope.demanda.id}
                    };

                    encaminhamentoDemandaService.compartilharArquivos(parametros)
                        .then(function (resultado) {
                            goToAchor();
                            $scope.$msAlert.success(resultado.mensagens, true);
                        });
                };

                var verificaSePossuiAcessoInternet = function (id, callback) {
                    encaminhamentoDemandaService.ouvidorPossuiAcesso(id).then(callback);
                };

                var listarArquivos = function (encaminhamento) {
                    encaminhamentoDemandaService.listarEncaminhamento(encaminhamento.id)
                        .then(function (resposta) {
                            encaminhamento.arquivos = resposta.resultado;
                        });
                };

                var isAutorizadoVisualizar = function (encaminhamento) {
                    if (encaminhamento.nivel == 0) {
                        return false;
                    }
                    return encaminhamento.node.visualizarNivel;
                };

                var criarArvore = function (encaminhamento) {

                    $scope.visualizarEncamihamentos = true;

                    arvoreUtils.removePosicoesVazia($scope);

                    $scope.origem = arvoreUtils.getOrigemEcaminhamento(encaminhamento, $scope);

                    arvoreUtils.montarEstruturaDeFila(encaminhamento, $scope);

                    $scope.arvore = arvoreUtils.montarArvoreEncaminhamento($scope);

                    $scope.nodeSelecionado = arvoreUtils.getNodeAtual(encaminhamento, $scope);
                    $scope.nodeSelecionado.ativo = true;
                    tramiteValidador.isAprovadoPeloGestor($scope.nodeSelecionado);
                    var rede = comumService.getRedeAutenticada();
                    $scope.exibeOpcaoFecharDemanda = ($scope.origem) ? $scope.origem.redeOrigem.id == rede.id : false;
                };

                var verificarAprovacao = function (encaminhamentoSelecionado, callback) {
                    if (encaminhamentoSelecionado.situacaoAprovacaoGestor && encaminhamentoSelecionado.situacaoAprovacaoGestor.id == AGUARDANDO_APROVACAO_GESTOR) {
                        abrirModalRetirarDaFila(encaminhamentoSelecionado, callback);
                    } else {
                        if (callback) {
                            callback(NAO_ALTERADO);
                        }
                    }
                };

                var abrirModalJaExisteProvidencia = function (encaminhamentoSelecionado) {

                    msModalService.setOptions({
                        title: $filter('translate')('aviso'),
                        content: $filter('translate')('MC024'),
                        buttons: {
                            'Sim': {
                                name: 'Sim',
                                ngClick: function () {

                                    alterarEncaminhamento(encaminhamentoSelecionado);
                                    msModalService.close();

                                },
                                style: 'btn btn-primary'
                            },
                            'Nao': {
                                name: 'Cancelar',
                                ngClick: function () {
                                    msModalService.close();
                                    cancelarAlterarEncaminhamento(encaminhamentoSelecionado);
                                },
                                style: 'btn btn-default'
                            }
                        }
                    }).init();
                };

                var abrirModalRetirarDaFila = function (encaminhamentoSelecionado, callback) {
                    msModalService.setOptions({
                        title: $filter('translate')('aviso'),
                        content: $filter('translate')('MC037'),
                        buttons: {
                            'Sim': {
                                name: 'Sim',
                                ngClick: function () {
                                    alterarEncaminhamento(encaminhamentoSelecionado);
                                    msModalService.close();
                                    if (callback) {
                                        callback(ALTERADO);
                                    }
                                },
                                style: 'btn btn-primary'
                            },
                            'Nao': {
                                name: 'Cancelar',
                                ngClick: function () {
                                    msModalService.close();
                                    cancelarAlterarEncaminhamento(encaminhamentoSelecionado);
                                },
                                style: 'btn btn-default'
                            }
                        }
                    }).init();
                };

                var abrirModalUltimaProvidencia = function (encaminhamentoSelecionado) {
                    msModalService.setOptions({
                        title: $filter('translate')('aviso'),
                        content: $filter('translate')('MC038'),
                        buttons: {
                            'Sim': {
                                name: 'Sim',
                                ngClick: function () {
                                    msModalService.close();
                                    verificarAprovacao(encaminhamentoSelecionado, function (acao) {
                                        if (acao == NAO_ALTERADO) {
                                            alterarEncaminhamento(encaminhamentoSelecionado);
                                        }
                                    });
                                },
                                style: 'btn btn-primary'
                            },
                            'Nao': {
                                name: 'Cancelar',
                                ngClick: function () {
                                    msModalService.close();
                                    cancelarAlterarEncaminhamento(encaminhamentoSelecionado);
                                },
                                style: 'btn btn-default'
                            }
                        }
                    }).init();
                };

                var visualizarCampoSolicitarResposta = function (encaminhamentoSelecionado, node) {
                    if (encaminhamentoSelecionado.tipoEncaminhamento == PROVIDENCIA) {

                        node.node.solicitaResposta = SIM;
                        encaminhamentoSelecionado.solicitaResposta = SIM;

                    } else if (encaminhamentoSelecionado.tipoEncaminhamento == CONHECIMENTO) {
                        node.node.solicitaResposta = NAO;
                    }
                };

                var isEditado = function (encaminhamentoSelecionado) {
                    encaminhamentoSelecionado.isEditado = true;
                };

                var alterarEncaminhamento = function (encaminhamentoSelecionado) {
                    var node = arvoreUtils.getNodeAtual(encaminhamentoSelecionado, $scope);
                    node.node.tipoEncaminhamento = encaminhamentoSelecionado.tipoEncaminhamento;
                    visualizarCampoSolicitarResposta(encaminhamentoSelecionado, node);

                    if (encaminhamentoSelecionado.id) {
                        isEditado(encaminhamentoSelecionado);
                    }
                };

                var cancelarAlterarEncaminhamento = function (encaminhamentoSelecionado) {

                    var node = arvoreUtils.getNodeAtual(encaminhamentoSelecionado, $scope);

                    if (encaminhamentoSelecionado.tipoEncaminhamento == PROVIDENCIA) {
                        node.node.tipoEncaminhamento = CONHECIMENTO;
                    } else {
                        node.node.tipoEncaminhamento = PROVIDENCIA;
                    }
                };

                var atualizaStatusPossuiAcessoInternet = function(resposta){
                    $scope.filtro.possuiAcesso = resposta.resultado;
                    if (resposta.resultado) {
                        $scope.acesso = $filter('translate')('sim');
                    } else {
                        $scope.acesso = $filter('translate')('nao');
                    }
                };

                var recuperarRedeDestino = function (id) {
                    comumService.iniciarTelaDeAguarde($rootScope);
                    manterRedeService
                        .buscarRede(id)
                        .then(function (resposta) {
                            comumService.fecharTelaDeAguarde($rootScope);
                            $scope.filtro.redeDestino = resposta.resultado;
                            $scope.nomeOuvidoria = (!$scope.filtro.redeDestino.isSubRede) ? $scope.filtro.redeDestino.ouvidoria.nome : $scope.filtro.redeDestino.subrede.nome;
                            verificaSePossuiAcessoInternet($scope.filtro.redeDestino.id, atualizaStatusPossuiAcessoInternet(resposta));
                        },function(error){
                            comumService.fecharTelaDeAguarde($rootScope);
                        });
                };

                $scope.calcularDataLimitePrazoDaDemanda = function () {

                    $scope.isPrazoSelecionado = false;
                    $scope.filtro.prazoResposta = undefined;
                    $scope.CONFIG.OPEN_DATE_PICKET = false;

                    var quantidadeDias_QDP = undefined;

                    if ($scope.prazoDemanda && $scope.prazoDemanda.tipoConfiguracaoPrazo == PRAZO_UNICO) {
                        // prazo unico
                        quantidadeDias_QDP = $scope.prazoDemanda.qtdDiasPrioridadePrazoUnico;

                    } else if (!$scope.filtro.tipoPrioridade) {
                        // demanda ainda nao tramitada
                        return;

                    } else if ($scope.filtro.tipoPrioridade == PIORIDADE_ALTA) {
                        quantidadeDias_QDP = $scope.prazoDemanda.qtdDiasPrioridadeAlta;

                    } else if ($scope.filtro.tipoPrioridade == PIORIDADE_MEDIA) {
                        quantidadeDias_QDP = $scope.prazoDemanda.qtdDiasPrioridadeMedia;

                    } else if ($scope.filtro.tipoPrioridade == PIORIDADE_BAIXA) {
                        quantidadeDias_QDP = $scope.prazoDemanda.qtdDiasPrioridadeBaixa;

                    } else if ($scope.filtro.tipoPrioridade == PIORIDADE_URGENTE) {
                        quantidadeDias_QDP = $scope.prazoDemanda.qtdDiasPrioridadeUrgente;
                    }

                    var dataAtual_DA = new Date();
                    var PL = dataAtual_DA.setDate(dataAtual_DA.getDate() + quantidadeDias_QDP);

                    $scope.CONFIG.MIN_DATE = new Date();
                    $scope.CONFIG.MAX_DATE = PL;

                    if ($scope.prazoDemanda.tipoConfiguracaoPrazo == PRAZO_UNICO
                        && $scope.prazoDemanda.calendarioEditavel == NAO) {
                        $scope.filtro.prazoResposta = PL;
                    }
                };

                $scope.openDatePicker = function ($event) {
                    if ($scope.CONFIG.OPEN_DATE_PICKET) {
                        $scope.CONFIG.OPEN_DATE_PICKET = false;
                        return;
                    }

                    $event.preventDefault();
                    $event.stopPropagation();
                    $scope.CONFIG.OPEN_DATE_PICKET = true;
                };

                $scope.downloadArquivo = function (arquivo) {
                    comumService.downloadBlobFromBase64(arquivo);
                };

                $scope.abrirModalLocaisEncaminhamento = function () {
                    modalLocaisEncaminhamento.abrir($scope.redes, $scope.subRedes, $scope.filtroRedeDestino, function (rede) {
                        $scope.filtro.redeDestino = rede;
                        $scope.nomeOuvidoria = (!rede.isSubRede) ? rede.ouvidoria.nome : rede.subrede.nome;
                        verificaSePossuiAcessoInternet($scope.filtro.redeDestino.id, function (resp){atualizaStatusPossuiAcessoInternet(resp)});
                    });
                };

                $scope.abrirModalReaproveitarAnexo = function () {
                    modalReaproveitarAnexo.abrir($scope.demanda.id, function (arquivosReaproveitados) {
                        $.merge($scope.filtro.arquivos, arquivosReaproveitados);
                    });
                };

                $scope.abrirModalHistoricoDeTramite = function () {
                    modalHistoricoDeTramite.abrir($scope.demanda);
                };

                $scope.removerArquivoAnexados = function (file) {
                    var index = $scope.filtro.arquivos.indexOf(file);
                    $scope.filtro.arquivos.splice(index, 1);
                    $scope.tamanhoUtilizado -= file.tamanho;
                };

                $scope.showAnexarArquivos = function () {
                    if (!$scope.tamanhoUtilizado) {
                        encaminhamentoDemandaService.totalArquivoAnexoAtendimento($scope.demanda.id)
                            .then(function (resposta) {
                                $scope.tamanhoUtilizado = resposta.resultado;
                            });
                    }
                };

                $scope.addFileEncaminhamento = function ($files) {
                    if ($files[0]) {
                        if ($scope.acao == 'A') {
                            formatarArquivo($files[0]);
                        } else {
                            $scope.arquivoTemporario = $files[0];
                        }
                    }
                };

                $scope.salvarArquivo = function () {
                    if ($scope.arquivoTemporario) {

                        var tamanhoUtilizado = $scope.tamanhoUtilizado + $scope.arquivoTemporario.size;

                        arquivosUtils.formatarArquivo($scope.arquivoTemporario,
                            $scope.filtro.arquivos, tamanhoUtilizado, function (sucesso) {

                                $rootScope.$msNotify.close();

                                $scope.tamanhoUtilizado = tamanhoUtilizado;

                                $scope.arquivoTemporario = undefined;
                                document.querySelector('#file-input').value = '';

                                $scope.filtro.arquivos.push(sucesso.data.resultado);

                            }, function (error) {

                                $rootScope.$msNotify.close();
                                comumService.enviaMensagemSobreCampo('file-input', error.data.mensagem);
                            });
                    }
                };

                $scope.getTotalArquivoUtilizado = function () {
                    var total = 0;

                    $scope.filtro.arquivos.forEach(function (arquivo) {
                        if (arquivo.tamanho) {
                            total += arquivo.tamanho;
                        }
                    });

                    return $filter('translate')('total-utilizado') + ': ' + comumService.byteToMega(total);
                };

                $scope.compartilharArquivos = function (arquivo) {
                    msModalService.setOptions({
                        title: $filter('translate')('MH177'),
                        content: $filter('translate')('MC023'),
                        buttons: {
                            'Sim': {
                                name: 'Sim',
                                ngClick: function () {
                                    msModalService.close();
                                    compartilhar(arquivo);
                                },
                                style: 'btn btn-primary'
                            },
                            'Nao': {
                                name: 'Cancelar',
                                ngClick: function () {
                                    msModalService.close();
                                },
                                style: 'btn btn-default'
                            }
                        }
                    }).init();
                };

                $scope.getUrlDownload = function (idArquivo) {
                    return '/' + ResourcesService.resourceUrls.comum + '/arquivo/' + idArquivo;
                };

                $scope.removeEncaminhamento = function (nodeSelecionado) {
                    $scope.arvore = arvoreUtils.removeEncaminhamento($scope, nodeSelecionado);

                    var empty = arvoreUtils.isEmpty($scope);

                    if (empty) {
                        $scope.demanda.encaminhamentosDemanda = [];
                        $scope.visualizarEncamihamentos = false;
                    }

                    $scope.nodeSelecionado = undefined;
                };

                $scope.emAnalise = function () {
                    encaminhamentoDemandaService.emAnalise($scope.demanda.id).then(function (resposta) {
                        $scope.$msAlert.success(resposta.mensagens, false);
                        goToAchor();
                    });
                };

                $scope.gerarDocumentoEncaminhamento = function (encaminhamento) {
                    modalEncaminhamentoRedeSemAcesso.abrir(encaminhamento, $scope.demanda, function (retorno) {

                    });
                };

                $scope.removerArquivo = function (arquivo) {
                    var index = $scope.nodeSelecionado.node.arquivos.indexOf(arquivo);
                    $scope.nodeSelecionado.node.arquivos.splice(index, 1);
                };

                $scope.adicionarEncaminhamento = function () {
                    $scope.$msAlert.clear();

                    $validator.validate($scope).success(function () {

                        var parametros = {
                            demanda: {id: $scope.demanda.id},
                            redeDestino: $scope.filtro.redeDestino,
                            origem: $scope.origem,
                            encaminhamentos: $scope.demanda.encaminhamentosDemanda
                        };

                        tramiteValidador.validarEncaminhamento(parametros, $scope.arvore, function (resultado) {
                            modalEncaminharDemanda.abrir($scope, function (encaminhamento) {
                                if (encaminhamento) {
                                    criarArvore(encaminhamento);
                                    bloquearCalendario();
                                    tramiteValidador.verificarSegundoEncaminhamento($scope.demanda.encaminhamentosDemanda);
                                }
                            });
                        }, function (resultado) {
                            callbackErrorMessage(resultado);
                        });
                    });
                };

                $scope.selecionarEncaminahmento = function ($event) {

                    comumService.limpaMensagensDeObrigatoriedadePorIds(['mensagemNaoAprovacao']);

                    var currentScope = angular.element($event.target).scope();

                    if (isAutorizadoVisualizar(currentScope.node)) {
                        $rootScope.$msNotify.loading();

                        if ($scope.nodeSelecionado) {
                            $scope.nodeSelecionado.ativo = false;
                        }

                        $scope.nodeSelecionado = currentScope.node;
                        $scope.nodeSelecionado.ativo = true;

                        if (!$scope.nodeSelecionado.node.arquivos) {
                            listarArquivos($scope.nodeSelecionado.node);
                        }

                        tramiteValidador.isAprovadoPeloGestor($scope.nodeSelecionado);

                        if ($scope.nodeSelecionado.node.possuiAcesso == undefined) {
                            verificaSePossuiAcessoInternet($scope.nodeSelecionado.node.redeDestino.id, function (resposta) {
                                $scope.nodeSelecionado.node.possuiAcesso = resposta.resultado;
                                $rootScope.$msNotify.close();
                            });
                        } else {
                            $rootScope.$msNotify.close();
                        }
                    }
                };

                $scope.salvarEncaminhamento = function () {

                    var parametros = {
                        demanda: {
                            id: $scope.demanda.id,
                            dataLimite: ($scope.demanda.dataLimiteDemanda != $scope.filtro.prazoResposta) ? $scope.filtro.prazoResposta : undefined,
                            prioridade: ($scope.demanda.prioridade && $scope.demanda.prioridade.id != $scope.filtro.tipoPrioridade) ? undefined : {id: $scope.filtro.tipoPrioridade}
                        },
                        encaminhamentoDemanda: arvoreUtils.getParametros($scope)
                    };

                    tramiteValidador.validarSalvarEncaminhamento(parametros, $scope.arvore, function (resultado) {
                        encaminhamentoDemandaService.salvar(parametros)
                            .then(function (resultado) {
                                recuperarEncaminhamentos();
                                $scope.bloquearCamposDepoisDeSalvar = true;
                                goToAchor();
                                $scope.$msAlert.success($filter('translate')('MS014'), false);
                            }, function (resultado) {
                                $scope.$msAlert.error(resultado.data.mensagens, true);
                            });
                    }, function (resultado) {
                        callbackErrorMessage(resultado);
                    });
                };

                $scope.alterarTipoEncaminhamento = function (encaminhamentoSelecionado) {

                    if (encaminhamentoSelecionado.id) {

                        if (encaminhamentoSelecionado.tipoEncaminhamento == PROVIDENCIA) {

                            if (tramiteValidador.verificarSeJaExisteUmaProvidencia($scope, encaminhamentoSelecionado.id)) {

                                abrirModalJaExisteProvidencia(encaminhamentoSelecionado);
                            } else {

                                alterarEncaminhamento(encaminhamentoSelecionado);
                            }

                        } else if (encaminhamentoSelecionado.tipoEncaminhamento == CONHECIMENTO) {

                            if (!tramiteValidador.verificarSeJaExisteUmaProvidencia($scope, encaminhamentoSelecionado.id)) {

                                abrirModalUltimaProvidencia(encaminhamentoSelecionado);

                            } else {

                                verificarAprovacao(encaminhamentoSelecionado, function (acao) {
                                    if (acao == NAO_ALTERADO) {
                                        alterarEncaminhamento(encaminhamentoSelecionado);
                                    }
                                });
                            }
                        }

                    } else {
                        alterarEncaminhamento(encaminhamentoSelecionado);
                    }
                };

                $scope.alterarSolicitacaoResposta = function (encaminhamentoSelecionado) {

                    var node = arvoreUtils.getNodeAtual(encaminhamentoSelecionado, $scope);

                    if (encaminhamentoSelecionado.tipoEncaminhamento == PROVIDENCIA) {

                        if (encaminhamentoSelecionado.id && encaminhamentoSelecionado.solicitaResposta == SIM) {
                            msModalService.setOptions({
                                title: $filter('translate')('aviso'),
                                content: $filter('translate')('MC036'),
                                buttons: {
                                    'Sim': {
                                        name: 'Sim',
                                        ngClick: function () {
                                            node.node.solicitaResposta = NAO;
                                            encaminhamentoSelecionado.solicitaResposta = NAO;
                                            msModalService.close();
                                        },
                                        style: 'btn btn-primary'
                                    },
                                    'Nao': {
                                        name: 'Cancelar',
                                        ngClick: function () {
                                            msModalService.close();
                                        },
                                        style: 'btn btn-default'
                                    }
                                }
                            }).init();
                        } else {
                            node.node.solicitaResposta = SIM;
                            encaminhamentoSelecionado.solicitaResposta = SIM;
                        }
                    }

                    if (encaminhamentoSelecionado.id) {
                        isEditado(encaminhamentoSelecionado);
                    }
                };

                $scope.removerArquivoAnalisar = function (arquivo) {
                    angular.forEach($scope.demanda.arquivos, function (file, index) {
                        if (file.nomeArquivo === arquivo.nomeArquivo) {
                            $rootScope.$msNotify.loading();
                            demandaService.apagarArquivo(arquivo.id, $scope.demanda.id).then(function () {
                                $rootScope.$msNotify.close();
                                $scope.demanda.arquivos.splice(index, 1);
                            });
                        }
                    });
                };

                $scope.mostrarModalDemanda = function () {
                    var rede = comumService.getRedeAutenticada();
                    modalRegistrarDemanda.abrir($scope.demanda.atendimento, $scope.demanda, rede.id, 'VISUALIZAR', function () {});
                };

                $scope.emAnaliseAnalisarDemanda = function () {
                    demandaService.salvarRascunhoComplementoDemanda($scope.demanda)
                        .then(function (result) {
                            goToAchor();
                            $scope.$msAlert.success($filter('translate')('MI152'), true);
                            $scope.demanda = result.resultado;
                        },function (error) {
                            goToAchor();
                            $scope.$msAlert.error(error.data.mensagens);
                        });
                };

                $scope.fecharDemanda = function () {
                    comumService.limpaMensagensDeObrigatoriedadePorIds(['parecerDemandaAnalise']);

                    $validator.validate($scope).success(function () {
                        $scope.prepararEmailFecharDemanda();
                    })
                };

                $scope.prepararEmailFecharDemanda = function () {
                    demandaService.prepararEmailFecharDemanda($scope.demanda).then(function (result) {
                        $scope.corpoEmail = result.resultado;
                        if ($scope.corpoEmail) {
                            modalPreviaEmailFecharDemanda.abrir($scope.demanda, $scope.corpoEmail, $scope.arquivos, $scope);
                        } else {
                            $scope.demanda.arquivos = $scope.arquivos;
                            demandaService.fecharDemanda($scope.demanda).then(function (result) {
                                $scope.$msAlert.success($filter('translate')('MI175'));
                                $scope.cancelar();
                            }, function (reason) {
                                $scope.$msAlert.error(reason.data.mensagens);
                            });

                        }
                    });
                };

                $scope.cancelar = function () {
                    $state.go('registrar-atendimento', {p: $stateParams.protocolo});
                };

                $scope.recuperarTipificacoes = function () {
                    tratarDemandaService
                        .recuperarTipificacoes($scope.demanda.id)
                        .then(function (resposta) {
                            $scope.tipificacaoDemanda = tramiteUtils.montarTipificacaoInLine(resposta);
                        });
                };

                $scope.cancelarAnalisarDemanda = function () {
                    msModalService.setOptions({
                        title: $filter('translate')('MH057'),
                        content: $filter('translate')('MC013'),
                        buttons: {
                            'Sim': {
                                name: 'Sim',
                                ngClick: function () {
                                    $scope.cancelar();
                                    msModalService.close();
                                },
                                style: 'btn btn-primary'
                            },
                            'Nao': {
                                name: 'Cancelar',
                                ngClick: function () {
                                    msModalService.close();
                                },
                                style: 'btn btn-default'
                            }
                        }
                    }).init();
                };

                $scope.responder = function (encaminhamento) {
                    $state.transitionTo('fechar-demanda', {'idDemanda': encaminhamento.demanda.id});
                };

                var init = function () {
                    $scope.PIORIDADES_ENUM = TramiteEnum.PIORIDADES_ENUM;
                    $scope.filtro = {arquivos: []};
                    $scope.acao = ENCAMINHAMENTO;
                    $scope.bloquear = {acao:{reencaminhamento:false}};
                    $scope.bloquearEncaminhamento = false;
                    $scope.visualizarAnexarArquivo = false;
                    $scope.bloquearBotaoSalvar = false;
                    $scope.bloquearCamposDepoisDeSalvar = false;
                    $scope.showCampoPrioridade = true;
                    $scope.esferas = [];
                    $scope.tipos = [];
                    $scope.niveis = [];
                    $scope.ufs = [];
                    $scope.municipios = [];
                    $scope.filtroRedeDestino = {};
                    $scope.exibeOpcaoAnalisar = false;

                    bloquearCalendario();
                    recuperarDados();
                    if ($stateParams.idRedeDestino) {
                        $scope.bloquear.acao.reencaminhamento = true;
                        recuperarRedeDestino($stateParams.idRedeDestino);
                    }
                };

                init();
            }
        ]);

    return app;
});
