/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalReaproveitarAnexo", ['$modal', 'encaminhamentoDemandaService', 'ResourcesService',
        function ($modal, encaminhamentoDemandaService, ResourcesService) {

            var abrir = function (demandaId, callBack) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalReaproveitrarAnexo.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                        
                        
                        $scope.getUrlDownload = function(idArquivo){
                            return '/'+ResourcesService.resourceUrls.comum+'/arquivo/'+idArquivo;
                        };
                    
                        $scope.todos = {};
                        
                        $scope.fechar = function () {
                            $modalInstance.close();
                        };
                        
                        $scope.selecionarTodos = function(){
                          $scope.arquivos.forEach(function(arquivo){
                              arquivo.selected = $scope.todos.selected;
                          });
                        };
                        
                        $scope.confirmar = function(){
                            var selected = [];
                            $scope.arquivos.forEach(function(arquivo){
                              if(arquivo.selected){
                                  selected.push(arquivo);
                              } 
                          });
                          
                          callBack(selected);
                          $scope.fechar();
                        };                     
                        
                        var recuperarArquivos = function(){
                            encaminhamentoDemandaService.pesquisarArquivosNaoCompartilhados(demandaId)
                                    .then(function(resposta){
                                $scope.arquivos = resposta.resultado;      
                            }); 
                        };
                        
                        recuperarArquivos();
                        
                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
