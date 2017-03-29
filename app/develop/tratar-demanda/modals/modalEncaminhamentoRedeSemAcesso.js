/*global define*/
define(['app'], function (app) {

    "use strict";

    app.factory("modalEncaminhamentoRedeSemAcesso", ['$modal', 'encaminhamentoDemandaService', 
        'modeloDocumentoOficialService', '$rootScope', '$validator', 'comumService',
        'modalPreviaEmailEncaminhamento', 'arquivosUtils', '$q',  'ResourcesService', 
        'espelhoDemandaService',
        function ($modal, encaminhamentoDemandaService, modeloDocumentoOficialService, $rootScope, $validator,
                  comumService, modalPreviaEmailEncaminhamento, arquivosUtils,  $q, ResourcesService,
                  espelhoDemandaService) {

            var abrir = function (encaminhamento, demanda, callback) {
                $modal.open({
                    windowClass: 'tamanho-tela',
                    templateUrl: 'app/pages/tratar-demanda/views/modalEncaminhamentoRedeSemAcesso.tpl.html',
                    size: 'xm',
                    controller: function ($scope, $modalInstance) {
                        
                        $scope.filtro = encaminhamento;
                        
                        $scope.getUrlDownload = function(idArquivo){
                            return '/'+ResourcesService.resourceUrls.comum+'/arquivo/'+idArquivo;
                        };
                        
                        $scope.downloadArquivo = function(arquivo){
                            comumService.downloadBlobFromBase64(arquivo);
                        };
                        
                        $scope.fechar = function(){
                            $modalInstance.close();
                        };
                        
                        $scope.alterarTipoDocumento = function(){
                            $scope.filtroDocumento.modeloId = undefined;
                            $scope.documentoOficial = undefined;
                            $scope.espelhoDemanda = undefined;
                        };
                        
                        var validar = function(){
                            if($scope.filtroDocumento.tipoDocumentoOficial == 'M'
                                    || $scope.filtroDocumento.tipoDocumentoOficial == 'D'){
                               
                                if(!$scope.filtroDocumento.cargoFuncao
                                     || $scope.filtroDocumento.cargoFuncao.length == 0){
                                        comumService.enviaMensagemSobreCampoObrigatorio('cargo-funcao');
                                        return false;
                                }
                               
                            }
                            return true;
                        };
                        
                        var getParametros = function(){
                            return {
                                        nomeRede: $scope.filtro.ouvidoria.nome,
                                        responsavelPeloDestino: $scope.filtro.usuarioResponsavel.nome,
                                        cargoFuncao: $scope.filtroDocumento.cargoFuncao,
                                        tipoDocumentoOficial: $scope.filtroDocumento.tipoDocumentoOficial,
                                        numeroDocumento: $scope.filtroDocumento.numeroDocumento,
                                        modeloId: $scope.filtroDocumento.modeloId,
                                        demandaId: demanda.id,
                                        situacaoApresentaRodape: 'N',
                                        tipoModeloDocumentoGerado: 'G',
                                        dataCadastro: new Date()
                                    };  
                        };
                        
                        $scope.gerarModelo = function(){
                            
                            comumService.limpaMensagensDeObrigatoriedadePorIds['responsavel-pelo-destino', 'cargo-funcao'];
                         
                            $validator.validate($scope).success(function(){
                                if(validar()){
                                
                                    var params = getParametros();
            
                                    _.extend(params, {
                                        encaminhamentoDemanda: encaminhamento
                                    });
                                    
                                    var requestDocumento = encaminhamentoDemandaService.gerarDocumentoOficial(params);
                                    var requestEspelho =  espelhoDemandaService.gerarEspelhoDemandaDestinoBinario(demanda.id);
                                                                            
                                    $q.all([requestDocumento, requestEspelho]).then(function(res){
                                        
                                        res.forEach(function(arquivo){
                                            arquivo.resultado.arquivoBinario.encode = arquivo.resultado.arquivoBinario.binario;
                                            arquivo.resultado.arquivoBinario.binario = undefined;
                                        });
                                        
                                        if(res[0]){
                                            $scope.documentoOficial = res[0].resultado;
                                        }
                                        
                                        if(res[1]){
                                            $scope.espelhoDemanda = res[1].resultado;
                                        }
                                    }, function(error){
                                        comumService.enviaMensagemSobreCampo('gerar-documento', error.data.mensagens[0].texto);
                                    });
                                }
                                
                            });
                        };
                        
                        var editarEncaminhamento = function(){
                            modalPreviaEmailEncaminhamento.abrir(encaminhamento, demanda,
                                        $scope.filtroDocumento, false, function(acao){ 
                                            
                                            callback(encaminhamento);
                           });
                        };
                        
                        $scope.adicionarEncaminahmento = function(){
                            
                            $validator.validate($scope).success(function(){
                                
                                if(!$scope.documentoOficial){
                                   return;
                                }
                                
                                encaminhamento.arquivos.push($scope.documentoOficial);
                                encaminhamento.documentoOficial = getParametros();
                                encaminhamento.documentoOficial.nome = $scope.documentoOficial.nomeArquivo;
                                encaminhamento.documentoOficial.arquivoAnexo = angular.copy($scope.documentoOficial);
                                
                                if($scope.espelhoDemanda){
                                    encaminhamento.arquivos.push($scope.espelhoDemanda);
                                }
                                
                                modalPreviaEmailEncaminhamento.abrir(encaminhamento,  demanda,
                                        $scope.filtroDocumento, true, function(acao){
                                            
                                        if(acao == 'EDITAR'){
                                            editarEncaminhamento();
                                        }else{
                                            callback(encaminhamento);
                                        }
                                });
                                
                                $scope.fechar();
                                
                            });
                        };
                        
                        $scope.excluirArquivo = function(nameModel){
                            $scope[nameModel] = undefined;
                        };
                        
                        var init = function(){
                            
                            $scope.filtroDocumento = {};
                            
                            var tipoDocumento = modeloDocumentoOficialService.pesquisarTipoDocumento()
                                .then(function(resposta){
                                $scope.tipoDocumentosGerados = resposta.resultado;
                            });
                            
                            var modelos = modeloDocumentoOficialService.pesquisarModeloDeDocumentos()
                                .then(function(resposta){
                                   $scope.modeloDocumetos = resposta.resultado;
                                   $rootScope.$msNotify.close();
                            });
                            
                            var email = encaminhamentoDemandaService.recuperaEmailRedeDestino($scope.filtro.redeDestino.id)
                                .then(function(resposta){
                                    $scope.filtroDocumento.email = resposta.resultado;
                                    $scope.email = $scope.filtroDocumento.email; 
                                    $scope.acao = 'S';    
                            });
                            
                            $q.all([tipoDocumento, modelos, email]);
                        }
                        
                        init();
                    }
                });
            };

            return {
                abrir: abrir
            };
        }]);
});
