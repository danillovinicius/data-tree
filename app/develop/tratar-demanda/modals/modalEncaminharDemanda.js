/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalEncaminharDemanda", ['$modal', '$rootScope', 'encaminhamentoDemandaService', 
                'msModalService', '$filter', 'modalEncaminhamentoRedeSemAcesso',
        function ($modal, $rootScope, encaminhamentoDemandaService, msModalService, $filter, 
                  modalEncaminhamentoRedeSemAcesso) {

            var abrir = function (scope, callBack) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalEncaminharDemanda.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                     
                    var ID_STATUS_AGUARDANDO_APROVACAO = 1;
                    var ID_STATUS_ENCAMINHAMENTO_DEMANDA = 1;
                    
                    $scope.fechar = function(){
                        $modalInstance.close();
                    };
                    
                    var abrirModalSemAcesso = function(encaminhamento){
                      modalEncaminhamentoRedeSemAcesso.abrir(encaminhamento, scope.demanda, function(retorno){
                          callBack(retorno);
                      });  
                    };
                    
                    var adicionar = function(encaminhamento){
                        $scope.fechar();
                        if(scope.filtro.possuiAcesso){
                             callBack(encaminhamento);
                        }else{
                            abrirModalSemAcesso(encaminhamento);
                        }
                    }
                    
                    var getEncaminhamentos = function(tipoEncaminhamento){
                        /* 
                            retorna um encaminhamento
                            retorna um node da arvore
                        */
                        return {
                                redeOrigem: $rootScope.usuarioAutenticado.redeSelecionada,
                                redeDestino: angular.copy(scope.filtro.redeDestino),
                                comentarioParecer: angular.copy(scope.filtro.comentarioParecer),
                                usuarioResponsavel: $rootScope.usuarioAutenticado,
                                solicitaResposta: 'S',
                                situacaoResposta: 'N',
                                tipoEncaminhamento: tipoEncaminhamento,
                                statusEncaminhamentoDemanda: {id: ID_STATUS_ENCAMINHAMENTO_DEMANDA},
                                situacaoAprovacaoGestor: {id: scope.demanda.encaminhamentosDemanda.length >= 1 ? ID_STATUS_AGUARDANDO_APROVACAO : undefined},
                                visualizarNivel: true,
                                possuiAcesso:  angular.copy(scope.filtro.possuiAcesso),
                                arquivos: angular.copy(scope.filtro.arquivos),
                                ouvidoria: $rootScope.usuarioAutenticado.redeSelecionada.ouvidoria,
                                tipoPrioridade: scope.filtro.tipoPrioridade,
                                temporario: true
                            };  
                    };
                   
                     $scope.conhencimento = function(){
                         adicionar(getEncaminhamentos('C'));
                     };
                     
                     var validaProvidencia = function(){
                        return scope.demanda.encaminhamentosDemanda.length > 0;
                     }
                     
                     $scope.providencia = function(){
                         
                       var encaminhamento = getEncaminhamentos('P');
                       
                       if(validaProvidencia()){
                           
                                msModalService.setOptions({
                                        title: $filter('translate')('aviso'),
                                        content: $filter('translate')('MC024'),
                                        buttons: {
                                            'Sim': {
                                                name: 'Sim',
                                                ngClick: function () {
                                                    
                                                    msModalService.close();
                                                    
                                                   adicionar(encaminhamento);
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
                        }else{
                            
                             adicionar(encaminhamento);
                        }
                        
                     };
                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
