/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalLocaisEncaminhamento", ['$modal', '$filter', 'manterRedeService',
        function ($modal, $filter, manterRedeService) {

            var abrir = function (redes, subRedes, filtro, callBack) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalLocaisEncaminhamento.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                     
                     $scope.filtro = filtro;
                     $scope.redes = [];
                     
                     var PRIMEIRO_NIVEL = 'I';
                     var SEGUNDO_NIVEL = 'II';
                     var TERCEIRO_NIVEL = 'III';
                     
                     var compare = function(parametros, idMunicipio, idUf, tipos, esfera){
                          var entrou = true; 
                          if(parametros.idMunicipio){
                                if(parametros.idMunicipio != idMunicipio){
                                  entrou = false;
                                }
                            }
                            
                            if(parametros.idUf){
                                if(parametros.idUf != idUf){
                                  entrou = false;
                                }
                            }
                            
                            if(parametros.tipos){
                                if(parametros.tipos != tipos){
                                  entrou = false;
                                }
                            }
                            
                            if(parametros.esfera){
                                if(parametros.esfera != esfera){
                                  entrou = false;
                                }
                            }
                            
                           return entrou;
                     };
                     
                     var pesquisar = function(){
                       
                        var parametros = {
                            idMunicipio: ($scope.filtro.municipio) ? $scope.filtro.municipio : undefined,
                            idUf: ($scope.filtro.uf) ? $scope.filtro.uf  : undefined,
                            nivel: ($scope.filtro.nivel) ? $scope.filtro.nivel  : undefined,
                            tipos: ($scope.filtro.tipo) ? [$scope.filtro.tipo]  : undefined,
                            esfera: ($scope.filtro.esfera) ? [$scope.filtro.esfera]  : undefined
                        }; 
                        
                        redes.forEach(function(rede){
                            var idMunicipio = rede.ouvidoria.endereco.municipio.id;
                            var idUf = rede.ouvidoria.endereco.municipio.uf.id;
                            var tipos = rede.ouvidoria.tipoOuvidoria.id;
                            var esfera = rede.ouvidoria.esferaAdministrativa.id;
                            var nivel = 1;
                            
                            // compare da rede
                            if(compare(parametros, idMunicipio, idUf, tipos, esfera)){
                                /* add rede */
                                rede.nivel = PRIMEIRO_NIVEL;
                                
                                if(!parametros.nivel || parametros.nivel == nivel){
                                      $scope.redes.push(rede);
                                }
                            }
                        });
                        
                        subRedes.forEach(function(subRede){
                            
                            if(!parametros.nivel || parametros.nivel == parseInt(subRede.nivel)){
                                /// converte a subRede em rede
                                // mantendo o mesmo fluxo do sistema
                        
                                var novaRede = angular.copy(subRede.rede);
                                
                                novaRede.isSubRede = true;
                                
                                novaRede.nivel = (subRede.nivel == 2) ? SEGUNDO_NIVEL
                                                : (subRede.nivel == 3) ? TERCEIRO_NIVEL 
                                                : subRede;
                                                
                               novaRede.subrede = subRede;
                               $scope.redes.push(novaRede);
                               
                             }
                        });
                     };
                     
                     $scope.titulo = $filter('translate')('titulo-modal-encaminhamento');
                     
                     $scope.fechar = function(){
                         $modalInstance.close();
                     };
                     
                     $scope.selecionarRede = function(rede){
                          callBack(rede);
                         $scope.fechar();
                     };
                     
                     pesquisar();
                     
                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
