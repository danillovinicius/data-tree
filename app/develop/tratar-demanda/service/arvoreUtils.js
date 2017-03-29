define(['app'], function (app) {

        'use strict';

        app.service('arvoreUtils', ['comumService', '$rootScope',
            function (comumService, $rootScope) {

                var isAprovadoPeloGestor = function (enc) {
                    return enc.situacaoAprovacaoGestor && enc.situacaoAprovacaoGestor.id == 3;
                };

                var isAguardandoAprovacao = function (enc) {
                    return enc.situacaoAprovacaoGestor && enc.situacaoAprovacaoGestor.id == 1
                };

                var isRedeAtual = function (rede, nivel, $scope) {

                    var redeSelecionada = comumService.getRedeAutenticada();

                    if(rede){
                        if (redeSelecionada.id == rede.id ) {
                            $scope.nivelRedeUsuario = nivel;
                            return true;
                        }
                    }

                    return false;
                };

                var isOrigem = function (encaminhamento) {
                    return encaminhamento.length == 1 && encaminhamento[0].temporario;
                };

                var isRepondido = function (encaminhamento){
                    var ID_STATUS_RESPONDIDO = 5;
                    return encaminhamento.statusEncaminhamentoDemanda.id == ID_STATUS_RESPONDIDO;
                };

                this.montarArvoreEncaminhamento = function ($scope) {

                    var arvore = [{
                        node: $scope.origem,
                        treeId: 'root',
                        label: $scope.origem.redeOrigem.ouvidoria.nome,
                        isAprovado: false,
                        isAguardandoAprovacao: false,
                        isRedeUsuario: isRedeAtual($scope.origem.redeOrigem, 0, $scope),
                        ativo: false,
                        children: [],
                        nivel: 0,
                        visualizarNivel: false,
                        bloquearCampos: true
                    }];

                    $scope.demanda.encaminhamentosDemanda.forEach(function (encaminahmentos) {

                        if (encaminahmentos && encaminahmentos[0] && encaminahmentos[0].redeDestino) {

                            var nivel = 1;
                            // model do nó da arvore
                            var node = {
                                node: encaminahmentos[0],
                                treeId: 'node-' + encaminahmentos[0].id,
                                label: (!encaminahmentos[0].redeDestino.isSubRede) ? encaminahmentos[0].redeDestino.ouvidoria.nome : encaminahmentos[0].redeDestino.subrede.nome,
                                isAprovado: isAprovadoPeloGestor(encaminahmentos[0]),
                                isAguardandoAprovacao: isAguardandoAprovacao(encaminahmentos[0], $scope),
                                isRedeUsuario: isRedeAtual(encaminahmentos[0].redeDestino, nivel, $scope),
                                ativo: false,
                                children: [],
                                nivel: nivel,
                                bloquearCampos: (!encaminahmentos[0].temporario || $scope.bloquearCamposDepoisDeSalvar),
                                exiteResposta: isRepondido(encaminahmentos[0])
                            };

                            if (encaminahmentos.length > 1) {
                                for (var i = 1; i < encaminahmentos.length; i++) {
                                    var children = [{
                                        node: encaminahmentos[i],
                                        treeId: 'node-' + encaminahmentos[i].id,
                                        label: (!encaminahmentos[i].redeDestino.isSubRede) ? encaminahmentos[i].redeDestino.ouvidoria.nome : encaminahmentos[i].redeDestino.subrede.nome,
                                        isAprovado: isAprovadoPeloGestor(encaminahmentos[i]),
                                        isAguardandoAprovacao: isAguardandoAprovacao(encaminahmentos[i], $scope),
                                        isRedeUsuario: isRedeAtual(encaminahmentos[i].redeDestino, nivel, $scope),
                                        ativo: false,
                                        children: [],
                                        nivel: nivel++,
                                        bloquearCampos: (!encaminahmentos[i].temporario || $scope.bloquearCamposDepoisDeSalvar),
                                        exiteResposta: isRepondido(encaminahmentos[i])
                                    }];

                                    if (node.children.length == 0) {
                                        node.children = children;
                                    } else {
                                        var next = node.children[0];

                                        while (next.children && next.children.length > 0) {
                                            next = next.children[0];
                                        }

                                        next.children = children;
                                    }
                                }
                            }

                            arvore[0].children.push(node);
                        }
                    });

                    return arvore;
                };

                this.getOrigemEcaminhamento = function (encaminhamentoAtual, $scope) {
                    if ($scope.demanda.encaminhamentosDemanda.length == 0 || $scope.demanda.encaminhamentosDemanda[0].length == 0) {
                        // primeiro node
                        return encaminhamentoAtual;
                    } else {
                        // retorna o primeiro da lista
                        return $scope.demanda.encaminhamentosDemanda[0][0];
                    }
                };

                this.montarEstruturaDeFila = function (encaminhamentoAtual, $scope) {

                    if (encaminhamentoAtual == undefined) {
                        // ja esta como uma fila, modo como o servidor devolve
                        return;
                    } else if ($scope.origem.redeOrigem.id == encaminhamentoAtual.redeOrigem.id) {
                        // primeiro node
                        $scope.demanda.encaminhamentosDemanda[$scope.demanda.encaminhamentosDemanda.length] = [encaminhamentoAtual];
                    } else {

                        for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {

                            if ($scope.demanda.encaminhamentosDemanda[j]) {
                                for (var i = 0; i < $scope.demanda.encaminhamentosDemanda[j].length; i++) {


                                    if ($scope.demanda.encaminhamentosDemanda[j][i].redeDestino.id == encaminhamentoAtual.redeOrigem.id) {
                                        // adiciona na posicao correta
                                        $scope.demanda.encaminhamentosDemanda[j].push(encaminhamentoAtual);
                                        return;
                                    }
                                }
                            }
                        }
                    }
                };

                this.verificarDuplicidade = function (encaminhamentosDemanda, redeDestino) {

                    for (var j = 0; j < encaminhamentosDemanda.length; j++) {

                        if (encaminhamentosDemanda[j]) {
                            for (var i = 0; i < encaminhamentosDemanda[j].length; i++) {

                                if (redeDestino.isSubRede && encaminhamentosDemanda[j][i].redeDestino.subrede &&
                                    encaminhamentosDemanda[j][i].redeDestino.subrede.id == redeDestino.subrede.id) {
                                    // quando e uma subrede
                                    return true;
                                } else if (!encaminhamentosDemanda[j][i].redeDestino.isSubRede
                                    && encaminhamentosDemanda[j][i].redeDestino.id == redeDestino.id) {
                                    // quando e uma rede
                                    return true;
                                }
                            }
                        }
                    }

                    return false;
                };

                this.removeEncaminhamento = function ($scope, nodeSelecionado) {

                    for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {

                        for (var i = 0; i < $scope.demanda.encaminhamentosDemanda[j].length; i++) {

                            if ($scope.demanda.encaminhamentosDemanda[j][i].redeDestino.ouvidoria.id
                                == nodeSelecionado.node.redeDestino.ouvidoria.id) {

                                $scope.demanda.encaminhamentosDemanda[j].splice(i, 1);
                                return this.montarArvoreEncaminhamento($scope);
                            }
                        }
                    }
                };

                this.isEmpty = function ($scope) {

                    for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {
                        for (var i = 0; i < $scope.demanda.encaminhamentosDemanda[j].length; i++) {
                            return false;
                        }
                    }

                    return true;
                };

                this.removePosicoesVazia = function ($scope) {

                    var indexs = [];
                    for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {
                        if ($scope.demanda.encaminhamentosDemanda[j]) {
                            indexs.push($scope.demanda.encaminhamentosDemanda[j]);
                        }
                    }

                    if (indexs.length > 0) {
                        $scope.demanda.encaminhamentosDemanda = indexs;
                    }
                };

                this.getNodeAtual = function (encaminhamentoAtual, $scope) {

                    for (var i = 0; i < $scope.arvore[0].children.length; i++) {

                        var next = $scope.arvore[0].children[i];

                        while (next) {

                            if (encaminhamentoAtual) {
                                // tem o node da arvore
                                if (next.node.redeDestino.id == encaminhamentoAtual.redeDestino.id) {
                                    return next;
                                }
                            } else if (next.node.visualizarNivel) {
                                //procurando o node da arvore
                                return next;
                            }

                            next = next.children[0];
                        }
                    }
                };

                var verificarSeFoiEditado = function (encaminhamentos, retorno) {
                    for (var j = 0; j < encaminhamentos.length; j++) {
                        for (var i = 0; i < encaminhamentos[j].length; i++) {

                            if (encaminhamentos[j][i].isEditado) {

                                retorno.push({
                                    id: encaminhamentos[j][i].id,
                                    solicitaResposta: encaminhamentos[j][i].solicitaResposta,
                                    tipoEncaminhamento: encaminhamentos[j][i].tipoEncaminhamento,
                                    isEditado: true
                                });

                            }
                        }
                    }
                };

                var addEncaminhamentoOrigem = function (encaminahmento, retorno) {
                    // origem
                    if (encaminahmento.redeDestino.isSubRede) {
                        // caso for uma subrede
                        encaminahmento.isSubRede = true;
                        encaminahmento.subRedeDestino = encaminahmento.redeDestino.subrede;
                    }

                    retorno.push(encaminahmento);
                };

                var addEncaminhamentoPorNivel = function (encaminahmentos, retorno) {
                    angular.forEach(encaminahmentos, function(encaminahmento, index){
                        if(encaminahmento && encaminahmento.temporario){
                            if (encaminahmento.redeDestino.isSubRede) {
                                encaminahmento.isSubRede = true;
                                encaminahmento.subRedeDestino = encaminahmentos[0].redeDestino.subrede;
                            }
                            encaminahmento.encaminhamentoAnterior = {id: encaminahmentos[index-1].id};
                            retorno.push(encaminahmento);
                        }
                    });
                };

                this.getParametros = function ($scope) {

                    var encaminhamentos = [];

                    for (var j = 0; j < $scope.demanda.encaminhamentosDemanda.length; j++) {

                        if ($scope.demanda.encaminhamentosDemanda[j]) {

                            if (isOrigem($scope.demanda.encaminhamentosDemanda[j])) {

                                addEncaminhamentoOrigem($scope.demanda.encaminhamentosDemanda[j][0], encaminhamentos);

                            } else {

                                addEncaminhamentoPorNivel($scope.demanda.encaminhamentosDemanda[j], encaminhamentos);
                            }
                        }
                    }

                    verificarSeFoiEditado($scope.demanda.encaminhamentosDemanda, encaminhamentos);

                    return encaminhamentos;
                };

                this.modificarEstruturaSeHouveSubRede = function (encaminhamentos) {

                    /* metodo utilizado para adaptar a sub-rede a estrutura já montada para rede
                     converte para encaminhamento temporário  */

                    for (var i = 0; i < encaminhamentos.length; i++) {

                        if (encaminhamentos[i]) {

                            for (var j = 0; j < encaminhamentos[i].length; j++) {

                                if (encaminhamentos[i][j] && encaminhamentos[i][j].subRedeDestino) {

                                    var subRede = angular.copy(encaminhamentos[i][j].subRedeDestino);
                                    var rede = angular.copy(encaminhamentos[i][j].subRedeDestino.rede);

                                    delete subRede.rede;

                                    encaminhamentos[i][j].redeDestino = rede;
                                    encaminhamentos[i][j].redeDestino.isSubRede = true;
                                    encaminhamentos[i][j].redeDestino.subrede = subRede;
                                }
                            }
                        }
                    }
                };

                this.selecionarNodeAtual = function ($scope) {
                    var rede = comumService.getRedeAutenticada();
                    $scope.nodesSelecionados = [];
                    angular.forEach($scope.arvore, function (elem) {
                        navegarNodes(elem, rede.id, $scope);
                    });

                    if ($scope.nodesSelecionados.length > 0) {
                        var nodeAnterior = undefined;
                        angular.forEach($scope.nodesSelecionados, function (elem) {
                            elem.ativo = false;
                            if (nodeAnterior == undefined) {
                                elem.ativo = true;
                                nodeAnterior = elem;
                            } else {
                                if (elem.node.dataEncaminhamento >= nodeAnterior.node.dataEncaminhamento) {
                                    nodeAnterior.ativo = false;
                                    elem.ativo = true;
                                    $scope.nodeSelecionado = elem;
                                    nodeAnterior = elem;
                                }
                            }
                        });
                    } else {
                        $scope.nodeSelecionado = $scope.arvore[0].children[0];
                        $scope.nodeSelecionado.ativo = true;
                    }
                };

                var navegarNodes = function (elem, idRedeUsuarioLogado, $scope) {

                    if (elem.node.redeDestino.id == idRedeUsuarioLogado) {
                        $scope.nodeSelecionado = elem;
                        $scope.nodeSelecionado.ativo = true;
                        $scope.nodesSelecionados.push($scope.nodeSelecionado);
                    }

                    if (elem.children.length > 0) {
                        angular.forEach(elem.children, function (elem) {
                            navegarNodes(elem, idRedeUsuarioLogado, $scope);
                        });
                    }

                };

                var obterValidacaoChildren = function(node){
                    var validacao = {qt_node : 0};

                    angular.forEach(node.children, function (children) {
                        if(children){
                            validacao.qt_node++;
                        }
                    });

                    return validacao;
                };


                /**
                 *  Retorna Object com os validador da arvore
                 * @param {Object} tree o objeto arvore no $scope.
                 * @return {Object} validadorTree objeto com os status de validacoes da arvore
                 *
                 * tipo_encaminhamento:{            // Validacao por tipo de encaminhamento
                 *   qt_providencia: number,        // quantidade de encaminhamentos do tipo providencia
                 *   qt_conhecimento: number,       // quantidade de encaminhamentos do tipo conhecimento
                 *   qt_pendente_resposta: number,  // quantidade de encaminhamentos do tipo providencia com a opcao solicita resposta igual a sim que nao possuem resposta
                 *   pendentes_resposta: array      // array com os encaminhamentos pendentes de realizarem a resposta
                 * }
                 * root: [{                         // Validacao dos nos do primeiro nivel da arvore retorna array de object com os id's dos encaminhamentos add
                 *   id_children: number            // id encaminhamento add nivel root
                 * }],
                 * children: [{                     //
                 *   id: null,                      //
                 *   qt_nodes_children: 0           //
                 * }]
                 */
                this.processarStatusArvore = function (tree) {
                    var validador = {
                        tipo_encaminhamento: {
                            qt_providencia: 0,
                            qt_conhecimento: 0,
                            qt_pendente_resposta: 0,
                            pendentes_resposta: []
                        },
                        root: [],
                        children: []
                    };
                    var primeiroItem = !tree;

                    if(primeiroItem){
                        return validador;
                    }

                    var arvore = tree[0];

                    angular.forEach(arvore.children, function (root, index) {
                        if (root) {

                            var tipoProvidencia = root.node.tipoEncaminhamento == 'P';
                            tipoProvidencia ? validador.tipo_encaminhamento.qt_providencia++ : validador.tipo_encaminhamento.qt_conhecimento++;

                            var validacaoChildren = obterValidacaoChildren(root);
                            var validarProvidencia = tipoProvidencia && root.node.solicitaResposta == 'S';

                            if(validarProvidencia && validacaoChildren.qt_node <= 0){
                                validador.tipo_encaminhamento.qt_pendente_resposta++;
                                validador.tipo_encaminhamento.pendentes_resposta.push({
                                    id : root.node.id,
                                    isEditado: true,
                                    solicitaResposta: "N",
                                    tipoEncaminhamento: "P"
                                })
                            }

                            validador.root[index] = {
                                id_children: root.node.redeDestino.id
                            };

                            validador.children[index] = {
                                id: root.node.redeDestino.id,
                                qt_nodes_children: validacaoChildren.qt_node
                            };
                        }
                    });

                    return validador;
                };

            }]);

        return app;

    }
);
