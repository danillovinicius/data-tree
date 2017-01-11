/*global define, angular, Map*/
define(['app', 'angularTreeview'], function (app) {

    "use strict";

    app.controller('responderFecharDemandaController', ['$scope', '$rootScope', '$state', '$filter', '$upload', '$location', '$anchorScroll', '$stateParams', 'demandaService', 'ResourcesService', 'comumService', 'msModalService', 'encaminhamentoDemandaService', 'arquivosUtils', 'modalHistoricoDeTramite', 'arvoreUtils', 'tratarDemandaService', 'EscopoCompartilhadoService', 'subRedeService', 'modalPreviaEmailController', 'modalConfirmacaoController', '$validator', 'modalConfirmacaoEncaminhamentoPendenteRespostaController', 'pesquisaSatisfacaoService', '$q',
        function ($scope, $rootScope, $state, $filter, $upload, $location, $anchorScroll, $stateParams, demandaService, ResourcesService, comumService, msModalService, encaminhamentoDemandaService, arquivosUtils, modalHistoricoDeTramite, arvoreUtils, tratarDemandaService, EscopoCompartilhadoService, subRedeService, modalPreviaEmailController, modalConfirmacaoController, $validator, modalConfirmacaoEncaminhamentoPendenteRespostaController, pesquisaSatisfacaoService, $q) {

            $scope.habilitarComentarioParecer = false;
            $scope.tratarEncaminhamento = undefined;
            $scope.visualizarAnexarArquivo = false;
            $scope.arquivos = [];
            $scope.arquivosEmails = [];
            $scope.tamanhoUtilizado = 0;
            $scope.demanda = {encaminhamentosDemanda: []};
            $scope.arquivoTemporario = undefined;
            $scope.nodesSelecionados = [];
            $scope.exibirResposta = false;
            $scope.exibirAceitar = false;
            $scope.nivelSubRede = 2;
            $scope.rede = {};
            $scope.status_aberto = true;
            var mensagemAcao = undefined;
            var obterPesquisaInternaExterna;

            var STATUS_ENCAMINHAMENTO = {
                ENCAMINHADO: 1,
                REENCAMINHADO: 2,
                EM_ANALISE: 3,
                DEVOLVIDO: 4,
                RESPONDIDO: 5,
                CONCLUIDO: 6
            };

            var carregarTituloPagina = function () {
                if ($state.current.name == 'fechar-demanda') {
                    $scope.tituloPagina = 'Fechar Demanda';
                } else {
                    $scope.tituloPagina = 'Responder Encaminhamento Demanda';
                }
            };

            $scope.init = function () {
                carregarTituloPagina();
                carregarDados();
                verificarPerfilNivelTres();
                $scope.rede = comumService.getRedeAutenticada();
            };

            var goToAchor = function () {
                $location.hash('anchor');
                $anchorScroll();
            };

            var callbackErrorMessage = function (resultado) {
                fecharTelaDeAguarde();
                var mensagem = resultado.data ? resultado.data.mensagens : resultado;
                $scope.$msAlert.error(mensagem, true);
            };

            var carregarDados = function () {
                $rootScope.$msNotify.close();
                comumService.iniciarTelaDeAguarde($rootScope);
                encaminhamentoDemandaService.pesquisarPelaDemanda($stateParams.idDemanda).then(function (resposta) {
                    fecharTelaDeAguarde();
                    var contemEncaminhamento = resposta.resultado[0] && resposta.resultado[0][0];
                    if (contemEncaminhamento) {
                        $scope.status_aberto = resposta.resultado[0][0].demanda.statusDemanda.id != STATUS_ENCAMINHAMENTO.CONCLUIDO;
                        montarArvore(resposta.resultado);
                        consultarArquivosFechamentoDemanda();
                    } else {
                        $state.go("registrar-atendimento");
                    }
                }, function (resposta) {
                    callbackErrorMessage(resposta);
                });
            };

            var montarEncaminhamentos = function (encaminhamentos) {
                $scope.demanda.encaminhamentosDemanda = encaminhamentos;
                arvoreUtils.modificarEstruturaSeHouveSubRede($scope.demanda.encaminhamentosDemanda);
            };

            var montarArvore = function (encaminhamentos) {
                $scope.demanda.encaminhamentosDemanda = [];
                montarEncaminhamentos(encaminhamentos);
                $scope.origem = encaminhamentos[0][0];
                $scope.redeOrigem = ($scope.origem) ? $scope.origem.redeOrigem : undefined;
                $scope.arvore = arvoreUtils.montarArvoreEncaminhamento($scope);
                arvoreUtils.selecionarNodeAtual($scope);

                if(!$scope.exibirOpcoesRedeOrigem()){
                    if(removerEncaminhamentoInativadoRedeDestino()){
                        return;
                    }
                }

                montarHistorico();
                definirAcoesNodes($scope.arvore);
                $scope.visualizarEncamihamentos = true;
            };

            var verificarPerfilNivelTres = function () {
                var usuarioAutenticado = $rootScope.usuarioAutenticado;

                if (usuarioAutenticado.perfil.sigla == 'TECS') {
                    var codigoSubRede = usuarioAutenticado.esfera.configuracao.split('/');
                    if (codigoSubRede.length == 4) {
                        subRedeService.verificarNivelSubRede(codigoSubRede[3]).then(function (resposta) {
                            $scope.nivelSubRede = resposta.resultado;
                        });
                    }
                }
            };

            var montarHistorico = function () {
                $scope.nodeSelecionado.historicos = [];
                encaminhamentoDemandaService
                    .listarHistoricoEncaminhamentos({'id': $scope.nodeSelecionado.node.id})
                    .then(function (resposta) {
                        $scope.nodeSelecionado.historicos = resposta.resultado;
                        posicionarHistorico();
                    });
            };

            $scope.getTamanhoDoBloco = function (conteudo) {
                if (conteudo && conteudo.length > 250) {
                    return conteudo.substring(0, 250);
                }
                return conteudo;
            };

            var posicionarHistorico = function () {
                var indice = 0;
                $scope.valor = 0;
                $scope.primeiraResposta = 0;
                $scope.tipoUltimoHistorico;

                angular.forEach($scope.nodeSelecionado.historicos, function (historico) {
                    definirEspacamento(historico, indice);
                    indice++;
                });
            };

            var definirEspacamento = function (historico, indice) {
                var css = 'margin-left:';

                if (historico.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.ENCAMINHADO || historico.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.REENCAMINHADO) {
                    if (indice > 0) {
                        $scope.valor += 3;
                    }
                    $scope.tipoUltimoHistorico = historico.tipoEncaminhamento;
                } else if (
                    historico.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.RESPONDIDO || historico.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.DEVOLVIDO) {

                    if ($scope.tipoUltimoHistorico && $scope.tipoUltimoHistorico == 'C') {
                        $scope.valor -= 3;
                    } else if ($scope.valor > 0 && $scope.primeiraResposta > 0) {
                        $scope.valor -= 3;
                    }
                    $scope.primeiraResposta++;
                }

                historico.style = css + $scope.valor + '%';
            };

            var isAutorizadoVisualizar = function (encaminhamento) {
                if (encaminhamento.nivel == 0) {
                    return false;
                }
                return encaminhamento.node.visualizarNivel;
            };

            $scope.downloadArquivo = function (arquivo) {
                comumService.downloadBlobFromBase64(arquivo);
            };

            $scope.abrirModalHistoricoDeTramite = function () {
                modalHistoricoDeTramite.abrir($scope.nodeSelecionado.node.demanda);
            };

            $scope.selecionarEncaminhamento = function ($event) {

                var currentScope = angular.element($event.target).scope();

                if (isAutorizadoVisualizar(currentScope.node)) {

                    $rootScope.$msNotify.loading();

                    if ($scope.nodeSelecionado) {
                        $scope.nodeSelecionado.ativo = false;
                    }

                    $scope.nodeSelecionado = currentScope.node;
                    $scope.nodeSelecionado.ativo = true;
                    montarHistorico();
                }
            };

            $scope.getUrlDownload = function (idArquivo) {
                return '/' + ResourcesService.resourceUrls.comum + '/arquivo/' + idArquivo;
            };

            $scope.alterarSolicitarResposta = function (encaminhamento) {
                if (encaminhamento.solicitaResposta == 'S') {
                    encaminhamento.solicitaResposta = 'N';
                } else {
                    encaminhamento.solicitaResposta = 'S';
                }
            };

            var contarQuantidadeProvidencia = function (filhos) {
                var quantidadeProvidencia = 0;
                angular.forEach(filhos, function (elem) {
                    if (elem.node.tipoEncaminhamento == 'P') {
                        quantidadeProvidencia++;
                    }
                });
                return quantidadeProvidencia;
            };

            var definirAcoesNodes = function (nodes) {
                angular.forEach(nodes, function (elem) {
                    if (elem.children.length > 0) {
                        var quantidadeProvidencia = contarQuantidadeProvidencia(elem.children);
                        if (quantidadeProvidencia > 0) {
                            elem.aceitar = true;
                        } else {
                            elem.responder = true;
                        }
                        definirAcoesNodes(elem.children);
                    } else {
                        if (elem.node.tipoEncaminhamento == 'P') {
                            elem.responder = true;
                        }
                    }
                });
            };

            $scope.exibirOpcoesRedeOrigem = function () {
                if ($scope.redeOrigem) {
                    return $scope.redeOrigem.id == $scope.rede.id && $scope.nodeSelecionado.node.tipoEncaminhamento != 'C';
                }
                return false;
            };

            $scope.devolver = function () {
                mensagemAcao = $filter('translate')('MS031');
                $scope.habilitarComentarioParecer = true;
                var historico = obterUltimoEncaminhamentoProvidencia();
                var idEncaminhamentoResposta = historico.id;
                var idEncaminhamentoAnterior = historico.id;

                $scope.tratarEncaminhamento = criarEncaminhamentoTratado($scope.nodeSelecionado.node.demanda.id, STATUS_ENCAMINHAMENTO.DEVOLVIDO, idEncaminhamentoResposta, idEncaminhamentoAnterior, 'DEVOLVER');
            };

            $scope.responder = function () {
                mensagemAcao = $filter('translate')('MS031');
                $scope.habilitarComentarioParecer = true;
                var historico = obterUltimoEncaminhamentoProvidencia();
                var idEncaminhamentoResposta = historico.id;
                var idEncaminhamentoAnterior = historico.id;
                $scope.tratarEncaminhamento = criarEncaminhamentoTratado($scope.nodeSelecionado.node.demanda.id, STATUS_ENCAMINHAMENTO.RESPONDIDO, idEncaminhamentoResposta, idEncaminhamentoAnterior, 'RESPONDER');
            };

            $scope.aceitar = function () {
                mensagemAcao = $filter('translate')('MS031');
                $scope.habilitarComentarioParecer = true;
                var historico = obterUltimoEncaminhamentoProvidencia();
                $scope.resposta = historico.comentarioParecer;
                var idEncaminhamentoResposta = historico.id;
                var idEncaminhamentoAnterior = selecionarEncaminhamentoAnterior();

                $scope.tratarEncaminhamento = criarEncaminhamentoTratado($scope.nodeSelecionado.node.demanda.id, STATUS_ENCAMINHAMENTO.RESPONDIDO, idEncaminhamentoAnterior, idEncaminhamentoResposta, 'ACEITAR');
            };

            $scope.fechar = function () {
                $scope.habilitarComentarioParecer = true;
                var historico = obterUltimoEncaminhamentoProvidencia();
                var idEncaminhamentoResposta = historico.id;
                var idEncaminhamentoAnterior = historico.id;

                $scope.tratarEncaminhamento = criarEncaminhamentoTratado($stateParams.idDemanda, STATUS_ENCAMINHAMENTO.CONCLUIDO, idEncaminhamentoAnterior, idEncaminhamentoResposta, 'CONCLUIR');
            };

            $scope.encaminhar = function () {
                var idDemanda = $scope.nodeSelecionado.node.demanda.id;
                $state.go('encaminhar-analisar-demanda', {'idDemanda': idDemanda, 'isOrigem': true});
            };

            $scope.reencaminhar = function () {
                var idDemanda = $scope.nodeSelecionado.node.demanda.id;
                var idRedeDestino = $scope.nodeSelecionado.node.redeDestino.id;

                $state.go('tratar-demanda-tramitada.reencaminhar-demanda', {
                    'idDemanda': idDemanda,
                    'isOrigem': true,
                    'idRedeDestino': idRedeDestino
                });
            };

            var selecionarEncaminhamentoAnterior = function () {
                if ($scope.nodeSelecionado.idEncaminhamentoAnterior) {
                    return $scope.nodeSelecionado.idEncaminhamentoAnterior;
                } else {
                    return $scope.nodeSelecionado.id;
                }
            };

            var criarEncaminhamentoTratado = function (id, idStatusEncaminhamento, idEncaminhamentoResposta, idEncaminhamentoAnterior, acao) {
                return {
                    'idDemanda': id,
                    'idStatusEncaminhamento': idStatusEncaminhamento,
                    'idEncaminhamentoResposta': idEncaminhamentoResposta,
                    'idEncaminhamentoAnterior': idEncaminhamentoAnterior,
                    'tratamentoEnaminhamentoEnum': acao
                };
            };

            $scope.tratarEncaminhamentoDemanda = function () {

                if ($scope.tratarEncaminhamento == undefined) {
                    comumService.exibirMensagemErro($filter('translate')('ME087'), $scope.$msAlert);
                    return;
                }

                $validator.validate($scope).success(function () {
                    var mensagemAcaoRealizada = (mensagemAcao) ? mensagemAcao : $filter('translate')('MS014');
                    $scope.tratarEncaminhamento.comentarioParecer = $scope.resposta;
                    $scope.tratarEncaminhamento.arquivos = $scope.arquivos;

                    encaminhamentoDemandaService
                        .tratarEncaminhamentoDemanda($scope.tratarEncaminhamento)
                        .then(function (resposta) {
                            goToAchor();
                            carregarDados();
                            verificarPerfilNivelTres();
                            $scope.rede = comumService.getRedeAutenticada();
                            $scope.cancelar();
                            comumService.exibirMensagemSucesso(mensagemAcaoRealizada, $scope.$msAlert);
                        }, function (resposta) {
                            callbackErrorMessage(resposta);
                        });
                });
            };

            $scope.reiniciarOpcoesEncaminhamento = function () {
                $scope.habilitarComentarioParecer = false;
                $scope.tratarEncaminhamento = undefined;
                $scope.resposta = '';
            };

            $scope.definirTipoArquivo = function (arquivo) {
                return comumService.definirTipoArquivo(arquivo);
            };

            $scope.emAnaliseResponderEncaminhamentoDemanda = function () {
                var ultimoEncaminhamento = obterUltimoEncaminhamentoProvidencia();
                encaminhamentoDemandaService.adicionarEncaminhamentoEmAnalise(ultimoEncaminhamento.id).then(function (result) {
                    goToAchor();
                    if ($scope.exibirOpcoesRedeOrigem()) {
                        comumService.exibirMensagemSucesso($filter('translate')('MS027'), $scope.$msAlert);
                    } else {
                        comumService.exibirMensagemSucesso($filter('translate')('MI152'), $scope.$msAlert);
                    }
                }, function (resposta) {
                    callbackErrorMessage(resposta);
                });
            };

            $scope.emAnaliseFecharDemanda = function () {
                var demanda = {'id': $stateParams.idDemanda};
                demandaService.adicionarDemandaEmAnalise(demanda).then(function (resposta) {
                    goToAchor();
                    comumService.exibirMensagemSucesso($filter('translate')('MS027'), $scope.$msAlert);
                });
            };

            $scope.cancelar = function () {
                $scope.tratarEncaminhamento = undefined;
                $scope.resposta = '';
                $scope.habilitarComentarioParecer = false;
                $scope.arquivos = [];
                $scope.arquivoTemporario = undefined;
                document.querySelector('#file-input').value = '';
                $scope.tamanhoUtilizado = 0;
                $scope.visualizarAnexarArquivo = false;
                $scope.mensagemAcao = undefined;
                $validator.reset($scope);
            };

            $scope.addFileEncaminhamento = function ($files) {
                if ($files[0]) {
                    $scope.arquivoTemporario = $files[0];
                }
            };

            $scope.anexarArquivo = function () {
                $scope.$msAlert.clear();

                if ($scope.arquivoTemporario && $scope.arquivoTemporario[0]) {
                    var arquivo = $scope.arquivoTemporario[0];
                    validarExtensao(arquivo);
                    validarTamanhoArquivosUtilizados($scope.tamanhoUtilizado, arquivo.size);
                    validaTamanhoMaximoArquivo(arquivo);

                    uploadFile(arquivo, $scope.arquivos).then(function (resposta) {
                        $rootScope.$msNotify.close();
                        $scope.arquivoTemporario = undefined;
                        document.querySelector('#file-input').value = '';
                        $scope.arquivos.push(resposta.data.resultado);
                        $scope.tamanhoUtilizado += resposta.data.resultado.tamanho;
                    });
                }
            };

            var validarTamanhoArquivosUtilizados = function (tamanhoUtilizado, tamanhoArquivo) {
                var tamanhoTotal = tamanhoUtilizado + tamanhoArquivo;
                var TAMANHO_20_MEGAS = 10485760 * 2;
                if (tamanhoTotal > TAMANHO_20_MEGAS) {
                    goToAchor();
                    comumService.exibirMensagemErro($filter('translate')('ME099'), $scope.$msAlert);
                    throw $filter('translate')('ME099');
                }
            };

            var validaTamanhoMaximoArquivo = function (arquivo) {
                if (comumService.arquivoMaior2MB(arquivo)) {
                    goToAchor();
                    comumService.exibirMensagemErro($filter('translate')('ME013'), $scope.$msAlert);
                    throw $filter('translate')('ME013');
                }
            };

            var validarExtensao = function (arquivo) {
                if (!comumService.verificarExtesoesArquivo(arquivo.name)) {
                    goToAchor();
                    comumService.exibirMensagemErro($filter('translate')('ME092'), $scope.$msAlert);
                    throw $filter('translate')('ME092');
                }
            };

            var uploadFile = function (file) {
                var nome = file.name.split(".");
                var extensao = nome[nome.length - 1];
                var arquivo = criarArquivo(file, extensao);
                $rootScope.$msNotify.loading();

                return $upload.upload({url: 'api/encaminhamento-demanda/upload', file: file});
            };

            var criarArquivo = function (file, extensao) {
                return {
                    'extensao': extensao,
                    'decricaoPalavraChave': file.name,
                    'dataUpload': file.lastModifiedDate,
                    'nomeArquivo': file.name,
                    'tamanho': file.size,
                    'tipoArquivo': file.type
                };
            };

            $scope.removerArquivo = function (indice) {
                var arquivo = angular.copy($scope.arquivos[indice]);
                $scope.arquivos.splice(indice, 1);
                $scope.tamanhoUtilizado -= arquivo.tamanho;
            };

            $scope.$watch('resposta', function (newValue, oldValue) {
                if (oldValue) {
                    if (newValue.length == 0) {
                        $scope.cancelar();
                    }
                }
            });

            $scope.visualizarTipificacao = function () {
                var idDemanda = $scope.nodeSelecionado.node.demanda.id;
                var isUsuarioRedeDestino = $scope.rede.id == $scope.nodeSelecionado.node.redeDestino.id;
                $state.go('tratar-demanda', {'idDemanda': idDemanda, 'encaminhado': isUsuarioRedeDestino})
            };

            $scope.desbilitarAcoesTela = function () {
                var rede = comumService.getRedeAutenticada();
                if ($scope.nodeSelecionado) {
                    if ($scope.nodeSelecionado.historicos && $scope.nodeSelecionado.historicos.length > 0) {
                        var historico = obterUltimoEncaminhamentoProvidencia();
                        if (historico) {
                            if (rede.id == historico.redeDestino.id || rede.id == historico.subRedeDestino.id) {
                                return historico.redeDestino.id != $scope.nodeSelecionado.node.redeDestino.id;
                            } else {
                                return historico.redeDestino.id != rede.id || historico.subRedeDestino.id != rede.id;
                            }
                        }
                    }
                }
                return true;
            };

            var obterUltimoEncaminhamentoProvidencia = function () {
                var historico;
                angular.forEach($scope.nodeSelecionado.historicos, function (elem) {
                    if (elem.tipoEncaminhamento == 'P') {
                        historico = elem;
                    }
                });
                return historico;
            };

            var verificarExisteEncaminhamentoRespondido = function () {
                if ($scope.nodeSelecionado) {
                    var encaminhamentosRespondidos = $scope.nodeSelecionado.historicos.filter(function (elem) {
                        return elem.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.RESPONDIDO;
                    });
                    return encaminhamentosRespondidos.length == 0;
                }
                return false;
            };

            /**
             * TODO CORRIGIR
             * alterar RI51.17 para nao apresentar o encaminhamento na tela de consulta
             * ERRO >>> a RI51.17 solicita realizar a remocao do no da arvore
             * após o destino acessar a funcionalidade de responder!
             */
            var removerEncaminhamentoInativadoRedeDestino = function () {
                var rede = comumService.getRedeAutenticada();
                var childrenInativo = false;

                angular.forEach($scope.arvore[0].children, function (children, idx) {
                    if (children.node.ativo == "N"&& children.node.redeDestino.id == rede.id) {
                        childrenInativo = true;
                        delete $scope.arvore[0].children[idx];
                    }
                });

                return childrenInativo;
            };

            var exibeMensagemConfirmacaoInativacao = function(){
                msModalService.setOptions({
                    title: $filter('translate')('aviso'),
                    content: $filter('translate')('MC034'),
                    buttons: {
                        'Sim': {
                            name: 'Sim',
                            ngClick: function () {
                                msModalService.close();
                                ativarInativarEncaminhamento();
                            },
                            style: 'btn btn-primary'
                        },
                        'Nao': {
                            name: 'Não',
                            ngClick: function () {
                                msModalService.close();
                            },
                            style: 'btn btn-default'
                        }
                    }
                }).init();
            };

            var ativarInativarEncaminhamentoDemanda = function () {
                var usuario = $rootScope.usuarioAutenticado;
                var historico = $scope.nodeSelecionado.historicos[$scope.nodeSelecionado.historicos.length - 1];

                var encaminhamentoEmAnalise = historico.statusEncaminhamentoDemanda.id == STATUS_ENCAMINHAMENTO.EM_ANALISE;
                var perfilGestor = usuario.perfil.sigla.startsWith("GEST");

                if (encaminhamentoEmAnalise && perfilGestor) {
                    exibeMensagemConfirmacaoInativacao();
                } else {
                    ativarInativarEncaminhamento();
                }
            };

            $scope.inativarEncaminhamentos = function () {
                var ativo = $scope.nodeSelecionado.node.ativo == 'S';
                if (ativo) {
                    if (verificarExisteEncaminhamentoRespondido()) {
                        ativarInativarEncaminhamentoDemanda();
                    } else {
                        goToAchor();
                        comumService.exibirMensagemErro($filter('translate')('ME095'), $scope.$msAlert);
                    }
                }else {
                    ativarInativarEncaminhamento();
                }
            };

            var ativarInativarEncaminhamento = function () {
                var encaminhamento = {'id': obterIdPrimeiroEncaminhamento()};
                encaminhamentoDemandaService.ativarInativarEncaminhamento(encaminhamento).then(function (resposta) {
                    var novaSituacao = $scope.nodeSelecionado.node.ativo == 'S' ? 'N' : 'S';
                    $scope.nodeSelecionado.node.ativo = novaSituacao;
                });
            };

            var obterIdPrimeiroEncaminhamento = function () {
                if ($scope.nodeSelecionado) {
                    if ($scope.nodeSelecionado.historicos.length > 0) {
                        return $scope.nodeSelecionado.historicos[0].id;
                    }
                }
            };

            $scope.exibirTooltipQuantidadeArquivos = function (historico) {
                return $filter('translate')('MH210', {'parametro': historico.arquivos.length});
            };

            $scope.carregarArquivosDemadaEncaminhamento = function () {
                if ($scope.visualizarAnexarArquivo == true && $scope.arquivos.length == 0) {
                    var idUltimoEncaminhamento = obterIdPrimeiroEncaminhamento();
                    var idDemanda = $scope.nodeSelecionado.node.demanda.id;
                    encaminhamentoDemandaService.carregarArquivosDemadaEncaminhamento(idUltimoEncaminhamento, idDemanda).then(function (resposta) {
                        $scope.arquivos = resposta.resultado;
                        angular.forEach($scope.arquivos, function (elem) {
                            $scope.tamanhoUtilizado += elem.tamanho;
                        });
                    });
                }
            };

            var consultarArquivosFechamentoDemanda = function(){
                if(!$scope.status_aberto){
                    var idDemanda = $scope.nodeSelecionado.node.demanda.id;
                    encaminhamentoDemandaService
                        .carregarArquivosEmailFechamentoDemada(idDemanda)
                        .then(function (resposta) {
                            $scope.arquivosEmails = resposta.resultado;
                        });
                }
            };

            $scope.abrirPreviaEmail = function () {
                var filtro = {
                    idDemanda: $stateParams.idDemanda,
                    rede: $scope.redeOrigem,
                    tipoPesquisa: "I",
                    situacaoPesquisa: {id: 2, descricao: "Ativo"}
                };
                var pesquisa = undefined;
                obterPesquisaInternaExterna(filtro, pesquisa);

                var idUltimoEncaminhamento = obterIdPrimeiroEncaminhamento();
                pesquisaSatisfacaoService.buscarPesquisaAtiva(filtro).then(function(resposta){
                    if(resposta.resultado){
                        pesquisa = resposta.resultado;
                        modalPreviaEmailController.abrir($stateParams.idDemanda, $scope.redeOrigem.id, idUltimoEncaminhamento, function (resposta) {
                            consultarArquivosFechamentoDemanda();
                            var redePossuiPesquisaSatisfacao = !comumService.validaCampoVazio(pesquisa);
                            if (redePossuiPesquisaSatisfacao) {
                                $state.transitionTo('responder-pesquisa', {
                                    id: pesquisa.pesquisaId.id,
                                    versao: pesquisa.pesquisaId.versao,
                                    idRede: $scope.redeOrigem.id,
                                    idDemanda: $stateParams.idDemanda,
                                });
                            } else {
                                goToAchor();
                                comumService.exibirMensagemSucesso($filter('translate')('MS027'), $scope.$msAlert);
                            }
                        });
                    }
                },function(erro){
                    if (erro.data.mensagens) {
                        $scope.$msAlert.error(erro.data.mensagens, false);
                    }
                });


            };

            var gerarEncaminhamentoFechamentoDemanda = function () {
                $scope.tratarEncaminhamento.comentarioParecer = $scope.resposta;
                $scope.tratarEncaminhamento.arquivos = $scope.arquivos;

                comumService.iniciarTelaDeAguarde($rootScope);
                encaminhamentoDemandaService
                    .tratarEncaminhamentoDemanda($scope.tratarEncaminhamento)
                    .then(function (resposta) {
                        fecharTelaDeAguarde();
                        fecharDemandaAtualizarSituacaoRespostaEncaminhamento();
                    }, function (resposta) {
                        callbackErrorMessage(resposta);
                    });
            };

            var fecharDemandaAtualizarSituacaoRespostaEncaminhamento = function () {
                comumService.iniciarTelaDeAguarde($rootScope);

                var validador = arvoreUtils.processarStatusArvore($scope.arvore);
                var tratarDemanda = {
                    demanda: {
                        id: $stateParams.idDemanda,
                        parecerFechamentoDemanda: $scope.resposta
                    },
                    encaminhamentoDemanda: validador.tipo_encaminhamento.pendentes_resposta
                };

                encaminhamentoDemandaService.fecharDemandaAtualizarSituacaoRespostaEncaminhamento(tratarDemanda)
                    .then(function (resultado) {
                        fecharTelaDeAguarde();
                        $scope.init();
                        $scope.cancelar();
                        modalConfirmacaoController.abrir(function () {
                            $scope.abrirPreviaEmail();
                        });
                    }, function (resposta) {
                        callbackErrorMessage(resposta);
                    });
            };

            $scope.salvarFechamentoDemanda = function () {
                $validator.validate($scope).success(function () {
                    var validador = arvoreUtils.processarStatusArvore($scope.arvore);
                    if (validador.tipo_encaminhamento.qt_pendente_resposta > 0) {
                        modalConfirmacaoEncaminhamentoPendenteRespostaController.abrir(function () {
                            gerarEncaminhamentoFechamentoDemanda();
                        });
                    } else {
                        gerarEncaminhamentoFechamentoDemanda();
                    }
                });
            };

            obterPesquisaInternaExterna = function (filtro, pesquisa){
                filtro.situacaoPesquisa = {id: 2, descricao: "Ativo"};
                pesquisaSatisfacaoService.buscarPesquisaAtiva(filtro).then(function(resposta){
                    if(resposta.resultado){
                        pesquisa = resposta.resultado;
                    }
                });
            };

            function fecharTelaDeAguarde() {
                comumService.fecharTelaDeAguarde($rootScope);
            }
        }
    ]);

    return app;
});
